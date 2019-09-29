import { BaseObject } from './BaseObject';
import { setIteratorFunction } from './IteratorObject';
import { ObjectType } from '../../api/ObjectType';

export class TupleObject extends BaseObject {
  public constructor(items: BaseObject[]) {
    super(ObjectType.Tuple);
    this.items = items;
    setIteratorFunction(this);
  }

  private readonly items: BaseObject[];

  public isContainer(): boolean {
    return true;
  }

  public count(): number {
    return this.items.length;
  }

  public getItem(index: number): BaseObject {
    return this.items[index];
  }

  public addItem(obj: BaseObject) {
    this.items.push(obj);
  }

  public contains(value: BaseObject): boolean {
    return this.items.indexOf(value) >= 0;
  }

  public toString(): string {
    return `(${this.items
      .map(r => {
        if (r.type === ObjectType.String) {
          return `'${r.toString()}'`;
        } else {
          return r.toString();
        }
      })
      .join(', ')})`;
  }
}
