import React from 'react';
import { Button } from './button';
import { PlusCircleIcon } from '@heroicons/react/solid';
import { PencilIcon } from '@heroicons/react/solid';
import { TrashIcon } from '@heroicons/react/outline';
import { ButtonMode } from '../models/button-mode';
import { AddressSpace } from '../models/address-space';
import { Register } from "../models/register";
import { Block } from "../models/block";
import { useAppSelector } from '../hooks';


type ToolBarMappingProps = {
  onButtonClick: (mode: ButtonMode) => void;
};

export const ToolbarMappingSection = (props: ToolBarMappingProps) => {
  const funcs: readonly AddressSpace[] = useAppSelector((state) => state.functionReducer.addressSpaces);
  const regs: readonly Register[] = useAppSelector((state) => state.registerReducer.registers);
  const blocks: readonly Block[] = useAppSelector((state) => state.blockReducer.blocks);
  return (
    <>
      <section className="text-center ">
        <p className="text-md font-semibold text-blueGray-200 select-none">Function</p>
        <div className="space-x-2 space-y-1 py-2">
          <Button
            onButtonClick={props.onButtonClick}
            mode={ButtonMode.AddFunction}
            color="blueGray-600 dark:bg-gray-800" 
            colorHover="blueGray-500 dark:hover:bg-gray-700"
            text="Add"
            textColor="emerald-400"
            icon={PlusCircleIcon}
          />
          <Button
            onButtonClick={props.onButtonClick}
            mode={ButtonMode.EditFunction}
            color="blueGray-600 dark:bg-gray-800"
            colorHover="blueGray-500 dark:hover:bg-gray-700"
            text="Edit"
            textColor="amber-400"
            icon={PencilIcon}
            disabled={funcs.length === 0}
          />
          <Button
            confirmable={true}
            onButtonClick={props.onButtonClick}
            mode={ButtonMode.DeleteFunction}
            color="blueGray-600 dark:bg-gray-800"
            colorHover="blueGray-500 dark:hover:bg-gray-700"
            text="Delete"
            textColor="red-400"
            icon={TrashIcon}
            disabled={funcs.length === 0}
          />
        </div>
      </section>

      <section className="text-center">
        <p className="text-md font-semibold text-blueGray-200 select-none">Register</p>
        <div className="space-x-2 space-y-1 py-2">
          <Button
            onButtonClick={props.onButtonClick}
            mode={ButtonMode.AddRegister}
            color="blueGray-600 dark:bg-gray-800"
            colorHover="blueGray-500 dark:hover:bg-gray-700"
            text="Add"
            textColor="emerald-400"
            icon={PlusCircleIcon}
            disabled={funcs.length === 0}
          />
          <Button
            onButtonClick={props.onButtonClick}
            mode={ButtonMode.EditRegister}
            color="blueGray-600 dark:bg-gray-800"
            colorHover="blueGray-500 dark:hover:bg-gray-700"
            text="Edit"
            textColor="amber-400"
            icon={PencilIcon}
            disabled={funcs.length === 0 || funcs.length > 0 && regs.length === 0}
          />
          <Button
            confirmable={true}
            onButtonClick={props.onButtonClick}
            mode={ButtonMode.DeleteRegister}
            color="blueGray-600 dark:bg-gray-800"
            colorHover="blueGray-500 dark:hover:bg-gray-700"
            text="Delete"
            textColor="red-400"
            icon={TrashIcon}
            disabled={funcs.length === 0 || funcs.length > 0 && regs.length === 0}
          />
        </div>
      </section>

      <section className="text-center">
        <p className="text-md font-semibold text-blueGray-200 select-none">Block</p>
        <div className="space-x-2 space-y-1 py-2">
          <Button
            onButtonClick={props.onButtonClick}
            mode={ButtonMode.AddBlock}
            color="blueGray-600 dark:bg-gray-800"
            colorHover="blueGray-500 dark:hover:bg-gray-700"
            text="Add"
            textColor="emerald-400"
            icon={PlusCircleIcon}
            disabled={funcs.length === 0}
          />
          <Button
            onButtonClick={props.onButtonClick}
            mode={ButtonMode.EditBlock}
            color="blueGray-600 dark:bg-gray-800"
            colorHover="blueGray-500 dark:hover:bg-gray-700"
            text="Edit"
            textColor="amber-400"
            icon={PencilIcon}
            disabled={funcs.length === 0 || funcs.length > 0 && blocks.length === 0}
          />
          <Button
            confirmable={true}
            onButtonClick={props.onButtonClick}
            mode={ButtonMode.DeleteBlock}
            color="blueGray-600 dark:bg-gray-800"
            colorHover="blueGray-500 dark:hover:bg-gray-700"
            text="Delete"
            textColor="red-400"
            icon={TrashIcon}
            disabled={funcs.length === 0 || funcs.length > 0 && blocks.length === 0}
          />
        </div>
      </section>

      <section className="text-center">
        <p className="text-md font-semibold text-blueGray-200 select-none">Search</p>
        <div className="px-2 space-y-1 py-2 select-none">
          <label htmlFor="email" className="sr-only select-none">
            Search
          </label>
          <input
            type="search"
            name="search"
            id="search"
            className="select-none h-9 px-2 bg-blueGray-600 dark:bg-gray-800 border-none active:outline-none placeholder-gray-400 text-white focus:outline-none focus:ring-0 block w-full sm:text-sm rounded-lg"
            placeholder="Search anything ..."
          />
        </div>
      </section>
    </>
  );
};
