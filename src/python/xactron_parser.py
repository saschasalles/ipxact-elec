import ipyxact.ipyxact
import sys
import json
import copy
from pathlib import Path


class XactronParser:
    project = {}
    funcs = []
    blocks = []
    registers = []
    fields = []
    evs = []

    def __init__(self, parseData=None, path=None, writeMode=False):
        super().__init__()
        self.component = ipyxact.ipyxact.Component()
        self.writeMode = writeMode
        self.path = path
        # Parse & Write Mode
        if parseData != None:
            newData = json.loads(parseData)
            self.file_info(newData['project'])
            self.parse(newData)

        else:
        # Read Mode
            self.component.load(path)
            self.memoryMaps = self.component.memoryMaps.memoryMap
            self.file_info()
            self.parse()

    def file_info(self, project=None):
        if project == None:
            # Read Mode
            self.project = {
                "fileName": Path(self.path).stem,
                "name": self.component.library,
                "version": self.component.version,
                "description": self.component.name,
                "company": self.component.vendor,
                "path": self.path
            }

            for memoryMap in self.memoryMaps:
                if memoryMap.addressUnitBits != None:
                    self.project["addressUnitBits"] = memoryMap.addressUnitBits
                    break
        else:
            # Write Mode
            self.component.name = project['_description']
            self.component.version = project['_version']
            self.component.vendor = project['_company']
            self.component.library = project['_projectName']


    def writeComponent(self):
        pass
        # if self.path is not None:
        #     path = self.path
        #     f = open(path, "w")
        #     component.write(f)
        #     f.close()

    def parse(self, data=None):
        if data == None:
            # Read Mode
            for memoryMap in self.memoryMaps:
                for func in memoryMap.addressBlock:
                    if func.vendorExtensions != None:
                        funcDic = {
                            "name": func.name,
                            "baseAddress": func.baseAddress,
                            "size": func.range,
                            "width": func.width,
                            "id": func.vendorExtensions.funcId
                        }
                        self.funcs.append(funcDic)
                        self.rw_registers(func)
                        self.rw_blocks(func)
        else:
            # Parse & Write Mode
            self.component.memoryMaps = ipyxact.ipyxact.MemoryMaps()
            self.memoryMap = ipyxact.ipyxact.MemoryMap()
            self.memoryMap.name = "RegisterMap"
            self.memoryMap.addressUnitBits = data['project']['_addressBits']
            self.component.memoryMaps.memoryMap.append(self.memoryMap)
            self.w_funcs(data)
            # Write 
            if self.writeMode == True:
                self.writeComponent()
            

    def w_funcs(self, data):
        addressBlocks = []
        for func in data['funcs']:
            addressBlock = ipyxact.ipyxact.AddressBlock()
            addressBlock.name = func['_name']
            addressBlock.width = func['_width']
            addressBlock.baseAddress = func['_baseAddress']
            vendExt = ipyxact.ipyxact.VendorExtensions()
            vendExt.funcId = func['_id']
            vendExt.isBlock = 0
            addressBlock.vendorExtensions = vendExt
            addressBlocks.append(addressBlock)
            self.rw_blocks(addressBlock, data)
            self.rw_registers(addressBlock, data)
        self.memoryMap.addressBlock = addressBlocks

    def rw_blocks(self, func, data=None):
        if data == None:
            # Read Mode
            for block in func.memoryBlockData:
                if block.vendorExtensions != None:
                    blockDic = {
                        "name": block.name,
                        "description": block.description,
                        "baseAddress": block.vendorExtensions.baseAddress,
                        "size": block.vendorExtensions.size,
                        "width": block.vendorExtensions.width,
                        "id": block.vendorExtensions.blockId,
                        "parentFuncId": func.vendorExtensions.funcId
                    }
                    self.blocks.append(blockDic)
        else:
            # Write Mode
            funcId = func.vendorExtensions.funcId
            blocks = []
            for block in data['blocks']:
                newBk = ipyxact.ipyxact.MemoryBlockData()
                if block['_parentFunc'] == funcId:
                    newBk.name = block['_name']
                    newBk.description = block['_description']
                    vendExt = ipyxact.ipyxact.VendorExtensions()
                    vendExt.blockId = block['_id']
                    vendExt.size = block['_size']
                    vendExt.width = block['_width']
                    vendExt.baseAddress = block['_baseAddress']
                    newBk.vendorExtensions = vendExt
                    blocks.append(newBk)
            func.memoryBlockData = blocks

    def rw_registers(self, func, data=None):
        if data == None:
            # Read Mode
            for reg in func.register:
                if reg.vendorExtensions != None:
                    registerDic = {
                        "name": reg.name,
                        "description": reg.description,
                        "access": reg.access,
                        "addressOffset": reg.addressOffset,
                        "size": reg.size,
                        "dim": reg.dim,
                        "dimOffset": reg.vendorExtensions.dimOffset,
                        "id": reg.vendorExtensions.regId,
                        "parentFuncId": func.vendorExtensions.funcId,
                        "duplicateNb": reg.vendorExtensions.duplicateNb,
                        "lastDuplicateIndex": reg.vendorExtensions.lastDuplicateIndex,
                        "isHidden": bool(reg.vendorExtensions.regIsHidden),
                        "defaultValue": reg.vendorExtensions.regDefaultValue,
                        "mask": reg.vendorExtensions.regMask
                    }
                    self.registers.append(registerDic)
                    self.rw_fields(reg)

        else:
            # Write Mode
            funcId = func.vendorExtensions.funcId
            registers = []
            for reg in data['regs']:
                newReg = ipyxact.ipyxact.Register()
                if reg['_parentFunctionId'] == funcId:
                    newReg.name = reg['_name']
                    newReg.description = reg['_description']
                    newReg.access = reg['_access']
                    newReg.addressOffset = reg['_address']
                    newReg.dim = reg['_dim']
                    newReg.size = func.width
                    vendExt = ipyxact.ipyxact.VendorExtensions()
                    vendExt.regId = reg['_id']
                    vendExt.duplicateNb = reg['_duplicateNb']
                    vendExt.lastDuplicateIndex = reg['_lastDuplicateIndex']
                    vendExt.regIsHidden = int(reg['_isHidden'])
                    vendExt.regDefaultValue = reg['_defaultValue']
                    vendExt.regMask = reg['_mask']
                    vendExt.dimOffset = reg['_dimOffset']
                    newReg.vendorExtensions = vendExt
                    self.rw_fields(newReg, reg["_id"], data)
                    registers.append(newReg)

            func.register = registers

    def rw_fields(self, register, registerId=None, data=None):
        if data == None and registerId == None:
            # Read Mode
            for field in register.field:
                if field.vendorExtensions != None:
                    fieldDic = {
                        "name": field.name,
                        "description": field.description,
                        "bitOffset": field.bitOffset,
                        "bitWidth": field.bitWidth,
                        "access": field.access,
                        "defaultValue": field.value,
                        "parentRegisterId": register.vendorExtensions.regId,
                        "id": field.vendorExtensions.fieldId
                    }
                    self.fields.append(fieldDic)
                    self.rw_evs(field)
        else:
            # Write Mode
            regId = registerId
            fields = []
            for field in data['fields']:
                if field['_parentRegID'] == regId:
                    newField = ipyxact.ipyxact.Field()
                    newField.name = field['_name']
                    newField.description = field['_description']
                    newField.access = field['_access']
                    newField.bitOffset = field['_posl']
                    newField.bitWidth = field['_posh'] - field['_posl'] + 1
                    newField.value = field['_defaultValue']
                    vendExt = ipyxact.ipyxact.VendorExtensions()
                    vendExt.fieldId = field['_id']
                    newField.vendorExtensions = vendExt
                    self.rw_evs(newField, field["_id"], data)
                    fields.append(newField)
            register.field = fields

    def rw_evs(self, field, fieldId=None, data=None):

        if data == None and fieldId == None:
            pass
            # Read Mode
            for evs in field.enumeratedValues:
                for ev in evs.enumeratedValue:
                    if ev.vendorExtensions != None:
                        evDic = {
                            "name": ev.name,
                            "description": ev.description,
                            "value": ev.value,
                            "id": ev.vendorExtensions.evId,
                            "parentFieldId": ev.vendorExtensions.fieldId
                        }
                        self.evs.append(evDic)
        else:
            # Write Mode
            evs = []
            enumeratedValues = ipyxact.ipyxact.EnumeratedValues()
            for ev in data['evs']:
                if ev['_parentFieldID'] == fieldId:
                    newEv = ipyxact.ipyxact.EnumeratedValue()
                    newEv.name = ev['_name']
                    newEv.description = ev['_description']
                    newEv.value = ev['_value']
                    vendExt = ipyxact.ipyxact.VendorExtensions()
                    vendExt.fieldId = fieldId
                    vendExt.evId = ev['_id']
                    newEv.vendorExtensions = vendExt
                    evs.append(newEv)

            enumeratedValues.enumeratedValue = evs
            field.enumeratedValues = [enumeratedValues]


    def jsonify(self):
        dic = {
            "project": self.project,
            "funcs": self.funcs,
            "blocks": self.blocks,
            "regs": self.registers,
            "fields": self.fields,
            "evs": self.evs
        }
        return json.dumps(dic)
    
    # def getComponent(self):
    #     return self.component


path = sys.argv[1]
if len(sys.argv) == 2:
    parser = XactronParser(None, path, None)
    print(parser.jsonify())
elif len(sys.argv) == 3:
    writer = XactronParser(sys.argv[2], path, True)

