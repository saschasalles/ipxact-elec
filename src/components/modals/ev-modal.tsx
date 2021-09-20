import React, { Fragment, useRef, useState, useCallback, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { addEV, updateEV } from '../../store/evActions';
import { updateField } from '../../store/fieldActions';
import { Dispatch } from 'redux';
import { useForm } from 'react-hook-form';
import { Field } from '../../models/field';
import { EnumeratedValue } from '../../models/enumerated-value';
import { v4 as uuidv4 } from 'uuid';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppSelector, useAppDispatch } from '../../hooks';
import * as yup from 'yup';
import { current } from '@reduxjs/toolkit';

type EVModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  editMode: boolean;
  register?: string;
};

interface IFormInputs {
  parentFieldID: string;
  name: string;
  value: string;
  description: string;
}

const EVModal = (props: EVModalProps) => {
  const cancelButtonRef = useRef(null);
  const dispatch: Dispatch<any> = useAppDispatch();
  const addEVAction = useCallback((ev: EnumeratedValue) => dispatch(addEV(ev)), [dispatch, addEV]);

  const updateEVAction = useCallback((ev: EnumeratedValue) => dispatch(updateEV(ev)), [dispatch, updateEV]);

  const storeFields: readonly Field[] = useAppSelector((state) => state.fieldReducer.fields);
  const storeEVS: readonly EnumeratedValue[] = useAppSelector((state) => state.enumeratedValueReducer.enumeratedValues);
  const [selectedEV, setSelectedEV] = useState<EnumeratedValue>(null);
  const [currentRegister, setCurrentRegister] = useState<string>(null);
  const [evID, setEVID] = useState('empty');
  const [fieldID, setFieldID] = useState<string>(
    currentRegister != null &&
      storeFields != null &&
      storeFields.length > 0 &&
      storeFields.find((fi) => fi.parentRegID === currentRegister) != null
      ? storeFields.find((fi) => fi.parentRegID === currentRegister).id
      : null,
  );

  const schema = yup.object().shape({
    name: yup
      .string()
      .typeError('Enumerated value name is required')
      .matches(RegExp('^[a-zA-Z0-9_]*$'), 'Use only alphanumeric characters and the underscore')
      .required('Enumerated value name is required')
      .test('Enumerated value name already exist', 'Enumerated value name already exist', (value) =>
        evChecker(value, evID, 'NAME'),
      ),
    value: yup
      .string()
      .typeError('Value is required')
      .matches(RegExp('0[xX][0-9a-fA-F]+'), 'Value must be an hexadecimal value')
      .required('Value is required'),
  });

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: IFormInputs) => {
    props.editMode ? editEV(data) : createEV(data);
    props.setOpen(false);
    resetInitialValues();
    reset();
  };

  const createEV = (data: IFormInputs) => {
    let ev: EnumeratedValue = new EnumeratedValue(
      uuidv4(),
      data.parentFieldID,
      data.name,
      parseInt(data.value, 16),
      data.description,
    );
    addEVAction(ev);

    let currentField = storeFields.find((f) => f.id === data.parentFieldID);
    currentField.enumeratedValues.push(ev.id);
    updateField(currentField);
  };

  const editEV = (data: IFormInputs) => {
    selectedEV.name = data.name;
    selectedEV.value = parseInt(data.value, 16);
    selectedEV.description = data.description

    updateEVAction(selectedEV);
  };

  const resetInitialValues = () => {
    setValue('parentFieldID', '');
    setValue('name', '');
    setValue('value', '');
    setValue('description', '');
    if (storeFields.length > 0) {
      setSelectedEV(null);
      setEVID('empty');
    }
  };

  const evChecker = (value: string, evID: string, type: string): boolean => {
    const evsFields = storeFields.find((f) => f.id === fieldID);
    console.log(evsFields, fieldID);
    if (evsFields.enumeratedValues !== null) {
      let filtered = Array<EnumeratedValue>();
      const fetchedEVS = storeEVS.filter((ev) => evsFields.enumeratedValues.some((evID) => ev.id === evID));
      console.log(fetchedEVS);
      if (type === 'NAME') {
        filtered = fetchedEVS.filter((ev) => ev.name === value && ev.id !== evID);
      } else if (type === 'VALUE') {
        filtered = fetchedEVS.filter((ev) => ev.value === parseInt(value, 16) && ev.id !== evID);
      } else {
        return true;
      }
      return filtered.length > 0 ? false : true;
    }
    return true;
  };

  const handleChange = (e: React.FormEvent) => {
    const target = e.target as HTMLSelectElement;
    setEVID(target.value);
  };

  const handleFieldChange = (e: React.FormEvent) => {
    const target = e.target as HTMLSelectElement;
    setFieldID(target.value);
    clearErrors();
  };

  const handleCancel: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    props.setOpen(false);
    resetInitialValues();
    reset();
  };

  useEffect(() => {
    if (props.editMode) {
      if (evID !== 'empty') {
        // const currentField = storeFields.find(f => f.id === fieldID)
        const selected = storeEVS.filter((ev) => ev.parentFieldID === fieldID)[0];
        setValue('name', selected.name);
        setValue('value', '0x' + selected.value.toString(16));
        setValue('description', selected.description)
        setSelectedEV(selected);
      } else {
        resetInitialValues();
      }
    }
  }, [evID, fieldID, storeEVS]);

  useEffect(() => {
    setCurrentRegister(props.register);
    setFieldID(
      currentRegister != null &&
        storeFields != null &&
        storeFields.length > 0 &&
        storeFields.find((fi) => fi.parentRegID === currentRegister) != null
        ? storeFields.find((fi) => fi.parentRegID === currentRegister).id
        : null,
    );
  }, [props.register, storeFields]);

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
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-middle backdrop-filter backdrop-blur-lg backdrop-contrast-75 backdrop-brightness-200 rounded-3xl py-6 text-left overflow-hidden transform transition-all my-8 max-w-lg w-full px-6">
              <div className="text-left px-3 w-full">
                <Dialog.Title as="h3" className="text-xl leading-6 text-center font-medium text-white">
                  {props.editMode ? 'Edit an enumerated value' : 'Create a new enumerated value'}
                </Dialog.Title>

                <div className="mt-1">
                  <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
                      <div className="mt-4">
                        <label htmlFor="field" className="block text-sm font-medium text-white">
                          Parent field
                        </label>
                        <div className="mt-1">
                          <select
                            {...register('parentFieldID', {
                              value: fieldID,
                            })}
                            className="mt-1 py-2 block w-full pl-3 pr-6 font-semibold bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white border rounded-lg focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                            onChange={handleFieldChange}
                          >
                            {storeFields
                              .filter((fi) => fi.parentRegID === currentRegister)
                              .map((f, idx) => (
                                <option key={idx} value={f.id}>
                                  {f.name}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>

                    {props.editMode && (
                      <div className="mt-4">
                        <label htmlFor="ev" className="block text-sm font-medium text-white">
                          Enumerated Value to edit
                        </label>
                        <div className="mt-1">
                          <select
                            id="evs"
                            name="evs"
                            className="mt-1 py-2 block w-full pl-3 pr-6 text-base border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg focus:outline-none focus:ring-lightBlue-400 focus:border-lightBlue-400 sm:text-sm"
                            value={evID}
                            onChange={handleChange}
                          >
                            <option value="empty">Choose an enumerated value</option>
                            {storeEVS.filter(e => e.parentFieldID === fieldID).map((ev, idx) => (
                              <option key={idx} value={ev.id}>
                                {ev.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <div className={props.editMode ? 'mt-1' : 'mt-4'}>
                      <label htmlFor="name" className="block text-sm font-medium text-white">
                        Name <span className="text-indigo-300">{errors.name && ' • ' + errors.name.message}</span>
                      </label>
                      <div className="mt-1">
                        <input
                          {...register('name', { required: true })}
                          type="text"
                          disabled={props.editMode && evID === 'empty'}
                          defaultValue={props.editMode && selectedEV !== null ? selectedEV.name : ''}
                          placeholder="enumerated_value_name"
                          className="appearance-none block w-full px-3 py-2 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-lightBlue-400 focus:border-lightBlue-400 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="value" className="block text-sm font-medium text-white">
                        Value <span className="text-indigo-300">{errors.value && ' • ' + errors.value.message}</span>
                      </label>
                      <div className="mt-1">
                        <input
                          {...register('value', { required: true })}
                          type="text"
                          disabled={props.editMode && evID === 'empty'}
                          defaultValue={props.editMode && evID !== null ? '0x' + selectedEV?.value.toString(16) : ''}
                          placeholder="0x0"
                          className="appearance-none block w-full px-3 py-2 border bg-blueGray-600 border-blueGray-600 text-white dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-lightBlue-400 focus:border-lightBlue-400 sm:text-sm"
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
                            value: props.editMode && selectedEV !== null ? selectedEV.description : '',
                          })}
                          disabled={props.editMode && evID === 'empty'}
                          placeholder="Description"
                          className="appearance-none block w-full px-3 py-2 max-h-28 disabled:opacity-75 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-2 pt-3 flex justify-between">
                      <div>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-lg active:scale-95 transform shadow-lg hover:shadow-lg duration-300 px-4 py-2 bg-blueGray-600 dark:bg-gray-700 text-base text-gray-300 font-medium sm:mt-0 sm:w-auto sm:text-sm focus:outline-none"
                          onClick={handleCancel}
                          ref={cancelButtonRef}
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={props.editMode && evID === 'empty'}
                          className={`w-full inline-flex justify-center rounded-lg shadow-md px-4 py-2 disabled:transform-none disabled:opacity-50 disabled:bg-yellow-500  bg-${
                            props.editMode ? 'yellow' : 'emerald'
                          }-400 text-base font-medium text-white hover:bg-${
                            props.editMode ? 'yellow' : 'emerald'
                          }-500 duration-300 transform hover:scale-95 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm`}
                        >
                          {props.editMode ? 'Edit' : 'Add'}
                        </button>
                      </div>
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

export default EVModal;
