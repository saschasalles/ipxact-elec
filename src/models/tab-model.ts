import { string } from 'yup/lib/locale';

export class Tab {
  public id: string;
  public name: string;
  public registerID: string;
  public href: string;
  public current: boolean;
  public closable: boolean;

  constructor(id: string, name: string, registerID: string, current: boolean, closable: boolean) {
    (this.id = id),
      (this.name = name),
      (this.registerID = registerID),
      (this.current = current),
      (this.closable = closable);
  }
}
