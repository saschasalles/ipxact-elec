import * as actionTypes from './actionTypes';
import { FieldAction, MultiFieldsAction, FieldState } from '../models/state';
import { v4 as uuidv4 } from 'uuid';
import { Field } from '../models/field';
import { Access } from '../models/access';

const initialFieldState: FieldState = {
  fields: [],
};

type FAction = FieldAction | MultiFieldsAction;

const fieldReducer = (state: FieldState = initialFieldState, action: FAction): FieldState => {
  switch (action.type) {
    case actionTypes.ADD_FIELD:
      if ('field' in action) {
        const newField: Field = action.field;
        return {
          ...state,
          fields: state.fields.concat(newField),
        };
      }
    case actionTypes.REMOVE_FIELDS:
      if ('fields' in action) {
        const updatedFields: Field[] = state.fields.filter((f) => !action.fields.includes(f));
        return { ...state, fields: updatedFields };
      }

    case actionTypes.UPDATE_FIELD:
      if ('field' in action) {
        const updatedField: Field = action.field;

        const newState = state.fields.map((f) => {
          if (f.id === updatedField.id) {
            (f.name = updatedField.name),
              (f.defaultValue = updatedField.defaultValue),
              (f.description = updatedField.description),
              (f.access = updatedField.access),
              (f.posh = updatedField.posh),
              (f.posl = updatedField.posl);
          }
          return f;
        });
        return { ...state, fields: newState };
      }
  }
  return state;
};

export default fieldReducer;
