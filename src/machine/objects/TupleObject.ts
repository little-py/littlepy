import { BaseObject } from './BaseObject';
import { StringObject } from './StringObject';
import { ContainerObject } from './ContainerObject';

export class TupleObject extends ContainerObject {
  public getCount(): number {
    return this.items.length;
  }

  public constructor(items: BaseObject[]) {
    super();
    this.items = items;
  }

  public readonly items: BaseObject[];

  public getItem(index: number): BaseObject {
    return this.items[index];
  }

  public addItem(obj: BaseObject) {
    this.items.push(obj);
  }

  public contains(value: BaseObject): boolean {
    return this.items.findIndex(r => r.equals(value)) >= 0;
  }

  public toString(): string {
    const items = `${this.items
      .map(r => {
        if (r instanceof StringObject) {
          return `'${r.toString()}'`;
        } else {
          return r.toString();
        }
      })
      .join(', ')}`;
    return this.items.length === 1 ? `(${items},)` : `(${items})`;
  }
}
