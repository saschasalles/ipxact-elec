import * as actionTypes from './actionTypes';
import { AddressSpace } from '../models/address-space';
import { AddressSpaceAction, MultiAddressSpacesAction } from '../models/state';

export const addFunction = (addressSpace: AddressSpace) => {
  const action: AddressSpaceAction = {
    type: actionTypes.ADD_FUNCTION,
    addressSpace,
  };
  return action;
};

export const updateFunction = (addressSpace: AddressSpace) => {
  const action: AddressSpaceAction = {
    type: actionTypes.UPDATE_FUNCTION,
    addressSpace,
  };
  return action;
};

export const updateRegisterInFunction = (addressSpace: AddressSpace) => {
  const action: AddressSpaceAction = {
    type: actionTypes.REMOVE_FUNCTIONS,
    addressSpace,
  };
  return action;
};


export const removeFunctions = (addressSpaces: AddressSpace[]) => {
  const action: MultiAddressSpacesAction = {
    type: actionTypes.REMOVE_FUNCTIONS,
    addressSpaces,
  };
  return action;
};

