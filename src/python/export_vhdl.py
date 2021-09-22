import os
from vhdl_tools import *
from xactron_parser import XactronParser
import sys
sys.path.append(".")


class ExportVHDL():
    def __init__(self, path, data):
        self.path = path
        parser = XactronParser(data, None, False)
        self.component = parser.component
        self.memoryMaps = self.component.memoryMaps.memoryMap

    def write(self):
        for memoryMap in self.memoryMaps:
            for addressSpace in memoryMap.addressBlock:
                # Init Directories
                funcDirectory = path + "/" + addressSpace.name.lower() + "/"
                if not os.path.exists(funcDirectory):
                    os.mkdir(funcDirectory)
                hdlDirectory = funcDirectory + "/hdl"
                if not os.path.exists(hdlDirectory):
                    os.mkdir(hdlDirectory)
                # Init Files
                self.pkg = hdlDirectory + "/register_" + addressSpace.name.lower() + "_pkg.vhd"
                self.registers = hdlDirectory + "/registers_" + addressSpace.name.lower() + \
                    ".vhd"
                if memoryMap.addressUnitBits != None:
                    self.writePkgFile(addressSpace, memoryMap.addressUnitBits)
                self.writeRegFile(addressSpace)

    def writePkgFile(self, addressSpace, addressUnitBits):
        filePkg = open(self.pkg, "w", encoding="utf8")
        write_header_pkg(filePkg, addressSpace.name.lower())
        write_global_parameters(filePkg, addressSpace.width, addressUnitBits)
        for register in addressSpace.register:
            write_register_definition(
                filePkg,
                addressUnitBits,
                addressSpace.width,
                register
            )
        write_register_list(filePkg, addressSpace)
        write_end_pkg(filePkg, addressSpace.name)
        write_pkg_body(filePkg, addressSpace.name)
        write_initFlag(filePkg, addressSpace)
        write_initIsModified(filePkg, addressSpace)
        for register in addressSpace.register:
            write_procedure_body(filePkg, addressSpace.width, register)
        write_end_pkg_body(filePkg, addressSpace.name)
        filePkg.close()

    def writeRegFile(self, addressSpace):
        fileRegisters = open(self.registers, "w", encoding="utf8")
        write_header_entity(fileRegisters, addressSpace.name)
        write_arch(fileRegisters, addressSpace)
        fileRegisters.close()


path = sys.argv[1]
data = sys.argv[2]

exportVHDL = ExportVHDL(path, data)
exportVHDL.write()
