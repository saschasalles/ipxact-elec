import { AddressSpace } from './address-space';
import { Field } from '../models/field';
import { Register } from '../models/register';
import { Block } from '../models/block';
import { EnumeratedValue } from '../models/enumerated-value';
import { Project } from '../models/project';

// Funcs

export type AddressSpaceState = {
  addressSpaces: AddressSpace[];
};

export interface AddressSpaceAction {
  type: string;
  addressSpace: AddressSpace;
}

export interface MultiAddressSpacesAction {
  type: string;
  addressSpaces: AddressSpace[];
}

// Registers

export type RegisterState = {
  registers: Register[];
};

export type RegisterAction = {
  type: string;
  register: Register;
};

export type MultiRegistersAction = {
  type: string;
  registers: Register[];
};

// Blocks

export type BlockState = {
  blocks: Block[];
};

export type BlockAction = {
  type: string;
  block: Block;
};

export type MultiBlocksAction = {
  type: string;
  blocks: Block[];
};

// Fields
export type FieldState = {
  fields: Field[];
};

export type FieldAction = {
  type: string;
  field: Field;
};

export type MultiFieldsAction = {
  type: string;
  fields: Field[];
};

// Enumerated Values

export type EnumeratedValueState = {
  enumeratedValues: EnumeratedValue[];
};

export type EnumeratedValueAction = {
  type: string;
  ev: EnumeratedValue;
};

export type MultiEnumeratedValuesAction = {
  type: string;
  evs: EnumeratedValue[];
};

// Project

export type ProjectState = {
  projects: Project[];
};

export type ProjectAction = {
  type: string;
  project: Project;
};
