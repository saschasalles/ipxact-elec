import ipyxact.ipyxact
import sys
import json

path = sys.argv[1]


class XactronWriter:
    
    def __init__(self, path):
        super().__init__()
        self.path = path
        self.component = ipyxact.ipyxact.Component()
        self.component.load(path)
        f = open("/Users/saschasalles/Desktop/test.xml", "w")
        self.component.name = "NOUVEAU_COMPONENT"
        self.component.write(f)
        self.memoryMaps = self.component.memoryMaps.memoryMap
        self.file_info()
        self.parse()

    def file_info(self):
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

    def parse(self):
        for memoryMap in self.memoryMaps:
            for func in memoryMap.addressBlock:
                if func.vendorExtensions != None:
                    if not func.vendorExtensions.isBlock:
                        funcDic = {
                            "name": func.name,
                            "baseAddress": func.baseAddress,
                            "size": func.range,
                            "width": func.width,
                            "id": func.vendorExtensions.funcId
                        }
                        self.funcs.append(funcDic)
                        self.fetch_registers(func)
                    else:
                        blockDic = {
                            "name": func.name,
                            "baseAddress": func.baseAddress,
                            "size": func.range,
                            "width": func.width,
                            "description": func.description,
                            "parentFuncId": func.vendorExtensions.funcId,
                            "id": func.vendorExtensions.blockId
                        }
                        self.blocks.append(blockDic)

    def fetch_registers(self, func):
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
                self.fetch_fields(reg)

    def fetch_fields(self, register):
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
                self.fetch_evs(field)

    def fetch_evs(self, field):
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


parser = XactronParser(path)
print(parser.jsonify())
