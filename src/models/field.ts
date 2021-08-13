import { Access } from './access';

export class Field {
  private _id: string;
  private _parentRegID: string;
  private _name: string;
  private _defaultValue: number;
  private _description: string;
  private _access: Access;
  private _posh: number;
  private _posl: number;
  private _enumeratedValues: string[];

  constructor(
    id: string,
    parentRegID: string,
    name: string,
    defaultValue: number,
    description: string,
    access: Access,
    posh: number,
    posl: number,
    enumeratedValues?: string[]
  ) {
    this._id = id;
    this._parentRegID = parentRegID;
    this._name = name;
    this._defaultValue = defaultValue;
    this._description = description;
    this._access = access;
    this._posh = posh;
    this._posl = posl;
    this._enumeratedValues = enumeratedValues
  }

  /**
   * Getter id
   * @return {string}
   */
  public get id(): string {
    return this._id;
  }

  /**
   * Getter id
   * @return {string}
   */
  public get parentRegID(): string {
    return this._parentRegID;
  }

  /**
   * Getter name
   * @return {string}
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Getter defaultValue
   * @return {number}
   */
  public get defaultValue(): number {
    return this._defaultValue;
  }

  /**
   * Getter description
   * @return {string}
   */
  public get description(): string {
    return this._description;
  }

  /**
   * Getter access
   * @return {Access}
   */
  public get access(): Access {
    return this._access;
  }

  /**
   * Getter posh
   * @return {number}
   */
  public get posh(): number {
    return this._posh;
  }

  /**
   * Getter posl
   * @return {number}
   */
  public get posl(): number {
    return this._posl;
  }

  /**
   * Getter enumeratedValues
   * @return {string[]}
   */
  public get enumeratedValues(): string[] {
    return this._enumeratedValues;
  }

  /**
   * Setter id
   * @param {string} value
   */
  public set id(value: string) {
    this._id = value;
  }

  /**
   * Setter parentRegID
   * @return {string}
   */
  public set parentRegID(value: string) {
    this._parentRegID = value;
  }

  /**
   * Setter name
   * @param {string} value
   */
  public set name(value: string) {
    this._name = value;
  }

  /**
   * Setter defaultValue
   * @param {number} value
   */
  public set defaultValue(value: number) {
    this._defaultValue = value;
  }

  /**
   * Setter description
   * @param {string} value
   */
  public set description(value: string) {
    this._description = value;
  }

  /**
   * Setter access
   * @param {Access} value
   */
  public set access(value: Access) {
    this._access = value;
  }

  /**
   * Setter posh
   * @param {number} value
   */
  public set posh(value: number) {
    this._posh = value;
  }

  /**
   * Setter posl
   * @param {number} value
   */
  public set posl(value: number) {
    this._posl = value;
  }

  /**
   * Setter posl
   * @param {string[]} value
   */
  public set enumeratedValues(value: string[]) {
    this._enumeratedValues = value;
  }
}
