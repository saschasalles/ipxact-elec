import * as actionTypes from './actionTypes';
import { ProjectAction, ProjectState } from '../models/state';
import { v4 as uuidv4 } from 'uuid';
import { Project } from '../models/project';

const initialProjectState: ProjectState = {
  projects: Array<Project>(),
};

const projectReducer = (state: ProjectState = initialProjectState, action: ProjectAction): ProjectState => {
  switch (action.type) {
    case actionTypes.ADD_PROJECT:
      const newProjet: Project = action.project;
      return { ...state, projects: state.projects.concat(newProjet) };

    case actionTypes.UPDATE_PROJECT:
      const updatedProject: Project = action.project;
      const newState = state.projects.map((pro) => {
        if (pro.id === pro.id) {
          (pro.fileName = updatedProject.fileName),
            (pro.addressBits = updatedProject.addressBits),
            (pro.projectName = updatedProject.projectName),
            (pro.company = updatedProject.company);
          pro.version = updatedProject.version;
        }
        return pro;
      });
      return { ...state, projects: newState };

    case actionTypes.REMOVE_PROJECT:
      const updatedProjects: Project[] = state.projects.filter((pro) => !action.project);
      return { ...state, projects: updatedProjects };
  }
  return state;
};

export default projectReducer;
