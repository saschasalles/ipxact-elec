import React, { useEffect, useState } from 'react';
import { Button } from './button';
import { PlusCircleIcon } from '@heroicons/react/solid';
import { PencilIcon } from '@heroicons/react/solid';
import { TrashIcon } from '@heroicons/react/outline';
import { CalculatorIcon } from '@heroicons/react/solid';
import { ButtonMode } from '../models/button-mode';
import { useAppSelector } from '../hooks';
import { Field } from "../models/field";
import { EnumeratedValue } from "../models/enumerated-value";
import { Register } from "../models/register"

type ToolBarRegisterProps = {
  onButtonClick: (mode: ButtonMode) => void;
  register?: string
};

export const ToolbarRegisterSection = (props: ToolBarRegisterProps) => {
  const storeRegs: readonly Register[] = useAppSelector((state) => state.registerReducer.registers);
  const storeFields: readonly Field[] = useAppSelector((state) => state.fieldReducer.fields);
  const storeEVS: readonly EnumeratedValue[] = useAppSelector((state) => state.enumeratedValueReducer.enumeratedValues);
  const [currentReg, setCurrentRegister] = useState<Register>(storeRegs.find(r => r.id === props.register))
  const [disableEV, setDisableEV] = useState(true)

  useEffect(() => {
    if (props.register != null) {
      let reg = storeRegs.find(r => r.id === props.register)
      if (reg != null && reg.fields != null) {
        setCurrentRegister(reg)
      
        reg.fields.forEach(f => {
          let fetchedFields = storeFields.find(fi => fi.id === f)
          fetchedFields.enumeratedValues.length > 0 ? setDisableEV(false) : setDisableEV(true)
      })
      } 
      
    }
  }, [props.register, storeEVS])

  return (
    <>
      <section className="text-center">
        <p className="text-md font-semibold text-blueGray-200 select-none">Register</p>
        <div className="space-x-2 space-y-1 py-2">
          <Button
            onButtonClick={props.onButtonClick}
            mode={ButtonMode.EditRegister}
            color="blueGray-600 dark:bg-gray-800"
            colorHover="blueGray-500 dark:hover:bg-gray-700"
            text="Edit"
            textColor="amber-400"
            icon={PencilIcon}
          />
          <Button
            onButtonClick={props.onButtonClick}
            mode={ButtonMode.EditBits}
            color="blueGray-600 dark:bg-gray-800"
            colorHover="blueGray-500 dark:hover:bg-gray-700"
            text="Bits"
            textColor="indigo-400"
            icon={CalculatorIcon}
          />
          <Button
            onButtonClick={props.onButtonClick}
            mode={ButtonMode.DeleteOpenedRegister}
            color="blueGray-600 dark:bg-gray-800"
            colorHover="blueGray-500 dark:hover:bg-gray-700"
            text="Delete"
            textColor="red-400"
            icon={TrashIcon}
          />
        </div>
      </section>

      <section className="text-center">
        <p className="text-md font-semibold text-blueGray-200 select-none">Field</p>
        <div className="space-x-2 space-y-1 py-2">
          <Button
            onButtonClick={props.onButtonClick}
            mode={ButtonMode.AddField}
            color="blueGray-600 dark:bg-gray-800"
            colorHover="blueGray-500 dark:hover:bg-gray-700"
            text="Add"
            textColor="emerald-400"
            icon={PlusCircleIcon}
          />
          <Button
            onButtonClick={props.onButtonClick}
            mode={ButtonMode.EditField}
            color="blueGray-600 dark:bg-gray-800"
            colorHover="blueGray-500 dark:hover:bg-gray-700"
            text="Edit"
            textColor="amber-400"
            icon={PencilIcon}
            disabled={currentReg != null && currentReg.fields == null || currentReg.fields.length === 0}
          />
          <Button
            onButtonClick={props.onButtonClick}
            mode={ButtonMode.DeleteField}
            confirmable={true}
            color="blueGray-600 dark:bg-gray-800"
            colorHover="blueGray-500 dark:hover:bg-gray-700"
            text="Delete"
            textColor="red-400"
            icon={TrashIcon}
            disabled={currentReg != null && currentReg.fields == null || currentReg.fields.length === 0}
          />
        </div>
      </section>

      <section className="text-center">
        <p className="text-md font-semibold text-blueGray-200 select-none">Enumerated Values</p>
        <div className="space-x-2 space-y-1 py-2">
          <Button
            onButtonClick={props.onButtonClick}
            mode={ButtonMode.AddEnumeratedValue}
            color="blueGray-600 dark:bg-gray-800"
            colorHover="blueGray-500 dark:hover:bg-gray-700"
            text="Add"
            textColor="emerald-400"
            icon={PlusCircleIcon}
            disabled={currentReg != null && currentReg.fields == null || currentReg.fields.length === 0}
          />
          <Button
            onButtonClick={props.onButtonClick}
            mode={ButtonMode.EditEnumeratedValue}
            color="blueGray-600 dark:bg-gray-800"
            colorHover="blueGray-500 dark:hover:bg-gray-700"
            text="Edit"
            textColor="amber-400"
            icon={PencilIcon}
            disabled={disableEV}
          />
          <Button
            onButtonClick={props.onButtonClick}
            mode={ButtonMode.DeleteEnumeratedValue}
            color="blueGray-600 dark:bg-gray-800"
            colorHover="blueGray-500 dark:hover:bg-gray-700"
            text="Delete"
            textColor="red-400"
            icon={TrashIcon}
            disabled={disableEV}
          />
        </div>
      </section>

      <section className="text-center">
        <p className="text-md font-semibold text-blueGray-200 select-none">Search</p>
        <div className="px-2 space-y-1 py-2">
          <label htmlFor="email" className="sr-only select-none">
            Search
          </label>
          <input
            type="search"
            name="search"
            id="search"
            className="h-9 px-2 bg-blueGray-600 dark:bg-gray-800 border-none placeholder-gray-400 text-white focus:outline-none focus:ring-0 block w-full sm:text-sm rounded-lg"
            placeholder="Search anything ..."
          />
        </div>
      </section>
    </>
  );
};
