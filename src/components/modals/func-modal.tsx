import React, { Fragment, useRef, useState, useCallback, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { updateFunction } from '../../store/functionActions';
import { Dispatch } from 'redux';
import { useForm } from 'react-hook-form';
import { AddressSpace } from '../../models/address-space';
import { v4 as uuidv4 } from 'uuid';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppSelector, useAppDispatch } from '../../hooks';
import * as yup from 'yup';

type FuncModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  editMode: boolean;
  selectedFunc?: string
};

interface IFormInputs {
  name: string;
  baseAddress: string;
  size: number;
  dataWidth: number;
}

const FuncModal = (props: FuncModalProps) => {
  const cancelButtonRef = useRef(null);
  const dispatch: Dispatch<any> = useAppDispatch();

  const updateFuncAction = useCallback(
    (addressSpace: AddressSpace) => dispatch(updateFunction(addressSpace)),
    [dispatch, updateFunction],
  );

  const funcs: readonly AddressSpace[] = useAppSelector((state) => state.functionReducer.addressSpaces);
  const [selectedFunction, setSelectedFunction] = useState<AddressSpace>(null);
  const [funcID, setFuncID] = useState('empty');

  const schema = yup.object().shape({
    name: yup
      .string()
      .typeError('Function name is required')
      .matches(RegExp('^[a-zA-Z0-9_]*$'), 'Use only alphanumeric characters and the underscore')
      .required('Function name is required')
      .test('Function name already exist', 'Function name already exist', (value) =>
        funcs.filter((func) => func.name === value && func.id !== funcID).length > 0 ? false : true,
      ),
    baseAddress: yup
      .string()
      .typeError('Base address is required')
      .matches(RegExp('0[xX][0-9a-fA-F]+'), 'Base address must be an hexadecimal value')
      .required('Base address is required')
      .test('Base Address already exist', 'Base Address already exist', (value) =>
        funcs.filter((func) => func.baseAddress === parseInt(value, 16) && func.id !== funcID).length > 0 ? false : true,
      ),
    size: yup
      .number()
      .typeError('Size is required')
      .positive('Size must be positive')
      .integer('Size must be an integer')
      .required('Size is required'),
    dataWidth: yup
      .number()
      .typeError('DataWidth is required')
      .positive('DataWidth must be positive')
      .integer('DataWidth must be an integer')
      .required('DataWidth is required'),
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: IFormInputs) => {
    props.editMode ? updateFunc(data) : createFunc(data);
    props.setOpen(false);
    resetInitialValues();
    reset();
  };

  const createFunc = (data: IFormInputs) => {
    let addressSpace: AddressSpace = new AddressSpace(
      uuidv4(),
      data.name,
      parseInt(data.baseAddress, 16),
      data.size,
      data.dataWidth,
      'short description',
      null,
      null,
      [] as string[],
      [] as string[],
    );
    AddressSpace.add(addressSpace)
  };

  const updateFunc = (data: IFormInputs) => {
    selectedFunction.baseAddress = parseInt(data.baseAddress, 16);
    selectedFunction.name = data.name;
    selectedFunction.size = data.size;
    selectedFunction.width = data.dataWidth;

    updateFuncAction(selectedFunction);
  };

  const resetInitialValues = () => {
    setValue('name', '');
    setValue('baseAddress', '');
    setValue('size', null);
    setValue('dataWidth', null);
    if (funcs.length > 0) {
      setSelectedFunction(null);
      setFuncID('empty');
    }
  };

  const handleChange = (e: React.FormEvent) => {
    const target = e.target as HTMLSelectElement;
    setFuncID(target.value);
  };

  const handleCancel: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    props.setOpen(false);
    resetInitialValues();
    reset();
  };

  useEffect(() => {
    if (props.editMode) {
      if (funcID !== 'empty') {
        const selected = funcs.filter((func) => func.id === funcID)[0];
        setValue('name', selected.name);
        setValue('baseAddress', '0x' + selected.baseAddress.toString(16));
        setValue('size', selected.size);
        setValue('dataWidth', selected.width);
        setSelectedFunction(selected);
      } else {
        resetInitialValues();
      }
    }
  }, [funcID]);

  useEffect(() => {
    if (props.selectedFunc != null) {
      setFuncID(props.selectedFunc)
    }
  }, [props.selectedFunc])

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
            <div className="inline-block align-middle backdrop-filter backdrop-blur-md backdrop-contrast-75 backdrop-brightness-200  rounded-3xl py-6 text-left overflow-hidden transform-gpu transition-all my-8 max-w-lg w-full px-6">
              <div className="text-left px-3 w-full">
                <Dialog.Title as="h3" className="text-xl leading-6 text-center font-medium text-white">
                  {props.editMode ? 'Edit a function' : 'Create a new function'}
                </Dialog.Title>

                <div className="mt-1">
                  {props.editMode && (
                    <div className="mt-4">
                      <label htmlFor="baseAddress" className="block text-sm font-medium text-white">
                        Function to edit
                      </label>
                      <div className="mt-1">
                        <select
                          id="functions"
                          name="functions"
                          className="mt-1 py-2 block w-full pl-3 pr-6 text-base border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg focus:outline-none focus:ring-lightBlue-400 focus:border-lightBlue-400 sm:text-sm"
                          value={funcID}
                          onChange={handleChange}
                        >
                          <option value="empty">Choose a function</option>
                          {funcs.map((func, idx) => (
                            <option key={idx} value={func.id}>
                              {func.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
                    <div className={props.editMode ? 'mt-1' : 'mt-4'}>
                      <label htmlFor="name" className="block text-sm font-medium text-white">
                        Name <span className="text-indigo-300">{errors.name && ' • ' + errors.name.message}</span>
                      </label>
                      <div className="mt-1">
                        <input
                          {...register('name', { required: true })}
                          type="text"
                          disabled={props.editMode && funcID === 'empty'}
                          defaultValue={props.editMode && selectedFunction !== null ? selectedFunction.name : ''}
                          placeholder="function_name"
                          className="appearance-none block w-full px-3 py-2 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-lightBlue-400 focus:border-lightBlue-400 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="baseAddress" className="block text-sm font-medium text-white">
                        Base Address{' '}
                        <span className="text-indigo-300">
                          {errors.baseAddress && ' • ' + errors.baseAddress.message}
                        </span>
                      </label>
                      <div className="mt-1">
                        <input
                          {...register('baseAddress', { required: true })}
                          type="text"
                          disabled={props.editMode && funcID === 'empty'}
                          defaultValue={
                            props.editMode && selectedFunction !== null
                              ? '0x' + selectedFunction.baseAddress.toString(16)
                              : ''
                          }
                          placeholder="0x0"
                          className="appearance-none block w-full px-3 py-2 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-lightBlue-400 focus:border-lightBlue-400 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="size" className="block text-sm font-medium text-white">
                        Size <span className="text-indigo-300">{errors.size && ' • ' + errors.size.message}</span>
                      </label>
                      <div className="mt-1">
                        <input
                          {...register('size', { required: true })}
                          disabled={props.editMode && funcID === 'empty'}
                          defaultValue={props.editMode && selectedFunction !== null ? selectedFunction.size : ''}
                          type="number"
                          placeholder="1024"
                          min="0"
                          className="appearance-none block w-full px-3 py-2 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-lightBlue-400 focus:border-lightBlue-400 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="dataWidth" className="block text-sm font-medium text-white">
                        DataWidth{' '}
                        <span className="text-indigo-300">{errors.dataWidth && ' • ' + errors.dataWidth.message}</span>
                      </label>

                      <div className="mt-1">
                        <input
                          {...register('dataWidth', { required: true })}
                          disabled={props.editMode && funcID === 'empty'}
                          type="number"
                          defaultValue={props.editMode && selectedFunction !== null ? selectedFunction.width : ''}
                          placeholder="32"
                          min="0"
                          className="appearance-none block w-full px-3 py-2 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-lightBlue-400 focus:border-lightBlue-400 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-2 pt-3 flex justify-between">
                      {props.editMode ? (
                        <div className="p-0.5 rounded-lg text-sm font-medium text-sky-200">
                          {selectedFunction &&
                            selectedFunction.registers &&
                            `Nb registers • ${selectedFunction.registers.length}`}
                        </div>
                      ) : (
                        <div></div>
                      )}
                      <div>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-lg active:scale-95 transform-gpu shadow-lg hover:shadow-lg duration-300 px-4 py-2 bg-blueGray-600 dark:bg-gray-700 text-base text-gray-300 font-medium sm:mt-0 sm:w-auto sm:text-sm focus:outline-none"
                          onClick={handleCancel}
                          ref={cancelButtonRef}
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={props.editMode && funcID === 'empty'}
                          className={`w-full inline-flex justify-center rounded-lg shadow-md px-4 py-2 disabled:transform-none disabled:opacity-50 disabled:bg-yellow-500  bg-${
                            props.editMode ? 'yellow' : 'emerald'
                          }-400 text-base font-medium text-white hover:bg-${
                            props.editMode ? 'yellow' : 'emerald'
                          }-500 duration-300 transform-gpu hover:scale-95 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm`}
                        >
                          {props.editMode ? 'Edit' : 'Add'} Function
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

export default FuncModal;
