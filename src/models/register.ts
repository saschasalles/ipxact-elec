import { Access } from './access';
import { removeRegisters as removeRegistersAction, addRegister as addRegisterAction } from '../store/registerActions';
import { removeFields } from '../store/fieldActions';
import { removeEVS } from '../store/evActions';
import { updateFunction } from '../store/functionActions';
import { Field } from '../models/field';
import { EnumeratedValue } from '../models/enumerated-value';
import { AddressSpace } from '../models/address-space';
import { store } from '../store/store';




export class Register {
  private _id: string;
  private _parentFunctionId: string;
  private _name: string;
  private _address: number;
  private _access: Access;
  private _description: string;
  private _defaultValue: number;
  private _mask: number;
  private _dim: number;
  private _dimOffset: number;
  private _isHidden: boolean;
  private _duplicateNb?: number;
  private _duplicateId?: number;
  private _fields?: string[];

  constructor(
    id: string,
    parentFunctionId: string,
    name: string,
    address: number,
    access: Access,
    description: string,
    defaultValue: number,
    mask: number,
    dim: number,
    dimOffset: number,
    isHidden: boolean,
    duplicateNb?: number,
    duplicateId?: number,
    fields?: string[],
  ) {
    this._id = id;
    this._parentFunctionId = parentFunctionId;
    this._name = name;
    this._address = address;
    this._access = access;
    this._description = description;
    this._defaultValue = defaultValue;
    this._mask = mask;
    this._dim = dim;
    this._dimOffset = dimOffset;
    this._duplicateNb = duplicateNb;
    this._duplicateId = duplicateId;
    this._isHidden = isHidden;
    this._fields = fields;
  }

  /**
   * Getter id
   * @return {string}
   */
  public get id(): string {
    return this._id;
  }

  /**
   * Getter parent function Id
   * @return {string}
   */
  public get parentFunctionId(): string {
    return this._parentFunctionId;
  }

  /**
   * Getter name
   * @return {string}
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Getter address
   * @return {number}
   */
  public get address(): number {
    return this._address;
  }

  /**
   * Getter access
   * @return {Access}
   */
  public get access(): Access {
    return this._access;
  }

  /**
   * Getter description
   * @return {string}
   */
  public get description(): string {
    return this._description;
  }

  /**
   * Getter defaultValue
   * @return {number}
   */
  public get defaultValue(): number {
    return this._defaultValue;
  }

  /**
   * Getter mask
   * @return {number}
   */
  public get mask(): number {
    return this._mask;
  }

  /**
   * Getter dim
   * @return {number}
   */
  public get dim(): number {
    return this._dim;
  }

  /**
   * Getter dimOffset
   * @return {number}
   */
  public get dimOffset(): number {
    return this._dimOffset;
  }

  /**
   * Getter isHidden
   * @return {boolean}
   */
  public get isHidden(): boolean {
    return this._isHidden;
  }

  /**
   * Getter width
   * @return {Array<string>}
   */

  public get fields(): string[] {
    return this._fields;
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
   * Setter description
   * @param {string} value
   */
  public set parentFunctionId(value: string) {
    this._parentFunctionId = value;
  }

  /**
   * Setter address
   * @param {number} value
   */
  public set address(value: number) {
    this._address = value;
  }

  /**
   * Setter access
   * @param {Access} value
   */
  public set access(value: Access) {
    this._access = value;
  }

  /**
   * Setter description
   * @param {string} value
   */
  public set description(value: string) {
    this._description = value;
  }

  /**
   * Setter defaultValue
   * @param {number} value
   */
  public set defaultValue(value: number) {
    this._defaultValue = value;
  }

  /**
   * Setter mask
   * @param {number} value
   */
  public set mask(value: number) {
    this._mask = value;
  }

  /**
   * Setter dim
   * @param {number} value
   */
  public set dim(value: number) {
    this._dim = value;
  }

  /**
   * Setter dimOffset
   * @param {number} value
   */
  public set dimOffset(value: number) {
    this._dimOffset = value;
  }

  /**
   * Setter isHidden
   * @param {boolean} value
   */
  public set isHidden(value: boolean) {
    this._isHidden = value;
  }

  /**
   * set register
   * @param {Array<string>} value
   */
  public set fields(value: string[]) {
    this._fields = value;
  }

  static add = (reg: Register) => {
    store.dispatch(addRegisterAction(reg));
  };

  static deleteById = (regId: string) => {
    const currentState = store.getState();
    const storeRegs = currentState.registerReducer.registers
    const storeFuncs = currentState.functionReducer.addressSpaces
    const storeFields = currentState.fieldReducer.fields
    const storeEVS = currentState.enumeratedValueReducer.enumeratedValues

    const reg = storeRegs.find((reg: Register) => reg.id === regId);
    console.log(reg);
    if (reg != null) {
      let associatedFunc = storeFuncs.find((f: AddressSpace) => f.id === reg.parentFunctionId);
      if (associatedFunc != null) {
        // detach from parent func
        associatedFunc.registers = associatedFunc.registers.filter((r: string) => r !== reg.id);
        store.dispatch(updateFunction(associatedFunc));

        // clear the ev from fields
        if (reg.fields != null && reg.fields.length > 0) {
          reg.fields.forEach((f: string) => {
            let field = storeFields.find((fi: Field) => f === fi.id);
            if (field != null) {
              if (field.enumeratedValues != null && field.enumeratedValues.length > 0) {
                const fetchedEV = storeEVS.find((ev: EnumeratedValue) => ev.parentFieldID === field.id);
                store.dispatch(removeEVS([fetchedEV]));
              }
            // delete child fields  
              store.dispatch(removeFields([field]));
            }
          });
        }
      }
      // detach his child fields and finaly delete reg
      reg.fields = [];
      store.dispatch(removeRegistersAction([reg]));
    }
  }

  // Can increase performance and decrease complexity ϑ(n) by using store.dispatch(multi)
  // Today it's not a requirement but it can't be required in future
  // Peace Sascha :)
  
  static deleteByIds = (regIds: string[]) => {
    regIds.forEach(regId => {
      Register.deleteById(regId)
    })
  }


}
