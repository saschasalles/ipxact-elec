import { hot } from 'react-hot-loader';
import React, { useState, useEffect, useCallback } from 'react';
import { EnginePage } from './pages/main';
import { Transition } from '@headlessui/react';
import { Button } from './components/button';
import { DocumentTextIcon, PlusCircleIcon, ArrowDownIcon } from '@heroicons/react/solid';
import CreateModal from './components/modals/create-modal';
import { menuItemsEnabler, setElectronTitle } from './helpers/electron-helper';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { ResetAppAction } from './store/store';
import { fetchItems } from './helpers/ipxact-helper';
import { store } from './store/store';
import { Project } from './models/project';
import ConfirmDeleteModal from '../src/components/modals/confirm-delete-modal';
import Dropzone from 'react-dropzone';
import LoadingModal from './components/modals/loading-modal';
import { accessFormater } from './helpers/ipxact-helper';
import { Register } from './models/register';
import { Field } from './models/field';
import { Access } from './models/access';
import { ExportType } from "./models/export-type";
import { cloneDeep } from 'lodash';

const electron = window.require('electron');


const App = () => {
  const [engineMode, setEngineMode] = useState(false);
  const [path, setPath] = useState(['']);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState([false, false]);
  const [confirmClose, setConfirmClose] = useState(false);
  const [withRecent, setWithRecent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showEnterAnim, setShowEnterAnim] = useState(false);
  const [isError, setIsError] = useState([false, '']);

  const [selectedProject, setSelectedProject] = useState<Project>(null);

  const dispatch: Dispatch<any> = useDispatch();

  const handleOpenFile = (path?: string) => {
    if (path == null) {
      const dialog = electron.remote.dialog;
      dialog
        .showOpenDialog(electron.remote.getCurrentWindow(), {
          properties: ['openFile'],
          filters: [{ name: 'Ipxact Files', extensions: ['xml'] }],
        })
        .then((result) => {
          if (result.canceled === false) {
            setShowEnterAnim(false);
            setIsLoading(true);
            setPath(result.filePaths);
            electron.ipcRenderer.send('parse-xml', result.filePaths[0]);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setShowEnterAnim(false);
      setIsLoading(true);
      electron.ipcRenderer.send('parse-xml', path);
    }
  };

  const fetchProject = (callback: (project: Project) => void) => {
    const state = store.getState();
    const storeProjects = state.projectReducer.projects;
    callback(storeProjects[0]);
  };

  const toggleEditProject = (project: Project) => {
    setSelectedProject(project);
    setEditModal([true, true]);
  };

  const handleCreateFile = () => {
    setCreateModal(true);
  };

  const handleClose = (saveBefore?: boolean) => {
    saveBefore && handleSaveFile();
    setEngineMode(false);
    menuItemsEnabler(false);
    setElectronTitle('Xactron');
    dispatch(ResetAppAction);

    withRecent && handleOpenFile(path[0]);
    setWithRecent(false);
    setConfirmClose(false);
    resetParseError();
    setPath(['']);
  };

  const getData = (): any => {
    const state = store.getState();
    const storeProjects = state.projectReducer.projects;
    const storeFuncs = state.functionReducer.addressSpaces;
    const storeBlocks = state.blockReducer.blocks;
    let storeRegs = cloneDeep(state.registerReducer.registers);
    let storeFields = cloneDeep(state.fieldReducer.fields);
    const storeEVS = state.enumeratedValueReducer.enumeratedValues;

    storeRegs.forEach((reg: Register) => (reg.access = accessFormater(reg.access as Access, null) as string));
    storeFields.forEach((field: Field) => (field.access = accessFormater(field.access as Access, null) as string));

    const data = {
      project: storeProjects[0],
      funcs: storeFuncs,
      blocks: storeBlocks,
      regs: storeRegs,
      fields: storeFields,
      evs: storeEVS,
    };
    return data;
  }

  const handleExport = (exportType: ExportType) => {
    const dialog = electron.remote.dialog;
    dialog
      .showOpenDialog(electron.remote.getCurrentWindow(), {
        properties: ['openDirectory'],
      })
      .then((result) => {
        if (result.canceled === false) {
          const data = getData()
          const dataToTransfert = [data, result.filePaths[0]]
          switch (exportType) {
            case ExportType.VHDL:
              electron.ipcRenderer.send('export-VHDL', dataToTransfert);
              break;
            case ExportType.C:
              electron.ipcRenderer.send('export-C', dataToTransfert);
              break;
            case ExportType.Excel:
              electron.ipcRenderer.send('export-Excel', dataToTransfert);
              break;
            default:
              break;
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });

  }


  const handleSaveFile = (customPath?: string) => {
    const data = getData();
    if (customPath != null) {
      const endPath = data.project._filePath.replace(/^.*[\\\/]/, '');
      console.log(endPath);
      const finalPath = customPath + '/' + endPath;
      console.log(finalPath);
      electron.ipcRenderer.send('save-as', [data, finalPath]);
    } else {
      electron.ipcRenderer.send('save-project', [data]);
    }
  };

  const handleSaveAs = () => {
    const dialog = electron.remote.dialog;
    dialog
      .showOpenDialog(electron.remote.getCurrentWindow(), {
        properties: ['openDirectory'],
      })
      .then((result) => {
        if (result.canceled === false) {
          // Warning: This feature don't set the state path it's just an "export"
          // Think of this as just a "save here" - Kisses Sascha
          handleSaveFile(result.filePaths[0]);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const resetParseError = () => {
    setIsLoading(false);
    setIsError([false, '']);
    setShowEnterAnim(false);
  };

  const handleDropError = (error: string) => {
    setShowEnterAnim(false);
    setIsLoading(true);
    setIsError([true, error]);
  };

  useEffect(() => {
    electron.ipcRenderer.on('mm-close-project', (event, arg) => {
      setConfirmClose(true);
    });

    electron.ipcRenderer.on('mm-open-project', (event, arg) => {
      handleOpenFile();
    });

    electron.ipcRenderer.on('mm-new-project', (event, arg) => {
      handleCreateFile();
    });

    electron.ipcRenderer.on('mm-save-project', (event, arg) => {
      handleSaveFile();
    });

    electron.ipcRenderer.on('mm-save-as', (event, arg) => {
      handleSaveAs();
    });

    electron.ipcRenderer.on('mm-edit-project', (event, arg) => {
      fetchProject(toggleEditProject);
    });

    electron.ipcRenderer.on('mm-export-vhdl', (event, data) => {
      handleExport(ExportType.VHDL)
    })

    electron.ipcRenderer.on('mm-export-excel', (event, data) => {
      handleExport(ExportType.Excel)
    })

    electron.ipcRenderer.on('add-parsed-items', (evt, data) => {
      resetParseError();
      setEngineMode(true);
      menuItemsEnabler(true);
      const project = fetchItems(data);
      electron.remote.app.addRecentDocument(project.filePath);
      setElectronTitle(`Xactron - ${project.projectName} - ${project.filePath}`);
    });

    electron.ipcRenderer.on('parse-error', (evt, data) => {
      setIsError([true, data]);
    });

    electron.ipcRenderer.on('open-recent-file', (event, data) => {
      const state = store.getState();
      const storeProjects = state.projectReducer.projects;
      setWithRecent(true);
      if (storeProjects.length >= 1) {
        setPath([data]);
        setConfirmClose(true);
        resetParseError();
      } else {
        resetParseError();
        handleOpenFile(data);
      }
    });

  }, []);
  //
  return (
    <div>
      <Transition show={!engineMode}>
        <CreateModal
          open={createModal}
          setOpen={() => setCreateModal(!createModal)}
          setEngine={() => setEngineMode(!engineMode)}
          editMode={false}
        />
        <LoadingModal open={isLoading} error={isError[1] as string} setOpen={() => resetParseError()} />

        <div className="select-none flex min-h-screen bg-gradient-to-br from-blueGray-900 to-blueGray-700 dark:from-gray-900 dark:to-gray-700 min-w-screen px-12 space-y-20">
          <div className="justify-center flex flex-col flex-auto items-center">
            <div className="text-8xl font-extrabold pt-20">
              <h1 className="text-white antialiased ">
                Xactron<span className="text-red-400">.</span>
              </h1>

              <div className="flex flex-row flex-auto text-right justify-end">
                <span className="text-sm font-bold text-gray-200 pr-2 antialiased">by</span>{' '}
                <img className="w-32 object-contain select-none pointer-events-none" src="static://static/thales.png" />
              </div>
            </div>
            <div className="space-x-5 flex-grow-0 mt-8">
              <Button
                autoSize={false}
                color="transparent backdrop-filter backdrop-blur-xl backdrop-brightness-75"
                colorHover="transparent"
                icon={DocumentTextIcon}
                onButtonClick={() => handleOpenFile()}
                text="Open"
              />
              <Button
                autoSize={false}
                color="transparent backdrop-filter backdrop-blur-xl backdrop-brightness-75"
                colorHover="transparent"
                icon={PlusCircleIcon}
                onButtonClick={() => handleCreateFile()}
                text="Create"
              />
            </div>
            <Dropzone
              accept={'.xml'}
              multiple={false}
              onDragEnter={() => setShowEnterAnim(true)}
              onDragLeave={() => setShowEnterAnim(false)}
              onDropAccepted={(acceptedFiles) => handleOpenFile(acceptedFiles[0].path)}
              onDropRejected={(rejection) => handleDropError(rejection[0].errors[0].message)}
            >
              {({ getRootProps, getInputProps }) => (
                <div
                  className={`mt-10 flex items-center flex-grow min-h-96 mb-16 cursor-pointer text-blueGray-300 border ${
                    !showEnterAnim ? 'shadow-neon' : 'shadow-greenNeon'
                  } text-md w-full justify-center rounded-xl backdrop-filter backdrop-blur-2xl backdrop-brightness-75 py-3 px-6`}
                  {...getRootProps()}
                >
                  <input {...getInputProps()} />
                  <div className="h-full text-center items-center text-white font-light text-md space-y-10">
                    {!showEnterAnim && <ArrowDownIcon className="h-12 w-12 mx-auto animate-bounce text-gray-200" />}
                    <p className="font-light text-md">
                      Drag 'n' drop an IP-XACT file (.xml) here, or click to select file
                    </p>
                  </div>
                </div>
              )}
            </Dropzone>
          </div>
        </div>
      </Transition>

      <Transition show={engineMode}>
        {engineMode && <EnginePage />}
        <CreateModal
          open={editModal[0]}
          setOpen={() => setEditModal([!editModal[0], editModal[1]])}
          setEngine={() => setEngineMode(!engineMode)}
          editMode={editModal[1]}
          projectToEdit={selectedProject}
        />
        <ConfirmDeleteModal
          open={confirmClose}
          setOpen={() => setConfirmClose(!confirmClose)}
          actionClose={() => handleClose()}
          action={() => {
            handleClose(true);
          }}
          title="Confirm close"
          message="You are about to close this project. Any unsaved data will be destroyed"
          type=""
          closeMode={true}
        />
      </Transition>
    </div>
  );
};

// ONLY IN DEV MODE ABORT IN PRODUCTION !!
// export default hot(module)(App);
export default App;