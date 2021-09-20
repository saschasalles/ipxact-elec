import * as actionTypes from './actionTypes';
import { AddressSpaceAction, MultiAddressSpacesAction, AddressSpaceState } from '../models/state';
import { v4 as uuidv4 } from 'uuid';
import { AddressSpace } from '../models/address-space';

const initialAddressSpaceState: AddressSpaceState = {
  addressSpaces: [],
};

type FuncAction = AddressSpaceAction | MultiAddressSpacesAction;

const functionReducer = (
  state: AddressSpaceState = initialAddressSpaceState,
  action: FuncAction,
): AddressSpaceState => {
  switch (action.type) {
    case actionTypes.ADD_FUNCTION:
      if ('addressSpace' in action) {
        const newAddressSpace: AddressSpace = action.addressSpace;
        return { ...state, addressSpaces: state.addressSpaces.concat(newAddressSpace) };
      }

    case actionTypes.UPDATE_FUNCTION:
      if ('addressSpace' in action) {
        const updatedAddressSpace: AddressSpace = action.addressSpace;
        const newState = state.addressSpaces.map((func) => {
          if (func.id === updatedAddressSpace.id) {
            (func.name = updatedAddressSpace.name),
              (func.baseAddress = updatedAddressSpace.baseAddress),
              (func.size = updatedAddressSpace.size),
              (func.width = updatedAddressSpace.width);
              (func.registers = updatedAddressSpace.registers)
          }
          return func;
        });
        return { ...state, addressSpaces: newState };
      }
    


    case actionTypes.REMOVE_FUNCTIONS:
      if ('addressSpaces' in action) {
        const updatedAddressSpaces: AddressSpace[] = state.addressSpaces.filter(
          (func) => !action.addressSpaces.includes(func),
        );
        return { ...state, addressSpaces: updatedAddressSpaces };
      }
  }
  return state;
};

export default functionReducer;
