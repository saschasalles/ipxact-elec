import * as actionTypes from './actionTypes';
import { Field } from '../models/field';
import { FieldAction, MultiFieldsAction } from '../models/state';

export const addField = (field: Field) => {
  const action: FieldAction = {
    type: actionTypes.ADD_FIELD,
    field,
  };
  return action
};

export const updateField = (field: Field) => {
  const action: FieldAction = {
    type: actionTypes.UPDATE_FIELD,
    field,
  };
  return action;
};


export const removeFields = (fields: Field[]) => {
  const action: MultiFieldsAction = {
    type: actionTypes.REMOVE_FIELDS,
    fields,
  };
  return action
};
