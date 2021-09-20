import React, { Fragment, useRef, useState, useCallback, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { updateRegister } from '../../store/registerActions';
import { addField, updateField } from '../../store/fieldActions';
import { Dispatch } from 'redux';
import { useForm } from 'react-hook-form';
import { Field } from '../../models/field';
import { Register } from '../../models/register';
import { AddressSpace } from '../../models/address-space';
import { v4 as uuidv4 } from 'uuid';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAppSelector, useAppDispatch } from '../../hooks';
import * as yup from 'yup';
import { Access } from '../../models/access';
import { IFieldFormInputs } from '../../models/field-form-inputs';
import { between, rangeIn } from '../../helpers/validation-funcs';

type FieldModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  editMode: boolean;
  register: string;
  maxRange: number;
};

const FieldModal = (props: FieldModalProps) => {
  const cancelButtonRef = useRef(null);

  const dispatch: Dispatch<any> = useAppDispatch();

  const addFieldAction = useCallback((field: Field) => dispatch(addField(field)), [dispatch, addField]);

  const updateFieldAction = useCallback((field: Field) => dispatch(updateField(field)), [dispatch, updateField]);
  const updateRegAction = useCallback(
    (register: Register) => dispatch(updateRegister(register)),
    [dispatch, updateRegister],
  );

  const regs: readonly Register[] = useAppSelector((state) => state.registerReducer.registers);
  const storeFields: readonly Field[] = useAppSelector((state) => state.fieldReducer.fields);

  const [selectedField, setSelectedField] = useState<Field>(null);
  const [fieldID, setFieldID] = useState('empty');

  useEffect(() => {
    const regToUpdate: Register = regs.find((r) => r.id === props.register);
    let value: number = 0;
    let mask: number = 0;

    if (regToUpdate != null && regToUpdate.fields != null && regToUpdate.fields.length > 0) {
      regToUpdate.fields.forEach((field) => {
        let fetchedField = storeFields.find((f) => f.id === field);
        if (fetchedField != null) {
          value += fetchedField.defaultValue * Math.pow(2, fetchedField.posl);
          console.log('Value', value);
          regToUpdate.defaultValue += value;
          fetchedField.access === Access.Write &&
            (mask += Math.pow(2, fetchedField.posh + 1) - Math.pow(2, fetchedField.posl));
          regToUpdate.mask = mask;
        }
      });
      updateRegAction(regToUpdate);
    }
  }, [storeFields]);

  useEffect(() => {
    if (props.editMode) {
      if (fieldID !== 'empty') {
        const selected = storeFields.find((f) => f.parentRegID === props.register);
        setValue('name', selected.name);
        setValue('defaultValue', '0x' + selected.defaultValue.toString(16));
        setValue('posh', selected.posh);
        setValue('posl', selected.posl);
        setValue('access', Access[selected.access as number]);
        setValue('description', selected.description);
        setSelectedField(selected);
      } else {
        resetInitialValues();
      }
    }
  }, [fieldID]);

  const schema = yup.object().shape({
    name: yup
      .string()
      .typeError('Field name is required')
      .matches(RegExp('^[a-zA-Z0-9_]*$'), 'Use only alphanumeric characters and the underscore')
      .required('Field name is required')
      .test('Field name already exist', 'Field name already exist', (value) => fieldChecker(value, fieldID, 'NAME')),

    access: yup.string().typeError('Access is required').required('Access is required'),
    posh: yup
      .number()
      .typeError('Msb is required')
      .integer('Msb must be an integer')
      .positive('Msb must be positive')
      .max(props.maxRange, `Msb must be smaller than your function DataWidth (${props.maxRange})`)
      .test('Msb should be > Lsb', 'Msb should be > Lsb', (value, ctx) => {
        return value >= ctx.parent.posl;
      })
      .test('Msb encroaches on another field', 'Msb encroaches on another field', (value) => {
        return !encroaches(value);
      }),
    posl: yup
      .number()
      .typeError('Lsb is required')
      .integer('Lsb must be an integer')
      .positive('Lsb must be positive')
      .max(props.maxRange, `Lsb must be smaller than your function DataWidth (${props.maxRange})`)
      .test('Lsb should be < Msb', 'Lsb should be < Msb', (value, ctx) => {
        return value <= ctx.parent.posh;
      })
      .test('Lsb encroaches on another field', 'Lsb encroaches on another field', (value) => {
        return !encroaches(value);
      })
      .test('Msb & Lsb are contained in another range', 'Msb & Lsb are contained in another range', (value, ctx) => {
        clearErrors('posh');
        clearErrors('posl');
        const reg = regs.find((r) => r.id === props.register);
        let res: boolean;
        reg.fields != null &&
          reg.fields.forEach((f) => {
            if (f !== fieldID) {
              const currentField = storeFields.find((field) => field.id === f);
              res = rangeIn(value, ctx.parent.posh, currentField.posl, currentField.posh);
            }
          });
        return !res;
      }),
    defaultValue: yup
      .string()
      .typeError('Default value is required')
      .matches(RegExp('0[xX][0-9a-fA-F]+'), 'Default value must be an hexadecimal value')
      .required('Default value is required')
      .test({
        name: 'Max Default Value',
        test: function (value, ctx) {
          let max = Math.pow(2, ctx.parent.posh - ctx.parent.posl + 1) - 1;
          return parseInt(value, 16) > max
            ? this.createError({
                message: `Default value must be lower or equal than 0x${max.toString(16)}`,
                path: 'defaultValue',
              })
            : true;
        },
      }),
  });

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm<IFieldFormInputs>({
    resolver: yupResolver(schema),
  });

  const fieldChecker = (value: string, fieldID: string, type: string): boolean => {
    const fieldRegs = regs.find((r) => r.id === props.register);
    if (fieldRegs.fields !== null) {
      let filtered = Array<Field>();
      const fetchedFields = storeFields.filter((f) => fieldRegs.fields.some((fieldID) => f.id === fieldID));
      if (type === 'NAME') {
        filtered = fetchedFields.filter((f) => f.name === value && f.id !== fieldID);
      } else {
        return true;
      }
      return filtered.length > 0 ? false : true;
    }
    return true;
  };

  const encroaches = (value: number): boolean => {
    const reg = regs.find((r) => r.id === props.register);
    let res: boolean;
    reg.fields != null &&
      reg.fields.forEach((f) => {
        if (f !== fieldID) {
          const currentField = storeFields.find((field) => field.id === f);
          res = between(value, currentField.posl, currentField.posh);
        }
      });
    return res;
  };

  const onSubmit = (data: IFieldFormInputs) => {
    props.editMode ? editField(data) : createField(data);
    props.setOpen(false);
    resetInitialValues();
    reset();
  };

  const createField = (data: IFieldFormInputs) => {
    let fAccess: keyof typeof Access = data.access as keyof typeof Access;
    let field: Field = new Field(
      uuidv4(),
      props.register,
      data.name,
      parseInt(data.defaultValue, 16),
      data.description,
      Access[fAccess],
      data.posh,
      data.posl,
      [],
    );

    addFieldAction(field);
    const regToUpdate: Register = regs.find((r) => r.id === props.register);
    console.log('reg -> ', regToUpdate);
    let currentFields = regToUpdate.fields;
    currentFields.push(field.id);
    regToUpdate.fields = currentFields;
    updateRegAction(regToUpdate);
    clearErrors();
  };

  const editField = (data: IFieldFormInputs) => {
    let fAccess: keyof typeof Access = data.access as keyof typeof Access;
    selectedField.defaultValue = parseInt(data.defaultValue, 16);
    selectedField.name = data.name;
    selectedField.posh = data.posh;
    selectedField.posl = data.posl;
    selectedField.access = Access[fAccess];
    selectedField.description = data.description;
    updateFieldAction(selectedField);
    clearErrors();
  };

  const resetInitialValues = () => {
    setValue('name', '');
    setValue('posh', null);
    setValue('posl', null);
    setValue('access', Access[Access.Read]);
    setValue('defaultValue', '');
    setValue('description', '');

    if (regs.length > 0) {
      setSelectedField(null);
      setFieldID('empty');
    }
    clearErrors();
  };

  const handleChange = (e: React.FormEvent) => {
    const target = e.target as HTMLSelectElement;
    setFieldID(target.value);
  };

  const handleCancel: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    props.setOpen(false);
    resetInitialValues();
    reset();
  };

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
            <Dialog.Overlay className="fixed inset-0 bg-blueGray-800 bg-transparent bg-opacity-75 transition-opacity" />
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
                  {props.editMode ? 'Edit a field' : 'Create a new field'}
                </Dialog.Title>

                <div className="mt-1">
                  {props.editMode && (
                    <div className="mt-4">
                      <label htmlFor="register" className="block text-sm font-medium text-white">
                        Field to edit
                      </label>
                      <div className="mt-1">
                        <select
                          id="registers"
                          name="registers"
                          className="mt-1 py-2 block w-full pl-3 pr-6 font-semibold bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white border rounded-lg focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                          value={fieldID}
                          onChange={handleChange}
                        >
                          <option value="empty">Choose a field</option>
                          {storeFields
                            .filter((fi) => fi.parentRegID === props.register)
                            .map((f, idx) => (
                              <option key={idx} value={f.id}>
                                {f.name}
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
                          disabled={props.editMode && fieldID === 'empty'}
                          defaultValue={props.editMode && selectedField !== null ? selectedField.name : ''}
                          placeholder="field_name"
                          className="appearance-none block w-full px-3 py-2 disabled:opacity-75 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="msb" className="block text-sm font-medium text-white">
                        Msb <span className="text-indigo-300">{errors.posh && ' • ' + errors.posh.message}</span>
                      </label>
                      <div className="mt-1">
                        <input
                          {...register('posh', { required: true })}
                          disabled={props.editMode && fieldID === 'empty'}
                          defaultValue={props.editMode && selectedField !== null ? selectedField.posh : ''}
                          type="number"
                          placeholder="8"
                          min="0"
                          className="appearance-none block w-full px-3 py-2 disabled:opacity-75 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="lsb" className="block text-sm font-medium text-white">
                        Lsb <span className="text-indigo-300">{errors.posl && ' • ' + errors.posl.message}</span>
                      </label>
                      <div className="mt-1">
                        <input
                          {...register('posl', { required: true })}
                          disabled={props.editMode && fieldID === 'empty'}
                          defaultValue={props.editMode && selectedField !== null ? selectedField.posl : ''}
                          type="number"
                          placeholder="4"
                          min="0"
                          className="appearance-none block w-full px-3 py-2 disabled:opacity-75 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="access" className="block text-sm font-medium text-white">
                        Access <span className="text-indigo-300">{errors.access && ' • ' + errors.access.message}</span>
                      </label>
                      <div className="mt-1">
                        <select
                          {...register('access', {
                            value:
                              props.editMode && selectedField !== null
                                ? Access[selectedField.access as number]
                                : Access[Access.Read],
                          })}
                          disabled={props.editMode && fieldID === 'empty'}
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
                      <label htmlFor="defaultValue" className="block text-sm font-medium text-white">
                        Default Value{' '}
                        <span className="text-indigo-300">
                          {errors.defaultValue && ' • ' + errors.defaultValue.message}
                        </span>
                      </label>
                      <div className="mt-1">
                        <input
                          {...register('defaultValue', { required: true })}
                          type="text"
                          disabled={props.editMode && fieldID === 'empty'}
                          defaultValue={
                            props.editMode && selectedField !== null
                              ? '0x' + selectedField.defaultValue.toString(16)
                              : ''
                          }
                          placeholder="0x0"
                          className="appearance-none block w-full px-3 py-2 disabled:opacity-75 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-blueGray-400 focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
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
                            value: props.editMode && selectedField !== null ? selectedField.description : '',
                          })}
                          disabled={props.editMode && fieldID === 'empty'}
                          placeholder="Description"
                          className="appearance-none block w-full px-3 py-2 max-h-28 disabled:opacity-75 border bg-blueGray-600 border-blueGray-600 dark:bg-gray-700 dark:border-transparent dark:placeholder-gray-300 text-white rounded-lg placeholder-blueGray-400 focus:outline-none focus:ring-sky-400 focus:border-sky-400 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-2 pt-3 flex flex-row-reverse">
                      <button
                        type="submit"
                        disabled={props.editMode && fieldID === 'empty'}
                        className={`w-full inline-flex justify-center rounded-lg shadow-lg px-4 py-2 disabled:transform-none disabled:opacity-50 disabled:bg-yellow-500  bg-${
                          props.editMode ? 'yellow' : 'emerald'
                        }-400 text-base font-medium text-white hover:bg-${
                          props.editMode ? 'yellow' : 'emerald'
                        }-500 duration-300 transform hover:scale-95 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm`}
                      >
                        {props.editMode ? 'Edit' : 'Add'} Field
                      </button>
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-lg active:scale-95 transform shadow-lg hover:shadow-lg duration-300 px-4 py-2 bg-blueGray-600 dark:bg-gray-700 text-base text-gray-300 font-medium sm:mt-0 sm:w-auto sm:text-sm focus:outline-none"
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

export default FieldModal;
