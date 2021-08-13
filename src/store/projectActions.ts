import * as actionTypes from './actionTypes';
import { Project } from '../models/project';
import { ProjectAction, ProjectState } from '../models/state';

export const addProject = (project: Project) => {
  const action: ProjectAction = {
    type: actionTypes.ADD_PROJECT,
    project,
  };
  return action;
};

export const updateProject = (project: Project) => {
  const action: ProjectAction = {
    type: actionTypes.UPDATE_PROJECT,
    project,
  };
  return action;
};

export const removeProject = (project: Project) => {
  const action: ProjectAction = {
    type: actionTypes.REMOVE_PROJECT,
    project,
  };
  return action;
};

