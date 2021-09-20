import React from 'react';
import { Fragment, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';

type LoadingModalProps = {
  open: boolean;
  error?: string;
  setOpen: () => void;
};

const LoadingModal = (props: LoadingModalProps) => {
  const [showInfo, setShowInfo] = useState(false);
  const cancelButtonRef = useRef(null);
  return (
    <Transition.Root show={props.open} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-10 inset-0 overflow-y-auto h-screen"
        initialFocus={cancelButtonRef}
        open={props.open}
        onClose={() => {}}
      >
        <div className="flex items-center justify-center min-h-screen pt-4 text-center ">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay
              className={`fixed inset-0 ${
                props.error ? 'bg-gray-900 bg-opacity-50' : 'bg-transparent'
              }  transition-opacity`}
            />
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
            <div className="inline-block align-middle backdrop-filter backdrop-blur-xl backdrop-contrast-75 backdrop-brightness-200 rounded-2xl py-3 px-2 text-left overflow-hidden shadow-xl transform transition-all max-w-lg w-full">
              <div>
                <div className={`${props.error ? 'text-yellow-600' : 'animate-pulse text-white'}`}>
                  <Dialog.Title as="h3" className="text-lg text-center leading-6 font-medium  ">
                    {props.error ? 'Error' : 'Loading ...'}
                  </Dialog.Title>
                  <div className="mt-2 text-center">
                    <p className="text-sm">
                      {props.error
                        ? 'An error occured while reading your file, please ensure your file is conform to the IP-XACT standard'
                        : 'We are analysing your file, please wait a few second'}
                    </p>
                  </div>

                  {props.error && showInfo && <p className="text-white text-sm text-center p-2 rounded-lg bg-gray-900 opacity-50">{props.error}</p>}
                  <div className="flex justify-center space-x-2">
                    <button
                      type="button"
                      ref={cancelButtonRef}
                      onClick={() => props.setOpen()}
                      className={`${
                        props.error ? 'visible block' : 'invisible hidden'
                      } mt-2 inline-flex justify-center rounded-lg active:scale-95 transform shadow-lg hover:shadow-lg duration-300 px-4 py-2 bg-blueGray-700 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-sm text-white font-medium w-auto focus:outline-none`}
                    >
                      Dismiss
                    </button>
                    {props.error && (
                      <button
                        type="button"
                        ref={cancelButtonRef}
                        onClick={() => setShowInfo(!showInfo)}
                        className={`${
                          showInfo ? 'bg-indigo-600' : 'bg-gray-800'
                        } mt-2 space-x-1 inline-flex group items-center align-middle justify-center rounded-lg active:scale-95 transform shadow-lg hover:shadow-lg duration-300 px-4 py-2 dark:border-transparent text-sm text-white font-medium w-auto focus:outline-none`}
                      >
                        {showInfo ? (
                          <span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                              />
                            </svg>
                          </span>
                        ) : (
                          <span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </span>
                        )}
                        <span>Debug Info</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default LoadingModal;
