import React, { Fragment, useState } from 'react';
import { Dialog, Portal, Transition } from '@headlessui/react';
import { DuplicateIcon, XIcon } from '@heroicons/react/outline';

type DuplicationModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  action: (nbDup: number) => void;
  title: string;
  type: string;
};

const DuplicationModal = (props: DuplicationModalProps) => {
  const [selectedNb, setSelectedNb] = useState(1);


  const handleChange = (e: React.FormEvent) => {
    const target = e.target as HTMLInputElement;
    setSelectedNb(parseInt(target.value));
  };

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
              <div className="block">
                <div className="mx-auto items-center justify-center h-12 w-12">
                  <DuplicateIcon className="h-10 w-10 text-white" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-center w-auto py-2">
                    <Dialog.Title as="h3" className="text-lg leading-6 font-semibold text-white">
                      Duplicate {props.type}
                    </Dialog.Title>
                  </div>
                    <input
                      defaultValue={1}
                      onChange={handleChange}
                      type="number"
                      name="dupNb"
                      id="dupNb"
                      className="text-white focus:outline-none focus:ring-2 focus:ring-sky-300 w-full sm:text-sm border-transparent rounded-lg bg-blueGray-600 dark:bg-gray-700 placeholder-gray-300 mt-3"
                      placeholder="1"
                      min={1}
                    />
                </div>
              </div>
              <div className="mx-auto sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  disabled={selectedNb <= 0 || selectedNb == null || selectedNb == NaN}
                  form="dup-form"
                  className={`w-full inline-flex justify-center rounded-lg shadow-sm px-4 py-2 bg-indigo-600 disabled:opacity-50 hover:bg-emerald-500' 
                  } text-base font-medium text-white focus:outline-none sm:ml-3 sm:w-auto sm:text-sm`}
                  onClick={() => props.action(selectedNb)}
                >
                  Duplicate
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default DuplicationModal;
