import sys
from cx_Freeze import setup, Executable

# Dependencies are automatically detected, but it might need fine tuning.

build_exe_options = {}

# base="Win32GUI" should be used only for Windows GUI app
base = None
if sys.platform == "win32":
    base = "Win32GUI"

setup(
    name = "XactronDecoder",
    version = "0.1",
    description = "Xactron Python Parser for Xactron Electron JS GUI",
    options = {"build_exe": build_exe_options},
    executables = [Executable("parser.py", base=base)]
)