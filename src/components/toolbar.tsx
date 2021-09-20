import React from 'react';
import { Transition } from '@headlessui/react';
import { ToolbarMappingSection } from '../components/toolbar-mapping-section';
import { ToolbarRegisterSection } from '../components/toolbar-register-section';
import { ButtonMode } from '../models/button-mode';

type ToolBarProps = {
  isMapping: boolean;
  onButtonClick: (mode: ButtonMode) => void;
  register: string;
};

export const ToolBar = (props: ToolBarProps) => {
  return (
    <>
      {props.isMapping ? (
        <Transition
          appear={true}
          show={props.isMapping}
          enter="transition-opacity duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={`grid ${
              props.isMapping ? 'grid-cols-4 px-3' : 'grid-cols-4 px-5'
            } py-2 
            bg-blueGray-800 
            dark:bg-black 
            divide-x divide-blueGray-600 dark:divide-gray-800
            w-screen 
            border-b dark:border-gray-800 border-transparent`}
          >
            <ToolbarMappingSection onButtonClick={props.onButtonClick} />
          </div>
        </Transition>
      ) : (
        <Transition
          appear={true}
          show={!props.isMapping}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={`grid ${
              props.isMapping ? 'grid-cols-4 px-3' : 'grid-cols-4 px-5'
            } py-2 
            bg-blueGray-800 dark:bg-black 
            divide-x divide-blueGray-600 
            dark:divide-gray-800 w-screen
            border-b dark:border-gray-800 border-transparent
            `}
          >
            <ToolbarRegisterSection onButtonClick={props.onButtonClick} register={props.register} />
          </div>
        </Transition>
      )}
    </>
  );
};
