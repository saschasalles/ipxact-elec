import { createStore } from 'redux';
import { combineReducers, configureStore, getDefaultMiddleware, AnyAction, Reducer } from '@reduxjs/toolkit';
import * as actionTypes from "./actionTypes"
import functionReducer from './functionReducer';
import blockReducer from './blockReducer';
import registerReducer from './registerReducer';
import fieldReducer from './fieldReducer';
import enumeratedValueReducer from './evReducer';
import projectReducer from './projectReducer';

const customizedMiddleware = getDefaultMiddleware({
  serializableCheck: false
})

const appReducer = combineReducers({
  functionReducer: functionReducer,
  registerReducer: registerReducer,
  blockReducer: blockReducer,
  fieldReducer: fieldReducer,
  enumeratedValueReducer: enumeratedValueReducer,
  projectReducer: projectReducer
});

export type RootState = ReturnType<typeof appReducer>;

export const ResetAppAction = {
  type: "RESET_APP"
}


const rootReducer: Reducer = (state: RootState, action: AnyAction) => {
  if (action.type === "RESET_APP") {
    state = {} as RootState;
  }
  return appReducer(state, action);
};

export const store = createStore(rootReducer);
export type AppDispatch = typeof store.dispatch;
