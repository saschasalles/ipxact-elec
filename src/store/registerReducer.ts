import * as actionTypes from './actionTypes';
import { RegisterAction, MultiRegistersAction, RegisterState } from '../models/state';
import { v4 as uuidv4 } from 'uuid';
import { Register } from '../models/register';
import { Access } from '../models/access';

const initialRegisterState: RegisterState = {
  registers: [

  ],
};

type RegAction = RegisterAction | MultiRegistersAction;

const registerReducer = (state: RegisterState = initialRegisterState, action: RegAction): RegisterState => {
  switch (action.type) {
    case actionTypes.ADD_REGISTER:
      if ('register' in action) {
        const newRegister: Register = action.register;
        return {
          ...state,
          registers: state.registers.concat(newRegister),
        };
      }
    case actionTypes.REMOVE_REGISTERS:
      if ('registers' in action) {
        const updatedRegisters: Register[] = state.registers.filter((reg) => !action.registers.includes(reg));
        return { ...state, registers: updatedRegisters };
      }

    case actionTypes.UPDATE_REGISTER:
      if ('register' in action) {
        const updatedRegister: Register = action.register;
        const newState = state.registers.map((reg) => {
          if (reg.id === updatedRegister.id) {
            (reg.name = updatedRegister.name),
              (reg.address = updatedRegister.address),
              (reg.dim = updatedRegister.dim),
              (reg.dimOffset = updatedRegister.dimOffset),
              (reg.parentFunctionId = updatedRegister.parentFunctionId),
              (reg.description = updatedRegister.description),
              (reg.mask = updatedRegister.mask),
              (reg.isHidden = updatedRegister.isHidden),
              (reg.defaultValue = updatedRegister.defaultValue),
              (reg.access = updatedRegister.access);
          }
          return reg;
        });
        return { ...state, registers: newState };
      }
  }
  return state;
};

export default registerReducer;
