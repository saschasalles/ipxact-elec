# Used in order to keep a versionned file of the yaml used by the IPYXACT parser

description = """
---
abstractionType:
  ATTRIBS:
    vendor:  str
    library: str
    name:    str
    version: str
addressBlock:
  MEMBERS:
    name: str
    displayName: str
    description: str
    baseAddress: IpxactInt
    range: IpxactInt
    width: IpxactInt
    access: str
    usage: str
  CHILD:
    - vendorExtensions
  CHILDREN:
    - register
    - memoryBlockData
alternateRegister:
  MEMBERS:
    name: str
    description: str
    access: str
    addressOffset: IpxactInt
    size: IpxactInt
    volatile: IpxactBool
  CHILDREN:
    - field
alternateRegisters:
  CHILDREN:
    - alternateRegister
busInterface:
  MEMBERS:
    name:           str
    master:         str
    mirroredMaster: str
    slave:          str
  CHILD:
    - abstractionType
    - busType
    - portMaps
busInterfaces:
  CHILDREN:
    - busInterface
busType:
  ATTRIBS:
    vendor:  str
    library: str
    name:    str
    version: str
component:
  MEMBERS:
    description: str
    vendor:  str
    library: str
    name:    str
    version: str
  CHILD:
    - busInterfaces
    - fileSets
    - memoryMaps
    - model
    - parameters
enumeratedValue:
  MEMBERS:
    name: str
    description: str
    value: IpxactInt
  CHILD:
    - vendorExtensions
enumeratedValues:
  CHILDREN:
    - enumeratedValue
reset:
  MEMBERS:
    value: IpxactInt
resets:
  CHILD:
    - reset
field:
  MEMBERS:
    name: str
    description: str
    bitOffset: IpxactInt
    bitWidth: IpxactInt
    value: IpxactInt
    modifiedWriteValue: str
    readAction: str
    testable: str
    volatile: IpxactBool
    access: str
  CHILD:
    - resets
    - vendorExtensions
  CHILDREN:
    - enumeratedValues
file:
  MEMBERS:
    name: str
    fileType: str
    isIncludeFile: IpxactBool
    logicalName: str
fileSet:
  MEMBERS:
    name: str
  CHILDREN:
    - file
fileSets:
  CHILDREN:
    - fileSet
logicalPort:
  MEMBERS:
    name: str
  CHILD:
    - vector
memoryBlockData:
  MEMBERS:
    name: str
    description: str
  CHILD:
    - vendorExtensions
memoryMap:
  MEMBERS:
    name: str
    displayName: str
    description: str
    addressUnitBits: IpxactInt
  CHILDREN:
    - addressBlock
memoryMaps:
  CHILDREN:
    - memoryMap
model:
  CHILD:
    - ports
parameters:
  CHILDREN:
    - parameter
parameter:
  ATTRIBS:
    parameterId: str
  MEMBERS:
    name: str
    value: IpxactInt
    displayName: str
physicalPort:
  MEMBERS:
    name: str
  CHILD:
    - vector
port:
  MEMBERS:
    name: str
  CHILD:
    - wire
ports:
  CHILDREN:
    - port
portMap:
  CHILD:
    - logicalPort
    - physicalPort
portMaps:
  CHILDREN:
    - portMap
register:
  MEMBERS:
    name: str
    description: str
    access: str
    addressOffset: IpxactInt
    size: IpxactInt
    dim: IpxactInt
    volatile: IpxactBool
    isPresent: str
  CHILDREN:
    - field
  CHILD:
    - alternateRegisters
    - reset
    - vendorExtensions
vector:
  MEMBERS:
    left:  IpxactInt
    right: IpxactInt
vendorExtensions:
  MEMBERS:
    funcId: str
    regId: str
    fieldId: str
    blockId: str
    evId: str
    regIsHidden: IpxactInt
    regDefaultValue: IpxactInt
    dimOffset: IpxactInt
    size: IpxactInt
    width: IpxactInt
    baseAddress: IpxactInt
    duplicateNb: IpxactInt
    lastDuplicateIndex: IpxactInt
    regMask: IpxactInt
wire:
  MEMBERS:
    direction: str
  CHILD:
    - vector
"""
