import React, { FunctionComponent, useState } from 'react';
import { ButtonMode } from '../models/button-mode';

type ButtonProps = {
  text: string;
  icon?: Function;
  color: string;
  colorHover: string;
  textColor?: string;
  disabled?: boolean;
  mode?: ButtonMode;
  confirmable?: boolean;
  onButtonClick: (mode?: ButtonMode) => void;
  autoSize?: boolean;
};

export const Button: FunctionComponent<ButtonProps> = (props: ButtonProps) => {
  const { confirmable = false } = props;
  const { mode = ButtonMode.Any } = props;
  const { autoSize = true } = props;
  const [confirmMode, setConfirmMode] = useState(false);
  const { disabled = false } = props;

  const onButtonClick: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    confirmable && setConfirmMode(!confirmMode);
    props.mode ? props.onButtonClick(mode) : props.onButtonClick();
  };

  return (
    <button
      disabled={disabled}
      onClick={onButtonClick}
      type="button"
      className={`
        ${props.textColor ? `text-${confirmMode ? 'white' : props.textColor}` : 'text-white'} 
        inline-flex items-center xl:px-4 px-2 ${autoSize && ''} py-2
        text-sm font-medium rounded-lg 
        select-none
        focus:outline-none 
        hover:outline-none
        disabled:transform-none
        disabled:opacity-50
        disabled:pointer-events-none
        bg-${confirmMode ? props.textColor : props.color} 
        hover:bg-${confirmMode ? props.textColor : props.colorHover} 
        active:scale-90
        ${confirmMode && 'scale-100'}
        transform-gpu
        duration-75`}
    >
      <span className={`${autoSize && 'lg:visible lg:block invisible hidden focus:outline-none hover:outline-none'}`}>
        {confirmMode ? 'Confirm' : props.text}{' '}
      </span>
      {props.icon && (
        <props.icon className={`lg:ml-2 h-5 w-5 focus:outline-none hover:outline-none`} aria-hidden="true" />
      )}
    </button>
  );
};
