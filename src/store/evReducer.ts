import * as actionTypes from './actionTypes';
import { EnumeratedValueState, MultiEnumeratedValuesAction, EnumeratedValueAction } from '../models/state';
import { EnumeratedValue } from '../models/enumerated-value';

const initialEVState: EnumeratedValueState = {
  enumeratedValues: [
  ],
};

type EVAction = EnumeratedValueAction | MultiEnumeratedValuesAction;

const enumeratedValueReducer = (
  state: EnumeratedValueState = initialEVState,
  action: EVAction,
): EnumeratedValueState => {
  switch (action.type) {
    case actionTypes.ADD_EV:
      if ('ev' in action) {
        const newEV: EnumeratedValue = action.ev;
        return { ...state, enumeratedValues: state.enumeratedValues.concat(newEV) };
      }

    case actionTypes.UPDATE_EV:
      if ('ev' in action) {
        const updatedEV: EnumeratedValue = action.ev;
        const newState = state.enumeratedValues.map((ev) => {
          if (ev.id === updatedEV.id) {
            (ev.name = updatedEV.name),
              (ev.parentFieldID = ev.parentFieldID),
              (ev.value = updatedEV.value)
          }
          return ev;
        });
        return { ...state, enumeratedValues: newState };
      }
    

    case actionTypes.REMOVE_EVS:
      if ('evs' in action) {
        const updatedEVS: EnumeratedValue[] = state.enumeratedValues.filter(
          (ev) => !action.evs.includes(ev),
        );
        return { ...state, enumeratedValues: updatedEVS };
      }
  }
  return state;
};

export default enumeratedValueReducer;
