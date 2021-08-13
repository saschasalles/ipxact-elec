export class RegisterTableRowData {
  public id: string;
  public databit: string;
  public fieldName: string;
  public fieldId: string;
  public size: number;
  public defaultValue: number;
  public access: string;
  public description: string;
  public enumeratedValues: string;
  public selected: boolean;

  constructor(
    id: string,
    fieldId: string,
    fieldName: string,
    databit: string,
    size: number,
    defaultValue: number,
    access: string,
    description: string,
    enumeratedValues: string,
    selected: boolean,
  ) {
    (this.id = id),
      (this.fieldName = fieldName),
      (this.fieldId = fieldId),
      (this.size = size),
      (this.databit = databit),
      (this.defaultValue = defaultValue),
      (this.access = access),
      (this.description = description),
      (this.enumeratedValues = enumeratedValues),
      (this.selected = selected);
  }
}
