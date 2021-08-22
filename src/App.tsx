import { hot } from 'react-hot-loader';
import React, { useState, useEffect, useCallback } from 'react';
import { EnginePage } from './pages/main';
import { Transition } from '@headlessui/react';
import { Button } from './components/button';
import { DocumentTextIcon, PlusCircleIcon } from '@heroicons/react/solid';
import CreateModal from './components/modals/create-modal';
import { menuItemsEnabler, setElectronTitle } from './helpers/electron-helper';
import { addProject } from './store/projectActions';
import { addFunction } from './store/functionActions';
import { addRegister } from './store/registerActions';
import { addField } from './store/fieldActions';
import { v4 as uuidv4 } from 'uuid';
import { AddressSpace } from './models/address-space';
import { Register } from './models/register';
import { Field } from './models/field';
import { Project } from './models/project';
import { Access } from './models/access';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { useAppSelector } from './hooks';
import { ResetAppAction } from './store/store';
import { fetchItems } from './helpers/ipxact-helper';
import { store } from './store/store';

const electron = window.require('electron');

const App = () => {
  const [engineMode, setEngineMode] = useState(false);
  const [path, setPath] = useState(['']);
  const [createModal, setCreateModal] = useState(false);
  const dispatch: Dispatch<any> = useDispatch();

  const handleOpenFile = () => {
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
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCreateFile = () => {
    setCreateModal(true);
  };

  const handleClose = () => {
    setEngineMode(false);
    menuItemsEnabler(false);
    setPath(['']);
    setElectronTitle('Xactron');
    dispatch(ResetAppAction);
  };

  const handleSaveFile = () => {
    const state = store.getState()
    console.log("RENDERED", state);
    electron.ipcRenderer.send('save-project', state);
  };

  useEffect(() => {
    electron.ipcRenderer.on('mm-close-project', (event, arg) => {
      handleClose();
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

    electron.ipcRenderer.on('add-parsed-items', function (evt, data) {
      setEngineMode(true);
      menuItemsEnabler(true);
      const project = fetchItems(data);
      setElectronTitle(`Xactron - ${project.projectName} - ${project.filePath}`);
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
      </Transition>
    </div>
  );
};

export default hot(module)(App);
