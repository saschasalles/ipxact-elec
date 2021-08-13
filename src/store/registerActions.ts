import * as actionTypes from './actionTypes';
import { Register } from '../models/register';
import { RegisterAction, MultiRegistersAction } from '../models/state';

export const addRegister = (register: Register) => {
  const action: RegisterAction = {
    type: actionTypes.ADD_REGISTER,
    register,
  };
  return action
};

export const updateRegister = (register: Register) => {
  const action: RegisterAction = {
    type: actionTypes.UPDATE_REGISTER,
    register,
  };
  return action;
};


export const removeRegisters = (registers: Register[]) => {
  const action: MultiRegistersAction = {
    type: actionTypes.REMOVE_REGISTERS,
    registers,
  };
  return action
};
