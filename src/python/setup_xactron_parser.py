import sys
from cx_Freeze import setup, Executable

setup(
    name="XactronParser",
    version="0.1",
    description="Xactron Python Parser for Xactron Electron JS GUI",
    executables=[Executable("xactron_parser.py")]
)
