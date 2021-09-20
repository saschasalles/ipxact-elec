import React, { Fragment, useRef, useState, useCallback, useEffect } from 'react';
import { XIcon } from '@heroicons/react/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Dispatch } from 'redux';
import { useForm } from 'react-hook-form';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { addProject, updateProject } from '../../store/projectActions';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Project } from '../../models/project';
import { v4 as uuidv4 } from 'uuid';
import { menuItemsEnabler, setElectronTitle } from '../../helpers/electron-helper';
const electron = window.require('electron');

type CreateModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  setEngine: (open: boolean) => void;
  editMode: boolean;
  projectToEdit?: Project;
};

interface ICreateFormInputs {
  fileName: string;
  addressBits: number;
  company: string;
  projectName: string;
  description: string;
  version: number;
}

const CreateModal = (props: CreateModalProps) => {
  const cancelButtonRef = useRef(null);
  const dispatch: Dispatch<any> = useAppDispatch();
  const addProjectAction = useCallback((project: Project) => dispatch(addProject(project)), [dispatch, addProject]);

  const updateProjectAction = useCallback(
    (project: Project) => dispatch(updateProject(project)),
    [dispatch, updateProject],
  );

  const schema = yup.object().shape({
    fileName: yup.string().typeError('A file name is required').required('A file name is required'),
    addressBits: yup
      .number()
      .typeError('Address unit bits is required')
      .positive('Address unit bits must be positive')
      .integer('Address unit bits must be an integer')
      .required('Address unit bits is required'),
    company: yup.string().typeError('Company is required').required('Company is required'),
    projectName: yup
      .string()
      .typeError('A project name is required')
      .matches(RegExp('^[a-zA-Z0-9_]*$'), 'Use only alphanumeric characters and the underscore')
      .required('A project name is required'),
    description: yup.string(),
    version: yup.number().typeError('Version must be a positive number'),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ICreateFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: ICreateFormInputs) => {
    console.log('submit');
    console.log('1', data);
    props.editMode ? updateProj(data) : createFile(data);
  };

  const updateProj = (data: ICreateFormInputs): void | Promise<void> => {
    menuItemsEnabler(true);
    console.log('2', data);
    const projectToEdit = props.projectToEdit;
    projectToEdit.addressBits = data.addressBits;
    projectToEdit.projectName = data.projectName;
    projectToEdit.company = data.company;
    projectToEdit.description = data.description;
    projectToEdit.version = data.version;
    updateProjectAction(projectToEdit);
    setElectronTitle(`Xactron - ${projectToEdit.projectName} - ${projectToEdit.filePath}`);
    props.setOpen(false);
    reset();
  };

  const createFile = (data: ICreateFormInputs): void | Promise<void> => {
    const homeDir = electron.remote.app.getPath('desktop');
    electron.remote.dialog
      .showOpenDialog(electron.remote.getCurrentWindow(), {
        properties: ['openDirectory'],

        filters: [],
        title: 'Choose a place to save your IPXact file',
        defaultPath: homeDir,
      })
      .then((result) => {
        if (result.canceled === false) {
          let newProject: Project = new Project(
            uuidv4(),
            data.fileName,
            result.filePaths[0],
            data.addressBits,
            data.projectName,
            data.company,
            data.description,
            data.version,
          );
          addProjectAction(newProject);
          props.setOpen(false);
          props.setEngine(false);
          reset();
          setElectronTitle(`Xactron - ${newProject.projectName} - ${newProject.filePath}`);
          menuItemsEnabler(true);
        }
      })
      .catch((err) => {
        console.log(err);
        throw err;
      });
  };

  return (
    <Transition.Root show={props.open} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-10 inset-0 overflow-y-auto h-screen"
        initialFocus={cancelButtonRef}
        open={props.open}
        onClose={() => props.setOpen(!props.open)}
      >
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 text-center sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-transparent bg-opacity-25 transition-opacity" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-middle backdrop-filter backdrop-blur-2xl backdrop-contrast-75 backdrop-brightness-200  rounded-3xl py-6 text-left overflow-hidden transform transition-all my-8 max-w-lg w-full px-6">
              <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-blueGray-600 dark:bg-gray-600 p-0.5 rounded-full text-gray-400 hover:text-gray-200 focus:outline-none"
                  onClick={() => props.setOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <XIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="text-left px-3 w-full">
                <Dialog.Title as="h3" className="text-xl leading-6 text-center font-medium text-white">
                  {props.editMode ? 'Edit' : 'New'} Project
                </Dialog.Title>

                <div className="mt-1">
                  <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
                
                      <div className={`mt-4 ${props.editMode && "invisible hidden"}`}>
                        <label htmlFor="fileName" className="block text-sm font-medium text-white">
                          XML File Name{' '}
                          <span className="text-indigo-300">{errors.fileName && ' • ' + errors.fileName.message}</span>
                        </label>
                        <div className="mt-1">
                          <input
                            {...register('fileName', { required: true })}
                            type="text"
                            defaultValue={props.editMode ? props.projectToEdit?.fileName : ''}
                            placeholder="Ex: myfile"
                            className="appearance-none block w-full px-3 py-2 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300  text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                          />
                        </div>
                      </div>
  

                    <div>
                      <label htmlFor="addressBits" className="block text-sm font-medium text-white">
                        Address Unit Bits{' '}
                        <span className="text-indigo-300">
                          {errors.addressBits && ' • ' + errors.addressBits.message}
                        </span>
                      </label>
                      <div className="mt-1">
                        <input
                          {...register('addressBits', { required: true })}
                          type="text"
                          placeholder="32"
                          defaultValue={props.editMode ? props.projectToEdit?.addressBits : ''}
                          className="appearance-none block w-full px-3 py-2 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300  text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-white">
                        Company
                        <span className="text-indigo-300">{errors.company && ' • ' + errors.company.message}</span>
                      </label>
                      <div className="mt-1">
                        <select
                          {...register('company', {
                            value: props.editMode ? props.projectToEdit?.company : ''
                          })}
                          className={
                            'mt-1 py-2 block w-full pl-3 pr-6 text-base border bg-blueGray-600 border-blueGray-600 text-white rounded-lg placeholder-blueGray-400 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300  focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm'
                          }
                        >
                          <option value="Thales DMS">Thales DMS</option>
                          <option value="Thales AVS">Thales AVS</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="projectName" className="block text-sm font-medium text-white">
                        Project Name{' '}
                        <span className="text-indigo-300">
                          {errors.projectName && ' • ' + errors.projectName.message}
                        </span>
                      </label>

                      <div className="mt-1">
                        <input
                          {...register('projectName', { required: true })}
                          placeholder="project_name"
                          defaultValue={props.editMode ? props.projectToEdit?.projectName : ''}
                          className="appearance-none mt-1 py-2 block w-full pl-3 pr-6 text-base border-2 bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300  text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-white">
                        Description{' '}
                      </label>

                      <div className="mt-1 min-h-36 max-h-40">
                        <textarea
                          {...register('description', {
                            required: false,
                          })}
                          placeholder="Description"
                          defaultValue={props.editMode ? props.projectToEdit?.description : ''}
                          className="appearance-none block w-full px-3 py-2 max-h-28 disabled:opacity-75 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300  text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="version" className="block text-sm font-medium text-white">
                        Version{' '}
                        <span className="text-indigo-300">{errors.version && ' • ' + errors.version.message}</span>
                      </label>
                      <div className="mt-1">
                        <input
                          {...register('version', { required: true })}
                          type="text"
                          placeholder="1.0"
                          defaultValue={props.editMode ? props.projectToEdit?.version : ''}
                          className="appearance-none block w-full px-3 py-2 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300  text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-2 pt-3 flex justify-end">
                      <button
                        type="submit"
                        className={`inline-flex justify-center rounded-lg px-4 py-2 bg-blueGray-400 dark:bg-emerald-500 bg-opacity-50 text-base font-medium text-white active:bg-opacity-50 duration-300 transform-gpu active:scale-95 focus:outline-none w-auto`}
                      >
                        {props.editMode ? 'Edit' : 'Create'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default CreateModal;
