import { Register } from './register';
import { RegisterState } from './state';
import { useSelector, shallowEqual } from 'react-redux';
import { store } from '../store/store';
import { addFunction, removeFunctions as removeFuncsAction } from '../store/functionActions';
import { BlockList } from 'net';

export class AddressSpace {
  private _id: string;
  private _name: string;
  private _baseAddress: number;
  private _size: number;
  private _width: number;
  private _description?: string;
  private _duplicateNb?: string;
  private _duplicateId?: string;
  private _registers?: string[];
  private _blocks?: string[];

  constructor(
    id: string,
    name: string,
    baseAddress: number,
    size: number,
    width: number,
    description?: string,
    duplicateNb?: string,
    duplicateId?: string,
    registers?: string[],
    blocks?: string[],
  ) {
    this._id = id;
    this._name = name;
    this._baseAddress = baseAddress;
    this._size = size;
    this._width = width;
    this._description = description;
    this._duplicateNb = duplicateNb;
    this._duplicateId = duplicateId;
    this._registers = registers;
    this._blocks = blocks;
  }

  /**
   * Getter id
   * @return {string}
   */
  public get id(): string {
    return this._id;
  }

  /**
   * Getter name
   * @return {string}
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Getter baseAddress
   * @return {number}
   */
  public get baseAddress(): number {
    return this._baseAddress;
  }

  /**
   * Getter size
   * @return {number}
   */
  public get size(): number {
    return this._size;
  }

  /**
   * Getter width
   * @return {number}
   */
  public get width(): number {
    return this._width;
  }

  /**
   * Getter width
   * @return {Array<string>}
   */

  public get registers(): string[] {
    return this._registers;
  }

  /**
   * Getter width
   * @return {Array<string>}
   */

  public get blocks(): string[] {
    return this._blocks;
  }

  /**
   * Setter id
   * @param {string} value
   */
  public set id(value: string) {
    this._id = value;
  }

  /**
   * Setter name
   * @param {string} value
   */
  public set name(value: string) {
    this._name = value;
  }

  /**
   * Setter baseAddress
   * @param {number} value
   */
  public set baseAddress(value: number) {
    this._baseAddress = value;
  }

  /**
   * Setter size
   * @param {number} value
   */
  public set size(value: number) {
    this._size = value;
  }

  /**
   * Setter width
   * @param {number} value
   */
  public set width(value: number) {
    this._width = value;
  }

  /**
   * set register
   * @param {string} value
   */
  public set registers(value: string[]) {
    this._registers = value;
  }

  /**
   * set register
   * @param {string} value
   */
  public set blocks(value: string[]) {
    this._blocks = value;
  }

  static deleteById = (funcId: string) => {
    const currentState = store.getState();
    const storeFuncs = currentState.functionReducer.addressSpaces

    const func = storeFuncs.find((f: AddressSpace) => f.id === funcId);
    console.log(func);

    if (func != null) {
      func.registers.forEach((regId: string) => {
        Register.deleteById(regId)
      })
      //TODO remove blocks
      store.dispatch(removeFuncsAction([func]))
    }
  }

  static deleteByIds = (funcIds: string[]) => {
    funcIds.forEach(funcId => {
      AddressSpace.deleteById(funcId)
    })
  }

  static add = (func: AddressSpace) => {
    store.dispatch(addFunction(func))
  }
}
