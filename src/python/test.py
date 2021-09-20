import ipyxact.ipyxact

f = open("/Users/saschasalles/Desktop/out.xml", "w")
component = ipyxact.ipyxact.Component()
component.name = "testname"
component.version = "1.0"
component.description = "desc"
component.vendor = "BIG COMPANY"
component.library = "library"

component.memoryMaps = ipyxact.ipyxact.MemoryMaps()
memoryMap = ipyxact.ipyxact.MemoryMap()
memoryMap.name = "RegisterMap"
memoryMap.addressUnitBits = 32
component.memoryMaps.memoryMap.append(memoryMap)

addressBlock = ipyxact.ipyxact.AddressBlock()
addressBlock.name = "FUNC"
addressBlock.width = 32
addressBlock.baseAddress = 2684485632

register1 = ipyxact.ipyxact.Register()
register1.name = "REG1"
register1.description = "desc"
register1.access = "read-write"
register1.addressOffset = 0
register1.dim = 0

type(addressBlock.register)
addressBlock.register = [register1]

memoryMap.addressBlock.append(addressBlock)

addressBlock2 = ipyxact.ipyxact.AddressBlock()
addressBlock2.name = "FUNC2"
addressBlock2.width = 24
addressBlock2.baseAddress = 2684485631

memoryMap.addressBlock.append(addressBlock2)
component.write(f)
