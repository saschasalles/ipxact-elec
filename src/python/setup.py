import sys
from cx_Freeze import setup, Executable

# Dependencies are automatically detected, but it might need fine tuning.

build_exe_options = {}

# base="Win32GUI" should be used only for Windows GUI app
base = None
if sys.platform == "win32":
    base = "Win32GUI"

setup(
    name = "XactronVHDL",
    version = "0.1",
    description = "Xactron Python VHDL Export for Xactron Electron JS GUI",
    options = {"build_exe": build_exe_options},
    executables = [Executable("export_vhdl.py", base=base)]
)