
export class Project {
    private _projectID: string;
    private _fileName: string;
    private _filePath: string;
    private _addressBits: number;
    private _projectName: string;
    private _company: string;
    private _description: string;
    private _version: number;


	constructor(
        id: string,
        fileName: string, 
        filePath: string, 
        addressBits: number,
        projectName: string,
        company: string, 
        description: string, 
        version: number) {
        this._projectID = id;
		this._fileName = fileName;
		this._filePath = filePath;
        this._addressBits = addressBits;
        this._projectName = projectName;
		this._company = company;
		this._description = description;
		this._version = version;
	}

    /**
     * Getter id
     * @return {string}
     */
     public get id(): string {
		return this._projectID;
	}

    /**
     * Getter fileName
     * @return {string}
     */
	public get fileName(): string {
		return this._fileName;
	}

    /**
     * Getter filePath
     * @return {string}
     */
	public get filePath(): string {
		return this._filePath;
	}

    /**
     * Getter projectName
     * @return {string}
     */
	public get projectName(): string {
		return this._projectName;
	}

    /**
     * Getter company
     * @return {string}
     */
	public get company(): string {
		return this._company;
	}

    /**
     * Getter description
     * @return {string}
     */
	public get description(): string {
		return this._description;
	}

    /**
     * Getter version
     * @return {number}
     */
	public get version(): number {
		return this._version;
	}

    /**
     * Setter id
     * @param {string} value
     */

    public set id(value: string) {
		this._projectID = value;
	}

    /**
     * Setter fileName
     * @param {string} value
     */
	public set fileName(value: string) {
		this._fileName = value;
	}

    /**
     * Setter filePath
     * @param {string} value
     */
	public set filePath(value: string) {
		this._filePath = value;
	}

    /**
     * Setter projectName
     * @param {string} value
     */
	public set projectName(value: string) {
		this._projectName = value;
	}

    /**
     * Setter company
     * @param {string} value
     */
	public set company(value: string) {
		this._company = value;
	}

    /**
     * Setter description
     * @param {string} value
     */
	public set description(value: string) {
		this._description = value;
	}

    /**
     * Setter version
     * @param {number} value
     */
	public set version(value: number) {
		this._version = value;
	}

        /**
     * Getter addressBits
     * @return {number}
     */
	public get addressBits(): number {
		return this._addressBits;
	}

    /**
     * Setter addressBits
     * @param {number} value
     */
	public set addressBits(value: number) {
		this._addressBits = value;
	}
}