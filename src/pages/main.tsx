import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { useAppSelector } from '../hooks';
import { v4 as uuidv4 } from 'uuid';
import { Transition } from '@headlessui/react';
import { ToolBar } from '../components/toolbar';
import { MappingTableRowData } from '../models/mapping-row-model';
import { initialMappingData, initialTabs } from '../helpers/data';
import { Tab } from '../models/tab-model';
import { ButtonMode } from '../models/button-mode';
import { AddressSpace } from '../models/address-space';
import { Register } from '../models/register';
import { Block } from '../models/block';
import MappingTable from '../components/mappingtable';
import RegisterTable from '../components/registertable';
import TabMenu from '../components/tabmenu';
import FuncModal from '../components/modals/func-modal';
import RegisterModal from '../components/modals/register-modal';
import BlockModal from '../components/modals/block-modal';
import FieldModal from '../components/modals/field-modal';
import EVModal from '../components/modals/ev-modal';
import ConfirmDeleteModal from '../components/modals/confirm-delete-modal';
import DeleteEVModal from '../components/modals/delete-ev-modal';


const electron = window.require('electron');

export const EnginePage = () => {
  const funcs: readonly AddressSpace[] = useAppSelector((state) => state.functionReducer.addressSpaces);
  const regs: readonly Register[] = useAppSelector((state) => state.registerReducer.registers);
  const blocks: readonly Block[] = useAppSelector((state) => state.blockReducer.blocks);
  const dispatch: Dispatch<any> = useDispatch();
  const [mappingData, setMappingData] = useState(initialMappingData);
  const [tabs, setTabs] = useState(initialTabs);
  const [isMapping, setIsMapping] = useState(true);
  const [mappingSelection, setMappingSelection] = useState(false);
  const [mappingSelectionMode, setMappingSelectionMode] = useState('DEFAULT');
  const [funcModal, setFuncModal] = useState([false, false]);
  const [regModal, setRegModal] = useState([false, false]);
  const [blockModal, setBlockModal] = useState([false, false]);
  const [fieldModal, setFieldModal] = useState([false, false]);
  const [evModal, setEvModal] = useState([false, false]);
  const [confirmModal, setConfirmModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState<any>({});
  const [deleteEVModal, setDeleteEVModal] = useState(false);
  const [removeFieldsSig, setRemoveFieldsSig] = useState(-1); // send a signal to children (tricky but very nice)
  const [currentRegister, setCurrentRegister] = useState(null);
  const [registerToEdit, setRegisterToEdit] = useState(null);
  const [funcToEdit, setFuncToEdit] = useState(null);
  const [blockToEdit, setBlockToEdit] = useState(null);

  useEffect(() => {
    let newMappingData = Array<MappingTableRowData>();

    funcs.forEach((func) => {
      if (func.registers != null && func.registers.length > 0) {
        func.registers.forEach((reg) => {
          const register = regs.find((re) => re.id === reg);
          if (register != null) {
            let data = new MappingTableRowData(
              register.id,
              func.id,
              func.name,
              func.baseAddress,
              false,
              register.address,
              register.id,
              register.name,
              null,
              null,
              register.description,
            );
            newMappingData.push(data);
          }
        });
      }

      if (func.blocks != null && func.blocks.length > 0) {
        func.blocks.forEach((bk) => {
          const block = blocks.find((re) => re.id === bk);
          if (block != null) {
            let data = new MappingTableRowData(
              uuidv4(),
              func.id,
              func.name,
              func.baseAddress,
              false,
              block.baseAddress,
              null,
              null,
              block.id,
              block.name,
              block.description,
            );
            newMappingData.push(data);
          }
        });
      }

      if ((func.registers == null || func.registers.length == 0) && (func.blocks == null || func.blocks.length == 0)) {
        let data = new MappingTableRowData(
          uuidv4(),
          func.id,
          func.name,
          func.baseAddress,
          false,
          null,
          null,
          null,
          null,
          null,
          'Please add a block or a register',
        );
        newMappingData.push(data);
      }
    });
    setMappingData(newMappingData);
  }, [funcs, regs, blocks]);

  useEffect(() => {
    window.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }, []);
  // MAPPING TABLE

  const handleMappingRowClick = (rowData: MappingTableRowData) => {
    if (rowData.registerId != null) {
      setCurrentRegister(rowData.registerId);
      let newTabs = [...tabs];
      let newTab = createTab(rowData);
      const index = newTabs.findIndex((tab) => tab.id === rowData.id);

      if (index == 0) {
        setIsMapping(true);
        handleMappingSelectAll(false);
      } else if (index > 0) {
        newTabs[index].current = true;
        setTabs(newTabs);
      } else if (index < 0 && newTabs.filter((tab) => tab.registerID === newTab.registerID).length === 0) {
        newTabs.push(newTab);
        setTabs(newTabs);
      }
      setIsMapping(false);
      setMappingSelection(false);
      handleMappingSelectAll(false);
    }
  };

  const mappingTableHasRowSelected = () => { 
    let arr = mappingData.filter((row) => row.selected === true);
    return arr.length > 0 ? true : false;
  };

  const handleMappingRowSelected = (rowData: MappingTableRowData) => {
    if (mappingSelection) {
      let newMappingData = [...mappingData];
      const index = mappingData.findIndex((row) => row.id === rowData.id);
      newMappingData[index].selected = !newMappingData[index].selected;
      setMappingData(newMappingData);
    }
  };

  const handleMappingSelectAll = (selected: boolean) => {
    let newMappingData = [...mappingData];
    newMappingData.forEach((row) => (row.selected = selected));
    setMappingData(newMappingData);
  };

  // MAPPING TABLE: Context Menu

  const handleMappingRowRightClick = (rowData: MappingTableRowData) => {
    if (rowData.registerId != null) {
      electron.ipcRenderer.send('show-reg-context-menu');
    } else if (rowData.blockId != null) {
      electron.ipcRenderer.send('show-bk-context-menu');
    }

    electron.ipcRenderer.on('cm-open-reg', (e, command) => {
      handleMappingRowClick(rowData);
    });

    electron.ipcRenderer.on('cm-delete-reg', (e, command) => {
      setConfirmModalData({
        type: 'Register',
        action: () => {
          Register.deleteById(rowData.registerId);;
          setConfirmModal(false);
        },
        title: 'Register',
        message:
          'Watch out ! Remove a register will also remove its associated fields and these children. Are you sure ?',
      });
      setConfirmModal(true);
    });

    electron.ipcRenderer.on('cm-edit-reg', (e, command) => {
      setRegisterToEdit(rowData.registerId);
      setRegModal([true, true]);
    });

    electron.ipcRenderer.on('cm-edit-func', (e, command) => {
      setFuncToEdit(rowData.functionId);
      setFuncModal([true, true]);
    });

    electron.ipcRenderer.on('cm-delete-func', (e, command) => {
      setConfirmModalData({
        type: 'Function',
        action: () => {
          AddressSpace.deleteById(rowData.functionId);
          setConfirmModal(false);
        },
        title: 'Delete Function',
        message:
          'Watch out ! Remove a function will also remove its associated registers and these children. Are you sure ?',
      });
      setConfirmModal(true);
    });

    electron.ipcRenderer.on('cm-open-bk', (e, command) => {
      setBlockToEdit(rowData.blockId);
      setBlockModal([true, true]);
    });

    electron.ipcRenderer.on('cm-delete-bk', (e, command) => {
      setConfirmModalData({
        type: 'Block',
        action: () => {
          Block.deleteById(rowData.blockId);
          setConfirmModal(false);
        },
        title: 'Block',
        message:
          'Watch out ! Are you sure you want destroy this block ?',
      });
      setConfirmModal(true);
    });
  };

  // TABS

  const resetSelection = () => {
    tabs.forEach((tab) => (tab.current = false));
  };

  const createTab = (rowData: MappingTableRowData) => {
    resetSelection();
    return new Tab(rowData.id, rowData.registerName, rowData.registerId, true, true);
  };

  const handleTabClick = (tabID: string) => {
    resetSelection();
    let newTabs = [...tabs];
    const index = tabs.findIndex((tab) => tab.id === tabID);

    setCurrentRegister(newTabs[index].registerID);
    if (!newTabs[index].current) {
      newTabs[index].current = true;
      if (index == 0) {
        !isMapping && setIsMapping(true);
        mappingTableHasRowSelected && handleMappingSelectAll(false);
      } else {
        !mappingTableHasRowSelected();
        setIsMapping(false);
        setMappingSelection(false);
      }
      setTabs(newTabs);
    }
  };

  const handleTabClose = (tabID: string) => {
    let newTabs = [...tabs];
    const index = newTabs.findIndex((tab) => tab.id === tabID);
    if (newTabs[index].current) {
      newTabs[0].current = true;
      setIsMapping(true);
    }
    setTabs(newTabs);
    setTabs(tabs.filter((tab) => tab.id !== tabID));
    setCurrentRegister(null);
  };

  // TOOLBAR

  const handleToolBarButtonClick = (mode: ButtonMode) => {  
    switch (mode) { 
      case ButtonMode.DeleteFunction:
        setMappingSelection(!mappingSelection);
        if (mappingSelection && mappingTableHasRowSelected()) {
          deleteItem('FUNC');
        } else {
          setMappingSelection(!mappingSelection);
        }
        break;
      case ButtonMode.AddFunction:
        setFuncModal([true, false]);
        break;
      case ButtonMode.EditFunction:
        setFuncModal([true, true]);
        break;
      case ButtonMode.AddRegister:
        setRegModal([true, false]);
        break;
      case ButtonMode.EditRegister:
        setRegModal([true, true]);
        break;
      case ButtonMode.DeleteRegister:
        setMappingSelection(!mappingSelection);
        if (mappingSelection && mappingTableHasRowSelected()) {
          deleteItem('REG');
        } else {
          setMappingSelectionMode(mappingSelectionMode === 'DEFAULT' ? 'REGS_ONLY' : 'DEFAULT');
          setMappingSelection(!mappingSelection);
        }
        break;
      case ButtonMode.DeleteOpenedRegister:
        setConfirmModalData({
          type: 'Register',
          action: () => deleteItem('CURRENT_REG'),
          title: 'Delete Register',
          message: 'Watch out ! Remove a register will also remove its associated fields. Are you sure ?',
        });
        setConfirmModal(true);
        break;
      case ButtonMode.AddBlock:
        setBlockModal([true, false]);
        break;
      case ButtonMode.EditBlock:
        setBlockModal([true, true]);
        break;
      case ButtonMode.DeleteBlock:
        setMappingSelection(!mappingSelection);
        if (mappingSelection && mappingTableHasRowSelected()) {
          deleteItem('BLOCK');
        } else {
          setMappingSelectionMode(mappingSelectionMode === 'DEFAULT' ? 'BKS_ONLY' : 'DEFAULT');
          setMappingSelection(!mappingSelection);
        }
        break;
      case ButtonMode.AddField:
        setFieldModal([true, false]);
        break;
      case ButtonMode.EditField:
        setFieldModal([true, true]);
        break;
      case ButtonMode.DeleteField:
        if (removeFieldsSig <= 0) {
          setRemoveFieldsSig(removeFieldsSig + 1);
        } else {
          setRemoveFieldsSig(removeFieldsSig - 1);
        }
        break;
      case ButtonMode.AddEnumeratedValue:
        setEvModal([true, false]);
        break;
      case ButtonMode.EditEnumeratedValue:
        setEvModal([true, true]);
        break;
      case ButtonMode.DeleteEnumeratedValue:
        setDeleteEVModal(true);
        break;
      default:
        break;
    }
  };

  const deleteItem = (item: string) => {
    let newMappingData = [...mappingData];
    let selectedRows = newMappingData.filter((row) => row.selected);
    switch (item) {
      case 'FUNC':
        let selectedFuncsIds = selectedRows.map((row) => row.functionId);
        AddressSpace.deleteByIds(selectedFuncsIds);
        break;
      case 'BLOCK':
        Block.deleteByIds(selectedRows.map((row) => row.blockId))
        setMappingSelectionMode('DEFAULT');
        break;
      case 'REG':
        Register.deleteByIds(selectedRows.map((row) => row.registerId));
        setMappingSelectionMode('DEFAULT');
        let newTabs = tabs.filter((tab) => regs.find((reg) => reg.id == tab.registerID) == null);
        setTabs(newTabs);
        break;
      case 'CURRENT_REG':
        let currentRegId = tabs.find((tab) => tab.current).registerID;
        Register.deleteById(currentRegId);
        setTabs(tabs.filter((tab) => tab.registerID != currentRegId));
        setIsMapping(true);
        setCurrentRegister(null);
        setConfirmModal(false);
        break;
      default:
        break;
    }
    setMappingData(newMappingData.filter((row) => !row.selected));
    setMappingSelection(false);
  };

  return (
    <div className="overflow-hidden flex flex-col bg-blueGray-700 dark:bg-black">
      <div>
        <FuncModal
          open={funcModal[0]}
          setOpen={() => setFuncModal([!funcModal[0], funcModal[1]])}
          editMode={funcModal[1]}
          selectedFunc={funcToEdit}
        />
        <RegisterModal
          open={regModal[0]}
          setOpen={() => setRegModal([!regModal[0], regModal[1]])}
          editMode={regModal[1]}
          selectedReg={registerToEdit}
        />
        <BlockModal
          open={blockModal[0]}
          setOpen={() => setBlockModal([!blockModal[0], blockModal[1]])}
          editMode={blockModal[1]}
        />

        <FieldModal
          open={fieldModal[0]}
          setOpen={() => setFieldModal([!fieldModal[0], fieldModal[1]])}
          editMode={fieldModal[1]}
          register={currentRegister}
          maxRange={
            currentRegister &&
            funcs.length > 0 &&
            funcs.find((f) => f.id === regs.find((r) => r.id === currentRegister).parentFunctionId).width
          }
        />
        <ConfirmDeleteModal
          open={confirmModal}
          setOpen={() => setConfirmModal(!confirmModal)}
          type={confirmModalData.type}
          action={confirmModalData.action}
          title={confirmModalData.title}
          message={confirmModalData.message}
        />
        <EVModal
          open={evModal[0]}
          setOpen={() => setEvModal([!evModal[0], evModal[1]])}
          editMode={evModal[1]}
          register={currentRegister}
        />
        <DeleteEVModal
          open={deleteEVModal}
          setOpen={() => setDeleteEVModal(!deleteEVModal)}
          register={currentRegister}
        />
        <TabMenu tabs={tabs} handleTabClick={handleTabClick} handleTabClose={handleTabClose} />
        <ToolBar isMapping={isMapping} onButtonClick={handleToolBarButtonClick} register={currentRegister} />

        <div className="h-screen">
          {funcs.length > 0 ? (
            <div>
              <Transition
                show={isMapping}
                enter="transition-opacity duration-75"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-25"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <MappingTable
                  mode={mappingSelectionMode}
                  mappingData={mappingData}
                  onRowClick={handleMappingRowClick}
                  onRowSelected={handleMappingRowSelected}
                  onRowRightClick={handleMappingRowRightClick}
                  onSelectAllClick={handleMappingSelectAll}
                  selection={mappingSelection}
                />
              </Transition>
              <Transition
                show={!isMapping}
                enter="transition-opacity duration-75"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-25"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <RegisterTable currentRegister={currentRegister} removeFields={removeFieldsSig} />
              </Transition>
            </div>
          ) : (
            <h2 className="text-white text-center font-medium text-2xl align-middle pt-32 select-none">
              No functions, press "Add Function"
            </h2>
          )}
        </div>
      </div>
    </div>
  );
};
