export class MappingTableRowData {
  public id: string;
  public functionId: string;
  public functionName: string;
  public baseAddress: number;
  public selected: boolean;
  public localAddress?: number;
  public registerName?: string;
  public registerId?: string;
  public blockId?: string;
  public blockName?: string;
  public description?: string;
  public menuX?: number;
  public menuY?: number;

  constructor(
    id: string,
    functionId: string,
    functionName: string,
    baseAddress: number,
    selected: boolean,
    localAddress?: number,
    registerId?: string,
    registerName?: string,
    blockId?: string,
    blockName?: string,
    description?: string,
    menuX?: number,
    menuY?: number,
  ) {
    (this.id = id),
      (this.functionId = functionId),
      (this.functionName = functionName),
      (this.baseAddress = baseAddress),
      (this.selected = selected),
      (this.localAddress = localAddress),
      (this.registerName = registerName),
      (this.registerId = registerId),
      (this.blockName = blockName),
      (this.blockId = blockId),
      (this.description = description),
      (this.menuX = menuX),
      (this.menuY = menuY);
  }
}
