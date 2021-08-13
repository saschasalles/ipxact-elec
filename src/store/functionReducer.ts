import * as actionTypes from './actionTypes';
import { AddressSpaceAction, MultiAddressSpacesAction, AddressSpaceState } from '../models/state';
import { v4 as uuidv4 } from 'uuid';
import { AddressSpace } from '../models/address-space';

const initialAddressSpaceState: AddressSpaceState = {
  addressSpaces: [
  //   new AddressSpace(
  //     "1",
  //     'function_1',
  //     parseInt('0x0', 16),
  //     8,
  //     32,
  //     'short description',
  //     null,
  //     null,
  //     ["1", "2"],
  //     Array<string>(),
  //   ),
  //   new AddressSpace(
  //     "2",
  //     'function_2',
  //     parseInt('0x0', 16),
  //     8,
  //     32,
  //     'short description',
  //     null,
  //     null,
  //     ["3", "4"],
  //     Array<string>(),
  //   ),
  //   new AddressSpace(
  //     "3",
  //     'function_3',
  //     parseInt('0x0', 16),
  //     8,
  //     32,
  //     'short description',
  //     null,
  //     null,
  //     Array<string>(),
  //     Array<string>(),
  //   ),
  //   new AddressSpace(
  //     "4",
  //     'function_4',
  //     parseInt('0x0', 16),
  //     8,
  //     32,
  //     'short description',
  //     null,
  //     null,
  //     Array<string>(),
  //     Array<string>(),
  //   ),
  //   new AddressSpace(
  //     "5",
  //     'function_5',
  //     parseInt('0x0', 16),
  //     8,
  //     32,
  //     'short description',
  //     null,
  //     null,
  //     Array<string>(),
  //     Array<string>(),
  //   ),
  //   new AddressSpace(
  //     "6",
  //     'function_6',
  //     parseInt('0x0', 16),
  //     8,
  //     32,
  //     'short description',
  //     null,
  //     null,
  //     Array<string>(),
  //     Array<string>(),
  //   ),
  //   new AddressSpace(
  //     "7",
  //     'function_7',
  //     parseInt('0x0', 16),
  //     8,
  //     32,
  //     'short description',
  //     null,
  //     null,
  //     Array<string>(),
  //     Array<string>(),
  //   ),
  //   new AddressSpace(
  //     "8",
  //     'function_8',
  //     parseInt('0x0', 16),
  //     8,
  //     32,
  //     'short description',
  //     null,
  //     null,
  //     Array<string>(),
  //     Array<string>(),
  //   ),
  //   new AddressSpace(
  //     "9",
  //     'function_9',
  //     parseInt('0x0', 16),
  //     8,
  //     32,
  //     'short description',
  //     null,
  //     null,
  //     Array<string>(),
  //     Array<string>(),
  //   ),
  //   new AddressSpace(
  //     "10",
  //     'function_10',
  //     parseInt('0x0', 16),
  //     8,
  //     32,
  //     'short description',
  //     null,
  //     null,
  //     Array<string>(),
  //     Array<string>(),
  //   ),
 ],
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
        console.log('ADDRESS ACTION', updatedAddressSpace);
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
