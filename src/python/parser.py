import ipyxact.ipyxact
import sys
import json
import copy


class XactronParser:
    project = {}
    funcs = []
    blocks = []
    registers = []
    fields = []
    evs = []

    def __init__(self, path, writeData=None):
        super().__init__()
        self.path = path
        self.component = ipyxact.ipyxact.Component()
        if writeData != None:
            newData = json.loads(writeData)
            self.f = open(path, "w")
            self.file_info(newData['project'])
            self.parse(newData)

        else:
            self.component.load(path)
            self.memoryMaps = self.component.memoryMaps.memoryMap
            self.file_info()
            self.parse()

    def file_info(self, project=None):
        if project == None:
            self.project = {
                "name": self.component.name,
                "version": self.component.version,
                "description": self.component.description,
                "vendor": self.component.vendor,
                "library": self.component.library,
                "path": self.path
            }

            for memoryMap in self.memoryMaps:
                if memoryMap.addressUnitBits != None:
                    self.project["addressUnitBits"] = memoryMap.addressUnitBits
                    break
        else:
            self.component.name = project['_projectName']
            self.component.version = project['_version']
            self.component.vendor = project['_company']
            self.component.name = project['_description']
            self.component.library = project['_projectName']

    def parse(self, data=None):
        if data == None:
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
            self.component.memoryMaps = ipyxact.ipyxact.MemoryMaps()
            self.memoryMap = ipyxact.ipyxact.MemoryMap()
            self.memoryMap.name = "RegisterMap"
            self.memoryMap.addressUnitBits = data['project']['_addressBits']
            self.component.memoryMaps.memoryMap.append(self.memoryMap)
            self.w_funcs(data)
            self.component.write(self.f)

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
            for reg in func.register:
                if reg.vendorExtensions != None:
                    registerDic = {
                        "name": reg.name,
                        "description": reg.description,
                        "access": reg.access,
                        "addressOffset": reg.addressOffset,
                        "size": reg.size,
                        "id": reg.vendorExtensions.regId,
                        "parentFuncId": func.vendorExtensions.funcId
                    }
                    self.registers.append(registerDic)
                    self.rw_fields(reg)

        else:
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
                    newReg.vendorExtensions = vendExt
                    self.rw_fields(newReg, reg["_id"], data)
                    registers.append(newReg)

            func.register = registers

    def rw_fields(self, register, registerId=None, data=None):
        if data == None and registerId == None:
            for field in register.field:
                if field.vendorExtensions != None:
                    fieldDic = {
                        "name": field.name,
                        "description": field.description,
                        "bitOffset": field.bitOffset,
                        "bitWidth": field.bitWidth,
                        "access": field.access,
                        "parentRegisterId": register.vendorExtensions.regId,
                        "id": field.vendorExtensions.fieldId
                    }
                    self.fields.append(fieldDic)
                    self.rw_evs(field)
        else:
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
                    vendExt = ipyxact.ipyxact.VendorExtensions()
                    vendExt.fieldId = field['_id']
                    newField.vendorExtensions = vendExt
                    fields.append(newField)
            register.field = fields

    def rw_evs(self, field):
        for ev in field.enumeratedValues:
            if ev.vendorExtensions != None:
                evDic = {
                    "name": ev.name,
                    "description": ev.description,
                    "value": ev.value,
                    "id": ev.vendorExtensions.evId,
                    "parentFieldId": ev.vendorExtensions.fieldId
                }
                self.evs.append(evDic)

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


path = sys.argv[1]
if len(sys.argv) == 2:
    parser = XactronParser(path)
    print(parser.jsonify())
elif len(sys.argv) == 3:
    writer = XactronParser(path, sys.argv[2])
