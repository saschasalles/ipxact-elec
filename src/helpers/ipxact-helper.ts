import { store } from '../store/store';
import { Field } from '../models/field';
import { Register } from '../models/register';
import { EnumeratedValue } from '../models/enumerated-value';
import { Project } from '../models/project';
import { Access } from '../models/access';
import { AddressSpace } from '../models/address-space';
import { v4 as uuidv4 } from 'uuid';
import { addProject as addProjectAction } from '../store/projectActions';
import { addFunction as addFunctionAction } from '../store/functionActions';
import { addRegister } from '../store/registerActions';
import { addField as addFieldAction } from '../store/fieldActions';
import { PythonShell } from 'python-shell';


export const fetchItems = (data: any): Project => {
  const project = new Project(
    uuidv4(),
    data.project.name,
    data.project.path,
    data.project.addressUnitBits,
    data.project.name,
    data.project.vendor,
    data.project.description,
    data.project.version,
  );
  store.dispatch(addProjectAction(project));

  data.funcs.forEach((func: any) => {
    const fetchedFunc = new AddressSpace(
      func.id,
      func.name,
      func.baseAddress,
      func.size,
      func.width,
      func.description,
      '',
      '',
      [],
      [],
    );

    const fetchedRegs = data.regs.filter((reg: any) => reg.parentFuncId === fetchedFunc.id);
    if (fetchedRegs != null) {
      fetchedRegs.forEach((reg: any) => {
        const fetchedReg = new Register(
          reg.id,
          reg.parentFuncId,
          reg.name,
          reg.addressOffset,
          reg.access,
          reg.description,
          0,
          0,
          0,
          0,
          false,
          null,
          null,
          [],
        );

        fetchedFunc.registers.push(fetchedReg.id);
        const fetchedFields = data.fields.filter((field: any) => field.parentRegisterId === fetchedReg.id);
        if (fetchedFields != null) {
          fetchedFields.forEach((field: any) => {
            const fetchedField = new Field(
              field.id,
              field.parentRegisterId,
              field.name,
              0,
              field.description,
              Access.Read,
              field.bitOffset + field.bitWidth - 1,
              field.bitOffset,
              [],
            );
            fetchedReg.fields.push(fetchedField.id);
            store.dispatch(addFieldAction(fetchedField));
          });
        }
        Register.add(fetchedReg);
      });
    }

    store.dispatch(addFunctionAction(fetchedFunc));
  });

  console.log(store.getState().projectReducer)
  return project;
};


export const save = (currentState: any): string[] => {
  const storeProjects = currentState.projectReducer.projects;
  const storeFuncs = currentState.functionReducer.addressSpaces;
  const storeBlocks = currentState.blockReducer.blocks;
  const storeRegs = currentState.registerReducer.registers;
  const storeFields = currentState.fieldReducer.fields;
  const storeEVS = currentState.enumeratedValueReducer.enumeratedValues;

  const data = {
    project: storeProjects,
    funcs: storeFuncs,
    blocks: storeBlocks,
    regs: storeRegs,
    fields: storeFields,
    evs: storeEVS,
  }; 

  const stringified = JSON.stringify(data);
  return [data.project[0], stringified]
};
