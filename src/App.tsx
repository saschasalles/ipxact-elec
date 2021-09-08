import { hot } from 'react-hot-loader';
import React, { useState, useEffect, useCallback } from 'react';
import { EnginePage } from './pages/main';
import { Transition } from '@headlessui/react';
import { Button } from './components/button';
import { DocumentTextIcon, PlusCircleIcon } from '@heroicons/react/solid';
import CreateModal from './components/modals/create-modal';
import { menuItemsEnabler, setElectronTitle } from './helpers/electron-helper';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { ResetAppAction } from './store/store';
import { fetchItems } from './helpers/ipxact-helper';
import { store } from './store/store';
import { Project } from './models/project';
import { useAppSelector } from '../src/hooks';
import ConfirmDeleteModal from '../src/components/modals/confirm-delete-modal';

const electron = window.require('electron');

const App = () => {
  const [engineMode, setEngineMode] = useState(false);
  const [path, setPath] = useState(['']);
  const [createModal, setCreateModal] = useState(false);
  const [editModal, setEditModal] = useState([false, false]);
  const [confirmClose, setConfirmClose] = useState(false);
  const [withRecent, setWithRecent] = useState(false);
  const projects: readonly Project[] = useAppSelector((state) => state.projectReducer.projects);
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
            setPath(result.filePaths);
            electron.ipcRenderer.send('parse-xml', result.filePaths[0]);
            electron.remote.app.addRecentDocument(result.filePaths[0]);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      electron.ipcRenderer.send('parse-xml', path);
      setEngineMode(true);
    }
  };

  const handleEditProject = () => {
    setSelectedProject(projects[0]);
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
    setPath(['']);
  };

  const handleSaveFile = (customPath?: string) => {
    const state = store.getState();
    const storeProjects = state.projectReducer.projects;
    const storeFuncs = state.functionReducer.addressSpaces;
    const storeBlocks = state.blockReducer.blocks;
    const storeRegs = state.registerReducer.registers;
    const storeFields = state.fieldReducer.fields;
    const storeEVS = state.enumeratedValueReducer.enumeratedValues;

    const data = {
      project: storeProjects[0],
      funcs: storeFuncs,
      blocks: storeBlocks,
      regs: storeRegs,
      fields: storeFields,
      evs: storeEVS,
    };

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
      handleEditProject();
    });

    electron.ipcRenderer.on('add-parsed-items', (evt, data) => {
      setEngineMode(true);
      menuItemsEnabler(true);
      const project = fetchItems(data);
      setElectronTitle(`Xactron - ${project.projectName} - ${project.filePath}`);
    });

    electron.ipcRenderer.on('open-recent-file', (event, data) => {
      const state = store.getState();
      const storeProjects = state.projectReducer.projects;
      setWithRecent(true);
      console.log(storeProjects.length);
      if (storeProjects.length >= 1) {
        setPath([data]);
        setConfirmClose(true);
      } else {
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

        <div className="select-none flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-blueGray-900 to-blueGray-700 dark:from-gray-900 dark:to-gray-700 min-w-screen space-y-20 ">
          <div className="text-8xl font-extrabold">
            <h1 className="text-white antialiased ">
              Xactron<span className="text-red-400 animate-bounce">.</span>
            </h1>
            <div className="flex flex-row text-right justify-end">
              <span className="text-sm font-bold text-gray-200 pr-2 antialiased">by</span>{' '}
              <img className="w-32 object-contain select-none pointer-events-none" src="/assets/thales.png" />
            </div>
          </div>

          <div className="justify-center flex flex-col items-center ">
            <div className="space-x-5">
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

            <div className="mt-10 text-blueGray-300 text-md w-96 justify-center flex flex-col rounded-2xl backdrop-filter backdrop-blur-xl backdrop-brightness-75 py-3 px-6">
              <div className="flex justify-between  items-center">
                <h3 className="text-white font-medium text-lg mb-2 tracking-wide">Open Recents</h3>
                <p className="hover:text-blueGray-400 text-xs mb-2 hover:underline tracking-wider cursor-pointer">
                  clear
                </p>
              </div>

              <a className="hover:text-blueGray-400 font-light duration-200 cursor-pointer">
                link/test/test/file.xml - Project
              </a>
              <a className="hover:text-blueGray-400 font-light duration-200 cursor-pointer">
                link/test/test/file.xml - Project
              </a>
              <a className="hover:text-blueGray-400 font-light duration-200 cursor-pointer">
                link/test/test/file.xml - Project
              </a>
            </div>
          </div>
        </div>
      </Transition>

      <Transition show={engineMode}>
        <EnginePage />
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

export default hot(module)(App);
