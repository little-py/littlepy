import { BaseObject, ObjectType } from './BaseObject';
import { setIteratorFunction } from './IteratorObject';

export class SetObject extends BaseObject {
  public constructor() {
    super(ObjectType.Set);
    setIteratorFunction(this);
  }

  private readonly items: BaseObject[] = [];

  public isContainer(): boolean {
    return true;
  }

  public count(): number {
    return this.items.length;
  }

  public getItem(index: number): BaseObject {
    return this.items[index];
  }

  public addItem(value: BaseObject) {
    this.items.push(value);
  }

  public contains(value: BaseObject): boolean {
    return this.items.indexOf(value) >= 0;
  }

  public toString(): string {
    return `{${this.items.map(o => (o.type === ObjectType.String ? `'${o.toString()}'` : o.toString())).join(', ')}}`;
  }
}
