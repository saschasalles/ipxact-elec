def write_hexa(value, size):
    print(value, size)
    # 0xff => 8Ux"00FF"
    # 1 => '1'
    if size == 1:
        return "'{}'".format(int(value[-1], 16))
    else:
        return '{}Ux"'.format(size) + '{:0{padding}x}'.format(int(value,16),padding=int(size/4)) + '"'


def write_indent(file, indent, text, comment=''):
    file.write(' ' * indent + text)
    if comment:
        if (len(text)+indent) < 80:
            file.write(' ' * (80 - (len(text)+indent)) +
                       '{}\n'.format('/* ' + comment + ' */'))
        else:
            file.write('{}\n'.format('/* ' + comment + ' */'))
    else:
        file.write('\n')


def add_separator(file, indent):
    write_indent(file, indent, '-' * 80)


def write_header_pkg(file, name, included_package=''):
    header = """\
/* 
 ******************************************************************************************
 * This program is the Confidential and Proprietary product of THALES.                    *
 * Any unauthorized use, reproduction or transfer of this program is strictly prohibited. *
 * Copyright (c) 2021 THALES DMS FRANCE. All Rights Reserved.                             *
 ******************************************************************************************
*/
    
library ieee;
use     ieee.std_logic_1164.all;
use     ieee.numeric_std.all;

"""

    header += included_package
    header += "\npackage register_{}_pkg is".format(name) + '\n'*2
    file.write(header)


def write_header_entity(file, funcName):
    header = """\
/* 
******************************************************************************************
* This program is the Confidential and Proprietary product of THALES.                    *
* Any unauthorized use, reproduction or transfer of this program is strictly prohibited. *
* Copyright (c) 2021 THALES DMS FRANCE. All Rights Reserved.                             *
******************************************************************************************
*/
    
library ieee;
use     ieee.std_logic_1164.all;
use     ieee.numeric_std.all;
library {0};
use     {0}.register_{0}_pkg.all;
library exported;
use     exported.apb3_pkg.all;


entity registers_{0} is
  port(
    -- Horloge bus APB
    pclk        : in  std_logic;
    -- Reset actif à l'état bas
    presetn     : in  std_logic;
    -- Signaux en provenance du master
    apb_from_master : in  apb3_master_to_slave_typ;
    -- Signaux à destination du master
    apb_to_master   : out apb3_slave_to_master_typ;
    -- Définition de l'interface d'échanges avec le module associé
    -- Données d'exploitation du module
    reg_write   : in  T_{1}_REG;
    -- Données de controle du module
    reg_read    : out T_{1}_REG
  );
end entity registers_{0};

""".format(funcName.lower(), funcName.upper())
    file.write(header)


def write_arch(file, addressSpace):
    header = """\
architecture rtl of registers_{0} is

begin

  -- Gestion des registres en lecture/ecriture depuis le soft
  -- ainsi que la cohérence entre les deux bus registres
  p_gestion_config : process(pclk, presetn)
    -- Variable pour identifier en cas de lecture que l'adresse
    -- correspond bien à une des adresses renseignées
    variable write_out_of_range : boolean;
    -- Variable contenant la valeur lue
    variable prdata_v           : std_logic_vector((REG_SIZE - 1) downto 0);
    -- Variabke temporaire pour l'écriture en registre
    variable temp               : std_logic_vector((REG_SIZE - 1) downto 0);
  begin
    if presetn = '0' then
      apb_to_master.prdata  <= (others => '0');
      apb_to_master.pslverr <= '0';
      apb_to_master.pready  <= '0';

      --Initialisation des registres
      reg_read <= C_{1}_REG_DEFAULT;

      write_out_of_range := true;
      prdata_v           := (others => '0');
      temp               := (others => '0');

    elsif rising_edge(pclk) then
      initFlag(reg_read);
      -- Remise à 0 du signal de validité
      apb_to_master.pready             <= '0';
      -- remise à zero du signal d'erreur APB
      apb_to_master.pslverr            <= '0';
      -- Par défaut aucune adresse est considérée comme atteinte
      write_out_of_range := true;

    """.format(addressSpace.name.lower(), addressSpace.name.upper())
    file.write(header)
    file.write("\n")

    for register in addressSpace.register:
        add_separator(file, 6)
        write_indent(
            file, 6, "--  Ecriture du registre {}".format(register.name.upper()))
        add_separator(file, 6)
        if register.dim > 1:
            write_indent(
                file, 6, "for i in 0 to {} loop".format(register.dim - 1))
            write_indent(file, 8, "if (apb_from_master.paddr = std_logic_vector(unsigned(P_{0}.addr) + to_unsigned(to_integer(i * unsigned(P_{0}.dimOffset)), {1}))) and (apb_from_master.psel = '1') and (apb_from_master.pwrite = '1') and (apb_from_master.penable = '1') then".format(
                register.name.upper(), addressSpace.width))
            write_indent(file, 10, "write_out_of_range := false;")
            if register.access == "write-only":
                write_indent(file, 10, "{0}_records_to_array(reg_read.{0},i, temp);".format(
                    register.name.lower()))
                write_indent(file, 10, "temp := (apb_from_master.pwdata and P_{0}.mask) or (temp and not (P_{0}.mask));".format(
                    register.name.upper()))
                write_indent(file, 10, "{0}_array_to_records(temp, reg_read.{0},i);".format(
                    register.name.lower()))
                write_indent(file, 10, "reg_read.{0}(i).isWritten <= true;".format(
                    register.name.lower()))
            else:
                write_indent(
                    file, 10, "-- Signalement de l'erreur sur un registre en lecture seule")
                write_indent(file, 10, "apb_to_master.pslverr <= '1';")
            write_indent(
                file, 10, "-- Activer apb_to_master.pready pour confirmation de l'écriture")
            write_indent(file, 10, "apb_to_master.pready             <= '1';")

            write_indent(file, 10, "elsif (reg_write.{}(i).isModified) then".format(
                register.name.lower()))
            write_indent(
                file, 10, "-- Gestion de la cohérence des 2 signaux registres en cas d'écriture par soft et module")
            write_indent(file, 10, "reg_read.{0}(i)            <= reg_write.{0}(i);".format(
                register.name.lower()))
            write_indent(file, 10, "reg_read.{}(i).isModified <= false;".format(
                register.name.lower()))
            write_indent(file, 8, "end if;")
            write_indent(file, 6, "end loop;")

        else:
            write_indent(file, 6, "if (apb_from_master.paddr = P_{}.addr) and (apb_from_master.psel = '1') and (apb_from_master.pwrite = '1') and (apb_from_master.penable = '1') then".format(
                register.name.upper()))
            write_indent(file, 8, "write_out_of_range := false;")
            if register.access == "write-only":
                write_indent(file, 8, "{0}_records_to_array(reg_read.{0}, temp);".format(
                    register.name.lower()))
                write_indent(file, 8, "temp := (apb_from_master.pwdata and P_{0}.mask) or (temp and not (P_{0}.mask));".format(
                    register.name.upper()))
                write_indent(file, 8, "{0}_array_to_records(temp, reg_read.{0});".format(
                    register.name.lower()))
                write_indent(file, 8, "reg_read.{0}.isWritten <= true;".format(
                    register.name.lower()))
            else:
                write_indent(
                    file, 8, "-- Signalement de l'erreur sur un registre en lecture seule")
                write_indent(file, 8, "apb_to_master.pslverr <= '1';")
            write_indent(
                file, 8, "-- Activer apb_to_master.pready pour confirmation de l'écriture")
            write_indent(file, 8, "apb_to_master.pready             <= '1';")

            write_indent(file, 6, "elsif (reg_write.{}.isModified) then".format(
                register.name.lower()))
            write_indent(
                file, 8, "-- Gestion de la cohérence des 2 signaux registres en cas d'écriture par soft et module")
            write_indent(file, 8, "reg_read.{0}            <= reg_write.{0};".format(
                register.name.lower()))
            write_indent(file, 8, "reg_read.{}.isModified <= false;".format(
                register.name.lower()))
            write_indent(file, 6, "end if;")
        file.write("\n")

    error_checks = """\

      --------------------------------------------------------------
      --  Gestion d'erreur à ne pas omettre                       --
      --------------------------------------------------------------
      if (write_out_of_range = true) and (apb_from_master.psel = '1') and (apb_from_master.pwrite = '1') and (apb_from_master.penable = '1') then
        -- Signalement de l'erreur sur un registre en lecture seule
        apb_to_master.pslverr <= '1';
        -- Déblocage de la communication
        apb_to_master.pready  <= '1';
      end if;


"""
    file.write(error_checks)

    add_separator(file, 6)
    write_indent(file, 6, "-- Accès en lecture")
    add_separator(file, 6)
    write_indent(
        file, 6, "if ((apb_from_master.pwrite = '0') and (apb_from_master.psel = '1') and (apb_from_master.penable = '1')) then")
    write_indent(
        file, 8, "-- Mise en place d'une donnée quelconque reconnaissable pour debug en cas d'accès hors plage adressable.")
    write_indent(file, 8, 'apb_to_master.prdata <= x"DEADBEEF";')
    write_indent(file, 8, "apb_to_master.pready <= '1';")
    write_indent(file, 8, "-- Signalisation de l'erreur au bus APB")
    write_indent(file, 8, "apb_to_master.pslverr <= '1';")
    file.write('\n' * 2)

    for register in addressSpace.register:
        if register.access == "read-only":
            add_separator(file, 8)
            write_indent(
                file, 8, "--  Lecture du registre {}".format(register.name.upper()))
            add_separator(file, 8)

            if register.dim > 1:
                write_indent(
                    file, 8, "for i in 0 to {} loop".format(register.dim-1))
                write_indent(file, 10, "if apb_from_master.paddr = std_logic_vector(unsigned(P_{0}.addr) + to_unsigned(to_integer(i * unsigned(P_{0}.dimOffset)), {1})) then".format(
                    register.name.upper(), addressSpace.width))
                write_indent(file, 12, "{0}_records_to_array(reg_read.{0},i, prdata_v);".format(
                    register.name.lower()))
                write_indent(file, 12, "apb_to_master.prdata <= prdata_v;")
                write_indent(file, 12, "apb_to_master.pready <= '1';")
                write_indent(file, 12, "apb_to_master.pslverr <= '0';")
                write_indent(file, 12, "reg_read.{0}(i).isRead <= true;".format(
                    register.name.lower()))
                write_indent(file, 10, "end if;")
                write_indent(file, 8, "end loop;")
            else:
                write_indent(file, 8, "if apb_from_master.paddr = P_{}.addr then".format(
                    register.name.upper()))
                write_indent(file, 10, "{0}_records_to_array(reg_read.{0}, prdata_v);".format(
                    register.name.lower()))
                write_indent(file, 10, "apb_to_master.prdata <= prdata_v;")
                write_indent(file, 10, "apb_to_master.pready <= '1';")
                write_indent(file, 10, "apb_to_master.pslverr <= '0';")
                write_indent(file, 10, "reg_read.{0}.isRead <= true;".format(
                    register.name.lower()))
                write_indent(file, 8, "end if;")

    footer = """\
         
      end if;

    end if;
  end process p_gestion_config;

end architecture rtl;

"""
    file.write(footer)


def write_end_pkg(file, name):
    write_indent(
        file, 2, 'procedure initFlag(signal table: out T_{}_REG);'.format(name.upper()))
    file.write('\n' * 2)
    write_indent(
        file, 2, 'procedure initIsModified(signal table: out T_{}_REG);'.format(name.upper()))
    file.write('\n' * 2)
    write_indent(file, 0, 'end register_{}_pkg;'.format(name.lower()))
    file.write('\n' * 2)


def write_pkg_body(file, name):
    write_indent(
        file, 0, 'package body register_{}_pkg is'.format(name.lower()))
    file.write('\n' * 2)


def write_end_pkg_body(file, name):
    write_indent(
        file, 0, 'end package body register_{}_pkg;'.format(name.lower()))


def write_initFlag(file, addressSpace):
    write_indent(file, 2, 'procedure initFlag(signal table: out T_{0}_REG) is'.format(
        addressSpace.name.upper()))
    write_indent(file, 2, 'begin'.format(addressSpace.name.lower()))

    for register in addressSpace.register:
        if bool(register.vendorExtensions.regIsHidden) == False:
            if register.dim > 1:
                write_indent(
                    file, 4, 'for i in 0 to {} loop'.format(register.dim-1))
                write_indent(file, 6, 'table.{0}(i).isWritten <= false;'.format(
                    register.name.lower()))
                write_indent(file, 6, 'table.{0}(i).isRead    <= false;'.format(
                    register.name.lower()))
                write_indent(file, 4, 'end loop;')
            else:
                write_indent(file, 4, 'table.{0}.isWritten <= false;'.format(
                    register.name.lower()))
                write_indent(file, 4, 'table.{0}.isRead    <= false;'.format(
                    register.name.lower()))

    write_indent(file, 2, 'end procedure initFlag;')
    file.write('\n' * 2)


def write_initIsModified(file, addressSpace):
    write_indent(file, 2, 'procedure initIsModified(signal table: out T_{0}_REG) is'.format(
        addressSpace.name.upper()))
    write_indent(file, 2, 'begin'.format(addressSpace.name.lower()))

    for register in addressSpace.register:
        if bool(register.vendorExtensions.regIsHidden) == False:
            if register.dim > 1:
                write_indent(
                    file, 4, 'for i in 0 to {} loop'.format(register.dim - 1))
                write_indent(file, 6, 'table.{0}(i).isModified <= false;'.format(
                    register.name.lower()))
                write_indent(file, 4, 'end loop;')
            else:
                write_indent(file, 4, 'table.{0}.isModified <= false;'.format(
                    register.name.lower()))

    write_indent(file, 2, 'end procedure initIsModified;')
    file.write('\n' * 2)


def write_global_parameters(file, reg_size, addr_size):
    indent = 2
    write_indent(file, indent, 'constant  REG_SIZE  : integer:= {};'.format(
        reg_size), '{} bits registers width'.format(reg_size))
    write_indent(file, indent, 'constant  ADDR_SIZE : integer:= {};'.format(
        addr_size), '{} bits address width'.format(addr_size))
    file.write('\n' * 2)

    type = """\
  type T_PARAM_REGISTER is record
    addr         : std_logic_vector(ADDR_SIZE - 1 downto 0);                    -- Register address
    accessWrite  : boolean;                                                     -- True : Write access allowed
    accessRead   : boolean;                                                     -- True : Read access allowed
    defaultValue : std_logic_vector(REG_SIZE - 1 downto 0);                     -- Register value after reset
    mask         : std_logic_vector(REG_SIZE - 1 downto 0);                     -- '0' => RD only field. '1' => RD/WR field
    dim          : integer;                                                     -- Register dimension: Number of times the register is duplicated
    dimOffset    : std_logic_vector(ADDR_SIZE - 1 downto 0);                    -- Address offset when register is duplicated
  end record T_PARAM_REGISTER;

"""
    file.write(type)


def write_register_list(file, addressSpace):
    indent = 2
    write_indent(file, indent, 'type T_{}_REG is record'.format(
        addressSpace.name.upper()))
    for register in addressSpace.register:
        if bool(register.vendorExtensions.regIsHidden) == False:
            if register.dim > 1:
                write_indent(file, indent * 2, '{0} : T_TAB_REG_{1};'.format(
                    register.name.lower(), register.name.upper()))
            else:
                write_indent(
                    file, indent * 2, '{0} : T_REG_{1};'.format(register.name.lower(), register.name.upper()))

    write_indent(
        file, indent, 'end record T_{}_REG;'.format(addressSpace.name))
    file.write('\n' * 2)
    write_indent(file, indent, 'constant C_{0}_REG_DEFAULT : T_{0}_REG := ('.format(
        addressSpace.name.upper()))
    for register in addressSpace.register[0:-1]:
        if bool(register.vendorExtensions.regIsHidden) == False:
            if register.dim > 1:
                write_indent(file, indent * 2, '{0} => C_TAB_{1}_DEFAULT,'.format(
                    register.name.lower(), register.name.upper()))
            else:
                write_indent(file, indent * 2, '{0} => C_{1}_DEFAULT,'.format(
                    register.name.lower(), register.name.upper()))
    if len(addressSpace.register) > 0:
        if addressSpace.register[-1].dim > 1:
            if bool(addressSpace.register[-1].vendorExtensions.regIsHidden) == False:
                write_indent(file, indent * 2, '{0} => C_TAB_{1}_DEFAULT);'.format(
                    addressSpace.register[-1].name.lower(), addressSpace.register[-1].name.upper()))
        else:
            if bool(addressSpace.register[-1].vendorExtensions.regIsHidden) == False:
                write_indent(file, indent * 2, '{0} => C_{1}_DEFAULT);'.format(
                    addressSpace.register[-1].name.lower(), addressSpace.register[-1].name.upper()))

    file.write('\n' * 2)


def write_register_definition(file, fileInfo, width, register):
    indent = 2

    if bool(register.vendorExtensions.regIsHidden) == False:
        # ---------------------------------------------------------------------------------------
        # -- REG_EXAMPLE
        # ---------------------------------------------------------------------------------------
        # /* Register description */
        add_separator(file, indent)
        write_indent(file, indent, '-- {} definition'.format(register.name))
        add_separator(file, indent)
        file.write('\n')

        # -- REG_EXAMPLE parameters
        # constant P_REG_EXAMPLE : T_PARAM_REGISTER := (
        #   addr         => x"00001F00",
        #   accessWrite  => true,
        #   accessRead   => true,
        #   defaultValue => x"00000000",
        #   mask         => x"FFFFFFFF",
        #   dim          => 16,
        #   dimOffset    => "OO10"
        # );
        write_indent(file, indent, '/* {} */'.format(register.description))
        write_indent(file, indent, 'constant ' +
                     'P_{} : T_PARAM_REGISTER := ('.format(register.name).upper())
        write_indent(file, indent * 2, 'addr         => {},'.format(
            write_hexa(hex(register.addressOffset), int(fileInfo)).upper()))
        write_indent(file, indent * 2, 'accessWrite  => {},'.format(
            True if register.access == "write-only" else False))
        write_indent(file, indent * 2, 'accessRead   => {},'.format(
            True if register.access == "read-only" else False))
        write_indent(file, indent * 2, 'defaultValue => {},'.format(
            write_hexa(hex(register.vendorExtensions.regDefaultValue), int(width)).upper()))
        write_indent(file, indent * 2, 'mask         => {},'.format(
            write_hexa(hex(register.vendorExtensions.regMask), int(width)).upper()))
        write_indent(file, indent * 2,
                     'dim          => {},'.format(register.dim))
        write_indent(file, indent * 2, 'dimOffset    => {}'.format(
            write_hexa(hex(register.vendorExtensions.dimOffset), int(fileInfo)).upper()))
        write_indent(file, indent, ');')
        file.write('\n')

        write_indent(file, indent, 'type ' +
                     'T_REG_{} is record'.format(register.name.upper()))
        for field in register.field:
            posl = field.bitOffset
            posh = posl + field.bitWidth - 1
            if posh == posl:
                write_indent(file, indent * 2,
                             '{} '.format(field.name.lower()) + ' : std_logic;')
            else:
                write_indent(file, indent * 2, '{} '.format(field.name.lower()) +
                             ' : std_logic_vector({} downto {});'.format(posh - posl, 0), field.description)
        write_indent(file, indent * 2, 'isModified : boolean;')
        write_indent(file, indent * 2, 'isRead : boolean;')
        write_indent(file, indent * 2, 'isWritten : boolean;')
        write_indent(file, indent, 'end record ' +
                     'T_REG_{};'.format(register.name).upper())
        file.write('\n')

        if register.dim > 1:
            write_indent(file, indent, 'type ' + 'T_TAB_REG_{0} is array(0 to {1}) of T_REG_{0};'.format(
                register.name.upper(), register.dim - 1))
            file.write('\n')

        write_indent(file, indent, 'constant ' +
                     'C_{0}_DEFAULT : T_REG_{0} := ('.format(register.name).upper())
        for field in register.field:
            posl = field.bitOffset
            posh = posl + field.bitWidth - 1
            print("FIELD", field.bitOffset, field.bitWidth, posh, posl, field.value)
            write_indent(file, indent * 2, '{} => {},'.format(field.name.lower(), write_hexa(hex(field.value), posh - posl + 1)), field.description)
        write_indent(file, indent * 2, 'isModified  => false,')
        write_indent(file, indent * 2, 'isRead      => false,')
        write_indent(file, indent * 2, 'isWritten   => false);')
        file.write('\n')

        if register.dim > 1:
            write_indent(file, indent, 'constant ' +
                         'C_TAB_{0}_DEFAULT : T_TAB_REG_{0} := (others => C_{0}_DEFAULT);'.format(register.name.upper()))
            file.write('\n')

        # -- REG_EXAMPLE fields
        # subtype REVISION_FIELD1 is natural range 7 downto 0;
        # subtype REVISION_FIELD2 is natural range 15 downto 8;
        write_indent(file, indent, '-- {} fields'.format(register.name))
        for field in register.field:
            posl = field.bitOffset
            posh = posl + field.bitWidth - 1
            print(posh, posl)
            write_indent(file, indent, 'subtype S_{}_F_{} is natural range {} downto {};'.format(
                register.name.upper(), field.name.upper(), posh, posl), field.description)
        file.write('\n')

        # -- enumerated values for field1 of register REG_EXAMPLE
        # -- constant REG_EXAMPLE_FIELD1_VALUE1 : std_logic_vector(7 downto 0) := x"01"; -- description de la valeur 1
        # -- constant REG_EXAMPLE_FIELD1_VALUE2 : std_logic_vector(7 downto 0) := x"02"; -- description de la valeur 2
        for field in register.field:
            posl = field.bitOffset
            posh = posl + field.bitWidth - 1
            if len(field.enumeratedValues) != 0:
                write_indent(
                    file, indent, '-- enumerated values for field {} of register {}'.format(field.name, register.name))
            for evs in field.enumeratedValues:
                for enum in evs.enumeratedValue:
                    if posh == posl:
                        write_indent(file, indent, 'constant ' + 'E_{}_F_{}_{}'.format(register.name, field.name,
                                     enum.name).upper() + ' : std_logic := {};'.format(write_hexa(hex(enum.value), 1)), enum.description)
                    else:
                        write_indent(file, indent, 'constant ' + 'E_{}_F_{}_{}'.format(register.name, field.name, enum.name).upper(
                        ) + ' : std_logic_vector({} downto {}) := {};'.format(posh - posl, 0, write_hexa(hex(enum.value), posh - posl + 1)), enum.description)

        if register.dim > 1:
            write_indent(
                file, indent, '-- Procédure de conversion du record -> std_logic_vector')
            write_indent(
                file, indent, 'procedure {}_records_to_array( '.format(register.name.lower()))
            write_indent(
                file, indent * 2, 'signal param_sts : in T_TAB_REG_{};'.format(register.name.upper()))
            write_indent(
                file, indent * 2, 'constant index : in integer;'.format(register.name.upper()))
            write_indent(file, indent * 2,
                         'variable ctrl_out : out std_logic_vector);')
            write_indent(
                file, indent, '-- Procédure de conversion de std_logic_vector -> record')
            write_indent(
                file, indent, 'procedure {}_array_to_records( '.format(register.name.lower()))
            write_indent(file, indent * 2,
                         'variable param_sts : in std_logic_vector;')
            write_indent(
                file, indent * 2, 'signal param_out : out T_TAB_REG_{};'.format(register.name.upper()))
            write_indent(
                file, indent * 2, 'constant index : in integer);'.format(register.name.upper()))
        else:
            write_indent(
                file, indent, '-- Procédure de conversion du record -> std_logic_vector')
            write_indent(
                file, indent, 'procedure {}_records_to_array( '.format(register.name.lower()))
            write_indent(
                file, indent * 2, 'signal param_sts : in T_REG_{};'.format(register.name.upper()))
            write_indent(file, indent * 2,
                         'variable ctrl_out : out std_logic_vector);')
            write_indent(
                file, indent, '-- Procédure de conversion de std_logic_vector -> record')
            write_indent(
                file, indent, 'procedure {}_array_to_records( '.format(register.name.lower()))
            write_indent(file, indent * 2,
                         'variable param_sts : in std_logic_vector;')
            write_indent(
                file, indent * 2, 'signal param_out : out T_REG_{});'.format(register.name.upper()))

        file.write('\n')


def write_procedure_body(file, width, register):
    if bool(register.vendorExtensions.regIsHidden) == False:
        indent = 2
        if register.dim > 1:
            write_indent(
                file, indent, 'procedure {}_records_to_array( '.format(register.name.lower()))
            write_indent(
                file, indent * 2, 'signal param_sts : in T_TAB_REG_{};'.format(register.name.upper()))
            write_indent(
                file, indent * 2, 'constant index : in integer;'.format(register.name.upper()))
            write_indent(file, indent * 2,
                         'variable ctrl_out : out std_logic_vector) is')
        else:
            write_indent(
                file, indent, 'procedure {}_records_to_array( '.format(register.name.lower()))
            write_indent(
                file, indent * 2, 'signal param_sts : in T_REG_{};'.format(register.name.upper()))
            write_indent(file, indent * 2,
                         'variable ctrl_out : out std_logic_vector) is')
        write_indent(file, indent, 'begin')
        write_indent(
            file, indent*2, "ctrl_out({0} downto 0) := (others => '0');".format(int(width)-1))

        for field in register.field:
            posl = field.bitOffset
            posh = posl + field.bitWidth - 1
            if int(posh) == int(posl):
                if register.dim > 1:
                    write_indent(
                        file, indent * 2, 'ctrl_out({0}) := param_sts(index).{1};'.format(posl, field.name.lower()))
                else:
                    write_indent(
                        file, indent * 2, 'ctrl_out({0}) := param_sts.{1};'.format(posl, field.name.lower()))
            else:
                if register.dim > 1:
                    write_indent(file, indent * 2, 'ctrl_out({} downto {}) := param_sts(index).{};'.format(
                        posh, posl, field.name.lower()))
                else:
                    write_indent(file, indent * 2, 'ctrl_out({} downto {}) := param_sts.{};'.format(
                        posh, posl, field.name.lower()))
        write_indent(file, indent, 'end procedure {}_records_to_array;'.format(
            register.name.lower()))
        file.write('\n')

        write_indent(
            file, indent, 'procedure {}_array_to_records( '.format(register.name.lower()))
        write_indent(file, indent * 2,
                     'variable param_sts : in std_logic_vector;')
        if register.dim > 1:
            write_indent(
                file, indent * 2, 'signal param_out : out T_TAB_REG_{};'.format(register.name.upper()))
            write_indent(
                file, indent * 2, 'constant index : in integer) is'.format(register.name.upper()))
        else:
            write_indent(
                file, indent * 2, 'signal param_out : out T_REG_{}) is'.format(register.name.upper()))
        write_indent(file, indent, 'begin')

        for field in register.field:
            posl = field.bitOffset
            posh = posl + field.bitWidth - 1
            if int(posh) == int(posl):
                if register.dim > 1:
                    write_indent(
                        file, indent * 2, 'param_out(index).{} <= param_sts({});'.format(field.name.lower(), posl))
                else:
                    write_indent(
                        file, indent * 2, 'param_out.{} <= param_sts({});'.format(field.name.lower(), posl))
            else:
                if register.dim > 1:
                    write_indent(file, indent * 2, 'param_out(index).{} <= param_sts({} downto {});'.format(
                        field.name.lower(), posh, posl))
                else:
                    write_indent(file, indent * 2, 'param_out.{} <= param_sts({} downto {});'.format(
                        field.name.lower(), posh, posl))
        write_indent(file, indent, 'end procedure {}_array_to_records;'.format(
            register.name.lower()))

        file.write('\n')
