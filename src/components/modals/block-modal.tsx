import React, { Fragment, useRef, useState, useCallback, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { updateFunction } from '../../store/functionActions';
import { addBlock, updateBlock, removeBlocks } from '../../store/blockActions';
import { Dispatch } from 'redux';
import { useForm } from 'react-hook-form';
import { Block } from '../../models/block';
import { AddressSpace } from '../../models/address-space';
import { v4 as uuidv4 } from 'uuid';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppSelector, useAppDispatch } from '../../hooks';
import * as yup from 'yup';

const electron = window.require('electron');
const remote = electron.remote;

type BlockModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  editMode: boolean;
};

interface IBlockFormInputs {
  parentFunctionId: string;
  name: string;
  baseAddress: string;
  size: number;
  dataWidth: number;
  description: string;
}

const BlockModal = (props: BlockModalProps) => {
  const cancelButtonRef = useRef(null);
  const dispatch: Dispatch<any> = useAppDispatch();
  const addBlockAction = useCallback((block: Block) => dispatch(addBlock(block)), [dispatch, addBlock]);
  const updateBlockAction = useCallback((block: Block) => dispatch(updateBlock(block)), [dispatch, updateBlock]);
  const updateFuncAction = useCallback(
    (addressSpace: AddressSpace) => dispatch(updateFunction(addressSpace)),
    [dispatch, updateFunction],
  );

  const funcs: readonly AddressSpace[] = useAppSelector((state) => state.functionReducer.addressSpaces);
  const blocks: readonly Block[] = useAppSelector((state) => state.blockReducer.blocks);

  const [selectedBlock, setSelectedBlock] = useState<Block>(null);
  const [blockID, setBlockD] = useState('empty');
  const [funcID, setFuncID] = useState<string>(funcs !== null && funcs.length > 0 && funcs[0].id);

  const schema = yup.object().shape({
    name: yup
      .string()
      .typeError('Block name is required')
      .matches(RegExp('^[a-zA-Z0-9_]*$'), 'Use only alphanumeric characters and the underscore')
      .required('Block name is required')
      .test('Block name already exist', 'Block name already exist', (value) => bkChecker(value, 'NAME')),
    baseAddress: yup
      .string()
      .typeError('Base address is required')
      .matches(RegExp('0[xX][0-9a-fA-F]+'), 'Base address must be an hexadecimal value')
      .required('Base address is required')
      .test('Base address value already exist', 'Base address value already exist', (value) => bkChecker(value, 'BASE_ADDRESS')),
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
    clearErrors,
    formState: { errors },
    reset,
  } = useForm<IBlockFormInputs>({
    resolver: yupResolver(schema),
  });

  const bkChecker = (value: string, type: string): boolean => {
    setFuncID(funcs[0].id);
    const funcBks = funcs.find((func) => func.id === funcID);
    if (funcBks != null && funcBks.blocks != null) {
      let filtered = Array<Block>();
      const fetchedBks = blocks.filter((bk) => funcBks.blocks.some((bkID) => bk.id === bkID));
      if (type === 'NAME') {
        filtered = fetchedBks.filter((bk) => bk.name === value && bk.id !== blockID);
      } else if (type === 'BASE_ADDRESS') {
        filtered = fetchedBks.filter((bk) => bk.baseAddress === parseInt(value, 16) && bk.id !== blockID);
      } else {
        return true;
      }
      return filtered.length > 0 ? false : true;
    }
    return true;
  };

  const onSubmit = (data: IBlockFormInputs) => {
    console.log("submit");
    props.editMode ? editBlock(data) : createBlock(data);
    props.setOpen(false);
    resetInitialValues();
    reset();
  };

  const createBlock = (data: IBlockFormInputs) => {
    let block: Block = new Block(
      uuidv4(),
      data.name,
      parseInt(data.baseAddress, 16),
      data.size,
      data.dataWidth,
      data.description,
      data.parentFunctionId,
    );
    console.log(block);
    addBlockAction(block);

    const funcToUpdate: AddressSpace = funcs.filter((f) => f.id === data.parentFunctionId)[0];
    let blockArr: string[] = [block.id];
    let currentBlocks = funcToUpdate.blocks;
    currentBlocks.push(block.id);
    funcToUpdate.blocks = currentBlocks;
    updateFuncAction(funcToUpdate);
    clearErrors();
  };

  const editBlock = (data: IBlockFormInputs) => {
    const currentParentId = JSON.parse(JSON.stringify(selectedBlock.parentFunc)); // create a deep copy
    selectedBlock.baseAddress = parseInt(data.baseAddress, 16);
    selectedBlock.name = data.name;
    selectedBlock.size = data.size;
    selectedBlock.width = data.dataWidth;
    selectedBlock.parentFunc = data.parentFunctionId;
    selectedBlock.description = data.description;

    updateBlockAction(selectedBlock);
    const funcToUpdate: AddressSpace = funcs.filter((f) => f.id === data.parentFunctionId)[0];
    const oldFunc: AddressSpace = funcs.filter((f) => f.id === currentParentId)[0];

    let blockArr: string[] = [selectedBlock.id];
    funcToUpdate.blocks = blockArr;
    let filteredArr: string[];

    if (currentParentId !== data.parentFunctionId) {
      filteredArr = oldFunc.blocks.filter((bk) => bk !== selectedBlock.id);
    } else {
      filteredArr = oldFunc.blocks;
    }
    oldFunc.blocks = filteredArr;
    updateFuncAction(funcToUpdate);
    updateFuncAction(oldFunc);
    clearErrors();
  };

  const resetInitialValues = () => {
    setValue('name', '');
    setValue('parentFunctionId', '');
    setValue('baseAddress', '');
    setValue('size', null);
    setValue('dataWidth', null);
    setValue('description', '');
    if (funcs.length > 0) {
      setSelectedBlock(null);
      setBlockD('empty');
    }
  };

  const handleChange = (e: React.FormEvent) => {
    const target = e.target as HTMLSelectElement;
    setBlockD(target.value);
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
      if (blockID !== 'empty') {
        const selected = blocks.filter((bk) => bk.id === blockID)[0];
        setValue('name', selected.name);
        setValue('parentFunctionId', selected.parentFunc);
        setValue('baseAddress', '0x' + selected.baseAddress.toString(16));
        setValue('size', selected.size);
        setValue('dataWidth', selected.width);
        setValue('description', selected.description);
        setSelectedBlock(selected);
      } else {
        resetInitialValues();
      }
    }
  }, [blockID]);

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
              <div className="inline-block align-middle backdrop-filter backdrop-blur-lg backdrop-contrast-75 backdrop-brightness-200 rounded-3xl py-6 text-left overflow-hidden transform-gpu transition-all my-8 max-w-lg w-full px-6">
                <div className="text-left px-3 w-full">
                  <Dialog.Title as="h3" className="text-xl leading-6 text-center font-medium text-white">
                    {props.editMode ? 'Edit a block' : 'Create a new block'}
                  </Dialog.Title>

                  <div className="mt-1">
                    {props.editMode && (
                      <div className="mt-4">
                        <label htmlFor="baseAddress" className="block text-sm font-medium text-white">
                          Block to edit
                        </label>
                        <div className="mt-1">
                          <select
                            id="functions"
                            name="functions"
                            className="mt-1 py-2 block w-full pl-3 pr-6 text-base border bg-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 border-blueGray-600 text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-lightBlue-400 focus:border-lightBlue-400 sm:text-sm"
                            value={blockID}
                            onChange={handleChange}
                          >
                            <option value="empty">Choose a block</option>
                            {blocks.map((bk, idx) => (
                              <option key={idx} value={bk.id}>
                                {bk.name}
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
                            disabled={props.editMode && blockID === 'empty'}
                            defaultValue={props.editMode && selectedBlock !== null ? selectedBlock.name : ''}
                            placeholder="block_name"
                            className="appearance-none block w-full px-3 py-2 border disabled:opacity-75  bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-lightBlue-400 focus:border-lightBlue-400 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="localAddress" className="block text-sm font-medium text-white">
                          Parent Function{' '}
                          <span className="text-indigo-300">
                            {errors.parentFunctionId && ' • ' + errors.parentFunctionId.message}
                          </span>
                        </label>
                        <div className="mt-1">
                          <select
                            {...register('parentFunctionId', {
                              value:
                                props.editMode && selectedBlock !== null
                                  ? selectedBlock.parentFunc
                                  : funcs.length > 0 && funcs[0].id,
                            })}
                            disabled={props.editMode && blockID === 'empty'}
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
                            disabled={props.editMode && blockID === 'empty'}
                            defaultValue={
                              props.editMode && selectedBlock !== null
                                ? '0x' + selectedBlock.baseAddress.toString(16)
                                : ''
                            }
                            placeholder="0x0"
                            className="appearance-none block w-full px-3 py-2 border disabled:opacity-75  bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-lightBlue-400 focus:border-lightBlue-400 sm:text-sm"
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
                            disabled={props.editMode && blockID === 'empty'}
                            defaultValue={props.editMode && selectedBlock !== null ? selectedBlock.size : ''}
                            type="number"
                            placeholder="1024"
                            className="appearance-none block w-full px-3 py-2 border disabled:opacity-75  bg-blueGray-600 border-blueGray-600 text-white rounded-lg placeholder-blueGray-400 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 focus:outline-none focus:ring-lightBlue-400 focus:border-lightBlue-400 sm:text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="dataWidth" className="block text-sm font-medium text-white">
                          DataWidth{' '}
                          <span className="text-indigo-300">
                            {errors.dataWidth && ' • ' + errors.dataWidth.message}
                          </span>
                        </label>

                        <div className="mt-1">
                          <input
                            {...register('dataWidth', { required: true })}
                            disabled={props.editMode && blockID === 'empty'}
                            type="number"
                            defaultValue={props.editMode && selectedBlock !== null ? selectedBlock.width : ''}
                            placeholder="32"
                            className="appearance-none block w-full px-3 py-2 border disabled:opacity-75  bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-lightBlue-400 focus:border-lightBlue-400 sm:text-sm"
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
                              value: props.editMode && selectedBlock !== null ? selectedBlock.description : '',
                            })}
                            disabled={props.editMode && blockID === 'empty'}
                            placeholder="Description"
                            className="appearance-none block w-full px-3 py-2 max-h-28 disabled:opacity-75 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div className="mt-2 pt-3 flex flex-row-reverse">
                        <button
                          type="submit"
                          disabled={props.editMode && blockID === 'empty'}
                          className={`w-full inline-flex justify-center rounded-lg shadow-md px-4 py-2 disabled:transform-none disabled:opacity-50 disabled:bg-yellow-500  bg-${
                            props.editMode ? 'yellow' : 'emerald'
                          }-400 text-base font-medium text-white hover:bg-${
                            props.editMode ? 'yellow' : 'emerald'
                          }-500 duration-300 transform-gpu hover:scale-95 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm`}
                        >
                          {props.editMode ? 'Edit' : 'Add'} Block
                        </button>
                        <button
                          type="button"
                          className="mt-3 w-full inline-flex justify-center rounded-lg active:scale-95 transform-gpu shadow-lg hover:shadow-lg duration-300 px-4 py-2 bg-blueGray-600 dark:bg-gray-700 text-base text-gray-300 font-medium sm:mt-0 sm:w-auto sm:text-sm focus:outline-none"
                          onClick={handleCancel}
                          ref={cancelButtonRef}
                        >
                          Cancel
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

export default BlockModal;
