
export class EnumeratedValue {
    private _id: string;
	private _parentFieldID: string;
    private _name: string;
    private _value: number;
	private _description: string;

	constructor(id: string, parentFieldID: string, name: string, value: number, description: string) {
		this._id = id;
		this._parentFieldID = parentFieldID;
		this._name = name;
		this._value = value;
		this._description = description;
	}

    /**
     * Getter id
     * @return {string}
     */
	 public get id(): string {
		return this._id;
	}

    /**
     * Getter description
     * @return {string}
     */
	public get description(): string {
		return this._description;
	}

    /**
     * Getter parentFieldID
     * @return {string}
     */
	 public get parentFieldID(): string {
		return this._parentFieldID;
	}


    /**
     * Getter name
     * @return {string}
     */
	public get name(): string {
		return this._name;
	}

    /**
     * Getter value
     * @return {string}
     */
	public get value(): number {
		return this._value;
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
     * Setter value
     * @param {string} value
     */
	public set value(value: number) {
		this._value = value;
	}

    /**
     * Setter parentFieldID
     * @param {string} value
     */
	public set parentFieldID(value: string) {
		this._parentFieldID = value;
	}


    /**
     * Setter description
     * @param {string} value
     */
	 public set description(value: string) {
		this._description = value;
	}

}