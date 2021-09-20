import * as actionTypes from './actionTypes';
import { EnumeratedValue } from '../models/enumerated-value';
import { EnumeratedValueAction, MultiEnumeratedValuesAction } from '../models/state';

export const addEV = (ev: EnumeratedValue) => {
  const action: EnumeratedValueAction = {
    type: actionTypes.ADD_EV,
    ev,
  };
  return action
};

export const updateEV = (ev: EnumeratedValue) => {
  const action: EnumeratedValueAction = {
    type: actionTypes.UPDATE_EV,
    ev,
  };
  return action;
};


export const removeEVS = (evs: EnumeratedValue[]) => {
  const action: MultiEnumeratedValuesAction = {
    type: actionTypes.REMOVE_EVS,
    evs,
  };
  return action
};
