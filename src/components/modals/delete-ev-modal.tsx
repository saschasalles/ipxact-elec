import React, { useState, useEffect, useCallback, Fragment, useRef } from 'react';
import { EnumeratedValue } from '../../models/enumerated-value';
import { Field } from '../../models/field';
import { Dispatch } from 'redux';
import { useForm } from 'react-hook-form';
import { removeEVS, updateEV } from '../../store/evActions';
import { updateField } from '../../store/fieldActions';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { Dialog, Transition } from '@headlessui/react';
import { XIcon } from '@heroicons/react/outline';
import { TrashIcon } from '@heroicons/react/outline';
import { Popover } from '@headlessui/react';

type DeleteEVModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  register?: string;
};

const DeleteEVModal = (props: DeleteEVModalProps) => {
  const cancelButtonRef = useRef(null);
  const dispatch: Dispatch<any> = useAppDispatch();
  const storeFields: readonly Field[] = useAppSelector((state) => state.fieldReducer.fields);
  const storeEVS: readonly EnumeratedValue[] = useAppSelector((state) => state.enumeratedValueReducer.enumeratedValues);
  const updateFieldAction = useCallback((field: Field) => dispatch(updateField(field)), [dispatch, updateField]);
  const removeEVSAction = useCallback((evs: EnumeratedValue[]) => dispatch(removeEVS(evs)), [dispatch, removeEVS]);
  const [currentField, setCurrentField] = useState<string>('empty');
  const [currentReg, setCurrentReg] = useState<string>(null);

  useEffect(() => {
    props.register != null && setCurrentReg(props.register);
    setCurrentField('empty')
  }, [props.register]);

  const handleFieldChange = (e: React.FormEvent) => {
    const target = e.target as HTMLSelectElement;
    setCurrentField(target.value);
  };

  const deleteEV = (id: string) => {
    let currentEV = storeEVS.find(e => e.id === id)
    if (currentEV != null) {
        let parentField = storeFields.find(f => f.id === currentEV.parentFieldID)

        removeEVSAction([currentEV])
        parentField.enumeratedValues = parentField.enumeratedValues.filter(e => e !== currentEV.id)
        updateField(parentField)
    }

  };

  return (
    <Transition.Root show={props.open} as={Fragment}>
      <Dialog
        as="div"
        static
        className="fixed z-10 inset-0 overflow-y-auto h-screen"
        initialFocus={cancelButtonRef}
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
            <Dialog.Overlay className="fixed inset-0 bg-blueGray-800 bg-opacity-75 transition-opacity" />
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
            <div className="inline-block align-middle backdrop-filter backdrop-blur-md backdrop-contrast-75 backdrop-brightness-200 rounded-3xl py-6 text-left overflow-hidden transform transition-all my-8 max-w-lg w-full px-6">
              <div className="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
                <button
                  type="button"
                  className="bg-blueGray-600 p-0.5 rounded-full text-gray-400 hover:text-gray-200 focus:outline-none"
                  onClick={() => props.setOpen(false)}
                >
                  <span className="sr-only">Close</span>
                  <XIcon className="h-6 w-6" aria-hidden="true" />
                </button>
              </div>
              <div className="text-left px-3 w-full">
                <Dialog.Title as="h3" className="text-xl leading-6 text-center font-medium text-white">
                  Delete an enumerated value
                </Dialog.Title>
                <div className="mt-4">
                  <label htmlFor="parentField" className="block text-sm font-medium text-white">
                    Parent field
                  </label>
                  <div className="mt-1">
                    <select
                      id="currentField"
                      name="currentField"
                      className="mt-1 py-2 block w-full pl-3 pr-6 font-semibold bg-blueGray-600 border-blueGray-600 text-white border rounded-lg focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                      value={currentField}
                      onChange={handleFieldChange}
                    >
                      <option value="empty">Choose a field</option>
                      {storeFields
                        .filter((fi) => fi.parentRegID === currentReg)
                        .map((f, idx) => (
                          <option key={idx} value={f.id}>
                            {f.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="mt-3 space-x-2 w-full">
                    {storeEVS
                      .filter((ev) => ev.parentFieldID === currentField)
                      .map((e, idx) => (
                          <span key={idx} className="inline-flex rounded-md items-center py-0.5 pr-1 pl-2 text-sm font-medium bg-red-800 text-white space-x-2">
                            {e.name} : {e.value} •
                            <button
                              type="button"
                              onClickCapture={() => deleteEV(e.id)}
                              className="flex-shrink-0 h-5 w-5 inline-flex items-center justify-center text-white  hover:text-red-200 focus:outline-none"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </span>
                      ))}
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

export default DeleteEVModal;
