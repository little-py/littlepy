import { BaseObject } from './BaseObject';
import { setIteratorFunction } from './IteratorObject';
import { ObjectType } from '../../api/ObjectType';

export class ListObject extends BaseObject {
  public constructor() {
    super(ObjectType.List);
    setIteratorFunction(this);
  }

  private readonly items: BaseObject[] = [];

  public isContainer(): boolean {
    return true;
  }

  public contains(value: BaseObject): boolean {
    return this.items.indexOf(value) >= 0;
  }

  public count(): number {
    return this.items.length;
  }

  public getItem(index: number): BaseObject {
    return this.items[index];
  }

  public setItem(index: number, value: BaseObject) {
    this.items[index] = value;
  }

  public addItem(value: BaseObject) {
    this.items.push(value);
  }

  public toBoolean(): boolean {
    return this.items.length > 0;
  }

  public toString(): string {
    return `[${this.items
      .map(r => {
        if (r.type === ObjectType.String) {
          return `'${r.toString()}'`;
        } else {
          return r.toString();
        }
      })
      .join(', ')}]`;
  }
}
