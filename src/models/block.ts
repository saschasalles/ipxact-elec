import { Access } from './access';
import { removeBlocks as removeBlocksAction, addBlock as addBlockAction } from '../store/blockActions';
import { updateFunction } from '../store/functionActions';
import { AddressSpace } from '../models/address-space';
import { store } from '../store/store';

export class Block {
  private _id: string;
  private _name: string;
  private _baseAddress: number;
  private _size: number;
  private _width: number;
  private _description: string;
  private _parentFunc: string;

  constructor(
    id: string,
    name: string,
    baseAddress: number,
    size: number,
    width: number,
    description: string,
    parentFunc: string,
  ) {
    this._id = id;
    this._name = name;
    this._baseAddress = baseAddress;
    this._size = size;
    this._width = width;
    this._description = description;
    this._parentFunc = parentFunc;
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
   * Getter description
   * @return {string}
   */
  public get description(): string {
    return this._description;
  }

  /**
   * Getter parentFunc
   * @return {string}
   */
  public get parentFunc(): string {
    return this._parentFunc;
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
   * Setter description
   * @param {string} value
   */
  public set description(value: string) {
    this._description = value;
  }

  /**
   * Setter parentFunc
   * @param {string} value
   */
  public set parentFunc(value: string) {
    this._parentFunc = value;
  }

  static add = (block: Block) => {
    store.dispatch(addBlockAction(block));
  };

  static deleteById = (blockId: string) => {
    const currentState = store.getState();
    const storeBlocks = currentState.blockReducer.blocks;
    const storeFuncs = currentState.functionReducer.addressSpaces;

    const block = storeBlocks.find((bk: Block) => bk.id === blockId);
    console.log(block);
    if (block != null) {
      let associatedFunc = storeFuncs.find((f: AddressSpace) => f.id === block.parentFunc);
      if (associatedFunc != null) {
        associatedFunc.blocks = associatedFunc.blocks.filter((r: string) => r !== block.id);
        store.dispatch(updateFunction(associatedFunc));
        store.dispatch(removeBlocksAction([block]));
      }
    }
  };

  static deleteByIds = (blockIds: string[]) => {
    blockIds.forEach((blockId) => {
      Block.deleteById(blockId);
    });
  };
}
