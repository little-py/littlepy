import { BaseObject, ObjectType } from './BaseObject';
import { setIteratorFunction } from './IteratorObject';

export class DictionaryObject extends BaseObject {
  public constructor() {
    super(ObjectType.Dictionary);
    setIteratorFunction(this);
  }

  private readonly items: { [key: string]: BaseObject } = {};
  private _count = 0;

  public isContainer(): boolean {
    return true;
  }

  public count(): number {
    return this._count;
  }

  public contains(value: BaseObject): boolean {
    const name = value.toString();
    return !!this.items[name];
  }

  public setDictionaryItem(key: string, value: BaseObject) {
    this.items[key] = value;
    this._count = Object.keys(this.items).length;
  }

  public getDictionaryItem(key: string): BaseObject {
    return this.items[key];
  }

  public toString(): string {
    const keys = Object.keys(this.items);
    return `{${keys
      .map(key => {
        const value = this.items[key];
        return `'${key}': ${value.type === ObjectType.String ? `'${value.toString()}'` : value.toString()}`;
      })
      .join(', ')}}`;
  }
}
