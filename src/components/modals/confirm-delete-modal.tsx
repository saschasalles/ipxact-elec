import React, { Fragment, useState } from 'react';
import { Dialog, Portal, Transition } from '@headlessui/react';
import { ExclamationIcon, XIcon } from '@heroicons/react/outline';

type ConfirmDeleteModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  action: () => void;
  title: string;
  message: string;
  type: string;
  closeMode?: boolean;
  actionClose?: () => void;
};

const ConfirmDeleteModal = (props: ConfirmDeleteModalProps) => {
  const [open, setOpen] = useState(true);

  return (
    <Transition.Root show={props.open} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-10 inset-0 overflow-y-auto"
        open={props.open}
        onClose={() => props.setOpen(false)}
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
            <Dialog.Overlay className="fixed inset-0 bg-blueGray-800 dark:bg-transparent bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-middle backdrop-filter backdrop-blur-xl backdrop-contrast-75 backdrop-brightness-200 rounded-2xl py-6 text-left overflow-hidden transform-gpu transition-all my-8 max-w-lg w-full px-6">
              <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-blueGray-600 dark:bg-gray-800 p-0.5 rounded-full text-gray-400 hover:text-gray-200 focus:outline-none"
                  onClick={() => props.setOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <XIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12">
                  <ExclamationIcon className="h-10 w-10 text-red-400" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <Dialog.Title as="h3" className="text-lg leading-6 font-semibold text-white">
                    Delete {props.type}
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-white">{props.message}</p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                {props.closeMode && (
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-lg shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-400 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => props.actionClose()}
                  >
                    Close anyway
                  </button>
                )}
                <button
                  type="button"
                  className={`w-full inline-flex justify-center rounded-lg shadow-sm px-4 py-2 ${
                    props.closeMode ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-400'
                  } text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm`}
                  onClick={() => props.action()}
                >
                  {props.closeMode ? 'Save & Close' : 'Delete'}
                </button>
                
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-lg bg-blueGray-700 dark:bg-gray-800 px-4 py-2 text-base font-medium text-gray-200 hover:text-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => props.setOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ConfirmDeleteModal;
