import React, { Fragment, useRef, useState, useCallback, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { addRegister, updateRegister } from '../../store/registerActions';
import { updateFunction } from '../../store/functionActions';
import { Dispatch } from 'redux';
import { useForm } from 'react-hook-form';
import { Register } from '../../models/register';
import { AddressSpace } from '../../models/address-space';
import { v4 as uuidv4 } from 'uuid';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppSelector, useAppDispatch } from '../../hooks';
import * as yup from 'yup';
import { Access } from '../../models/access';
import { IRegFormInputs } from '../../models/reg-form-inputs';

type RegisterModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  editMode: boolean;
  selectedReg?: string
};

const RegisterModal = (props: RegisterModalProps) => {
  const cancelButtonRef = useRef(null);

  const dispatch: Dispatch<any> = useAppDispatch();

  const addRegisterAction = useCallback(
    (register: Register) => dispatch(addRegister(register)),
    [dispatch, addRegister],
  );

  const updateRegAction = useCallback(
    (register: Register) => dispatch(updateRegister(register)),
    [dispatch, updateRegister],
  );

  const updateFuncAction = useCallback(
    (addressSpace: AddressSpace) => dispatch(updateFunction(addressSpace)),
    [dispatch, updateFunction],
  );

  const regs: readonly Register[] = useAppSelector((state) => state.registerReducer.registers);
  const funcs: readonly AddressSpace[] = useAppSelector((state) => state.functionReducer.addressSpaces);

  const [selectedRegister, setSelectedRegister] = useState<Register>(null);
  const [regID, setRegID] = useState('empty');
  const [funcID, setFuncID] = useState<string>((funcs != null && funcs.length > 0) && funcs[0].id);
  const schema = yup.object().shape({
    name: yup
      .string()
      .typeError('Register name is required')
      .matches(RegExp('^[a-zA-Z0-9_]*$'), 'Use only alphanumeric characters and the underscore')
      .required('Register name is required')
      .test('Register name already exist', 'Register name already exist', (value) => regChecker(value, 'NAME')),
    localAddress: yup
      .string()
      .typeError('Local address is required')
      .matches(RegExp('0[xX][0-9a-fA-F]+'), 'Local address must be an hexadecimal value')
      .required('Local address is required')
      .test('Local address value already exist', 'Local address value already exist', (value) =>
        regChecker(value, 'LOCAL_ADDRESS')
      ),
    access: yup.string().typeError('Access is required').required('Access is required'),
    dim: yup
      .number()
      .typeError('Dim is required')
      .positive('Dim must be positive')
      .integer('Dim must be an integer')
      .required('Dim is required'),
    dimOffset: yup
      .string()
      .typeError('DimOffset is required')
      .matches(RegExp('0[xX][0-9a-fA-F]+'), 'DimOffset must be an hexadecimal value')
      .required('DimOffset is required'),
  });

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm<IRegFormInputs>({
    resolver: yupResolver(schema),
  });

  const regChecker = (value: string, type: string): boolean => {
    setFuncID(funcs[0].id);
    const funcRegs = funcs.find((func) => func.id === funcID);
    if (funcRegs != null && funcRegs.registers != null) {
      let filtered = Array<Register>();
      const fetchedRegs = regs.filter((reg) => funcRegs.registers.some((regID) => reg.id === regID));
      if (type === 'NAME') {
        filtered = fetchedRegs.filter((reg) => reg.name === value && reg.id !== regID);
      } else if (type === 'LOCAL_ADDRESS') {
        filtered = fetchedRegs.filter((reg) => reg.address === parseInt(value, 16) && reg.id !== regID);
      } else {
        return true;
      }
      return filtered.length > 0 ? false : true;
    }
    return true;
  };

  const onSubmit = (data: IRegFormInputs) => {
    props.editMode ? updateReg(data) : createReg(data);
    props.setOpen(false);
    resetInitialValues();
    reset();
  };

  const createReg = (data: IRegFormInputs) => {
    let regAccess: keyof typeof Access = data.access as keyof typeof Access;
    let register: Register = new Register(
      uuidv4(),
      data.parentFunctionId,
      data.name,
      parseInt(data.localAddress, 16),
      Access[regAccess],
      data.description,
      0,
      0,
      data.dim,
      parseInt(data.dimOffset, 16),
      false,
      null,
      null,
      [],
    );

    addRegisterAction(register);
    const funcToUpdate: AddressSpace = funcs.filter((f) => f.id === data.parentFunctionId)[0];
    console.log(funcToUpdate);

    let currentRegs = funcToUpdate.registers;
    currentRegs.push(register.id);
    funcToUpdate.registers = currentRegs;
    updateFuncAction(funcToUpdate);

    clearErrors();
  };

  const updateReg = (data: IRegFormInputs) => {
    let regAccess: keyof typeof Access = data.access as keyof typeof Access;
    const currentParentId = JSON.parse(JSON.stringify(selectedRegister.parentFunctionId)); // create a deep copy

    selectedRegister.address = parseInt(data.localAddress, 16);
    selectedRegister.name = data.name;
    selectedRegister.dim = data.dim;
    selectedRegister.dimOffset = parseInt(data.dimOffset, 16);
    selectedRegister.access = Access[regAccess];
    selectedRegister.parentFunctionId = data.parentFunctionId;
    selectedRegister.description = data.description;

    updateRegAction(selectedRegister);

    const funcToUpdate: AddressSpace = funcs.filter((f) => f.id === data.parentFunctionId)[0];
    const oldFunc: AddressSpace = funcs.filter((f) => f.id === currentParentId)[0];

    let registerArr: string[] = [selectedRegister.id];
    funcToUpdate.registers = registerArr;

    let filteredArr: string[];

    if (currentParentId !== data.parentFunctionId) {
      filteredArr = oldFunc.registers.filter((reg) => reg !== selectedRegister.id);
    } else {
      filteredArr = oldFunc.registers;
    }
    oldFunc.registers = filteredArr;
    updateFuncAction(funcToUpdate);

    updateFuncAction(oldFunc);
    clearErrors();
  };

  const resetInitialValues = () => {
    setValue('name', '');
    setValue('parentFunctionId', '');
    setValue('localAddress', null);
    setValue('dim', null);
    setValue('dimOffset', '');
    setValue('description', '');
    setValue('access', Access[Access.Read]);

    if (funcs.length > 0) {
      setSelectedRegister(null);
      setRegID('empty');
    }
    clearErrors();
  };

  const handleChange = (e: React.FormEvent) => {
    const target = e.target as HTMLSelectElement;
    setRegID(target.value);
  };

  const handleFuncChange = (e: React.FormEvent) => {
    const target = e.target as HTMLSelectElement;
    setFuncID(target.value);
    clearErrors();
  };

  const handleCancel: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    props.setOpen(false);
    resetInitialValues();
    reset();
  };

  useEffect(() => {
    if (props.editMode) {
      if (regID !== 'empty') {
        const selected = regs.filter((reg) => reg.id === regID)[0];
        setValue('parentFunctionId', selected.parentFunctionId);
        setValue('name', selected.name);
        setValue('localAddress', '0x' + selected.address.toString(16));
        setValue('dim', selected.dim);
        setValue('dimOffset', '0x' + selected.dimOffset.toString(16));
        setValue('access', Access[selected.access]);
        setValue('description', selected.description);
        setSelectedRegister(selected);
      } else {
        resetInitialValues();
      }
    }
  }, [regID]);

  useEffect(() => {
    if (props.selectedReg != null) {
      setRegID(props.selectedReg)
    }
  }, [props.selectedReg])

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
            <div className="inline-block align-middle backdrop-filter backdrop-blur-lg backdrop-contrast-75 backdrop-brightness-200 rounded-3xl py-4 text-left overflow-hidden transform transition-all my-8 max-w-lg w-full px-6">
              <div className="text-left px-3 w-full">
                <Dialog.Title as="h3" className="text-xl leading-6 text-center font-medium text-white">
                  {props.editMode ? 'Edit a register' : 'Create a new register'}
                </Dialog.Title>

                <div className="mt-1">
                  {props.editMode && (
                    <div className="mt-2">
                      <label htmlFor="register" className="block text-sm font-medium text-white">
                        Register to edit
                      </label>
                      <div className="mt-1">
                        <select
                          id="registers"
                          name="registers"
                          className="mt-1 py-2 block w-full pl-3 pr-6 font-semibold bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white border rounded-lg focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                          value={regID}
                          onChange={handleChange}
                        >
                          <option value="empty">Choose a register</option>
                          {regs.map((reg, idx) => (
                            <option key={idx} value={reg.id}>
                              {reg.name}
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
                          disabled={props.editMode && regID === 'empty'}
                          defaultValue={props.editMode && selectedRegister !== null ? selectedRegister.name : ''}
                          placeholder="register_name"
                          className="appearance-none block w-full px-3 py-2 disabled:opacity-75 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="parentFunc" className="block text-sm font-medium text-white">
                        Parent Function{' '}
                        <span className="text-indigo-300">
                          {errors.parentFunctionId && ' • ' + errors.parentFunctionId.message}
                        </span>
                      </label>
                      <div className="mt-1">
                        <select
                          {...register('parentFunctionId', {
                            value:
                              props.editMode && selectedRegister !== null
                                ? selectedRegister.parentFunctionId
                                : funcs.length > 0 && funcs[0].id,
                          })}
                          disabled={props.editMode && regID === 'empty'}
                          onChange={handleFuncChange}
                          className="mt-1 py-2 block w-full pl-3 pr-6 text-base bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white border rounded-lg focus:outline-none focus:ring-sky-400 focus:border-sky-400  sm:text-sm"
                        >
                          {funcs.map((func, idx) => (
                            <option key={idx} value={func.id}>
                              {func.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="localAddress" className="block text-sm font-medium text-white">
                        Local Address{' '}
                        <span className="text-indigo-300">
                          {errors.localAddress && ' • ' + errors.localAddress.message}
                        </span>
                      </label>
                      <div className="mt-1">
                        <input
                          {...register('localAddress', { required: true })}
                          type="text"
                          disabled={props.editMode && regID === 'empty'}
                          defaultValue={
                            props.editMode && selectedRegister !== null
                              ? '0x' + selectedRegister.address.toString(16)
                              : ''
                          }
                          placeholder="0x0"
                          className="appearance-none block w-full px-3 py-2 disabled:opacity-75 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-blueGray-400 focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="localAddress" className="block text-sm font-medium text-white">
                        Access <span className="text-indigo-300">{errors.access && ' • ' + errors.access.message}</span>
                      </label>
                      <div className="mt-1">
                        <select
                          {...register('access', {
                            value:
                              props.editMode && selectedRegister !== null
                                ? Access[selectedRegister.access]
                                : Access[Access.Read],
                          })}
                          disabled={props.editMode && regID === 'empty'}
                          className="mt-1 py-2 block w-full pl-3 pr-6 text-base border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                        >
                          {Object.values(Access)
                            .filter((item) => typeof item === 'string')
                            .map((key) => (
                              <option key={key} value={key}>
                                {key}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="size" className="block text-sm font-medium text-white">
                        Dim <span className="text-indigo-300">{errors.dim && ' • ' + errors.dim.message}</span>
                      </label>
                      <div className="mt-1">
                        <input
                          {...register('dim', { required: true })}
                          disabled={props.editMode && regID === 'empty'}
                          defaultValue={props.editMode && selectedRegister !== null ? selectedRegister.dim : ''}
                          type="number"
                          placeholder="1"
                          min="1"
                          className="appearance-none block w-full px-3 py-2 disabled:opacity-75 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="dimOffset" className="block text-sm font-medium text-white">
                        Dim Offset{' '}
                        <span className="text-indigo-300">{errors.dimOffset && ' • ' + errors.dimOffset.message}</span>
                      </label>
                      <div className="mt-1">
                        <input
                          {...register('dimOffset', { required: true })}
                          type="text"
                          disabled={props.editMode && regID === 'empty'}
                          defaultValue={
                            props.editMode && selectedRegister !== null
                              ? '0x' + selectedRegister.dimOffset.toString(16)
                              : '0x'
                          }
                          placeholder="0x0"
                          className="appearance-none block w-full px-3 py-2 disabled:opacity-75 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
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
                            value: props.editMode && selectedRegister !== null ? selectedRegister.description : '',
                          })}
                          disabled={props.editMode && regID === 'empty'}
                          placeholder="Description"
                          className="appearance-none block w-full px-3 py-2 max-h-28 disabled:opacity-75 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-0.5 pt-1 flex justify-between">
                    {props.editMode ? (
                        <div className="text-sm font-medium flex flex-col text-left text-sky-200">
                          <div>{selectedRegister && `Default Value • 0x${selectedRegister.defaultValue.toString(16)}`}</div>
                          <div>{selectedRegister && `Mask • 0x${selectedRegister.mask.toString(16)}`}</div>
                          <div>{selectedRegister && selectedRegister.fields &&`Nb fields • ${selectedRegister.fields.length}`}</div>
                        </div>)
                        : (
                        <div></div>
                      )}
                      <div>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-lg active:scale-95 transform shadow-lg hover:shadow-lg duration-300 px-4 py-2 bg-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-base text-gray-300 font-medium sm:mt-0 sm:w-auto sm:text-sm focus:outline-none"
                          onClick={handleCancel}
                          ref={cancelButtonRef}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={props.editMode && regID === 'empty'}
                          className={`w-full inline-flex justify-center rounded-lg shadow-lg px-4 py-2 disabled:transform-none disabled:opacity-50 disabled:bg-yellow-500  bg-${
                            props.editMode ? 'yellow' : 'emerald'
                          }-400 text-base font-medium text-white hover:bg-${
                            props.editMode ? 'yellow' : 'emerald'
                          }-500 duration-300 transform hover:scale-95 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm`}
                        >
                          {props.editMode ? 'Edit' : 'Add'} Register
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

export default RegisterModal;
