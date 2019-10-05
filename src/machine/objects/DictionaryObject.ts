import { BaseObject } from './BaseObject';
import { ContainerObject } from './ContainerObject';
import { StringObject } from './StringObject';

export class DictionaryObject extends ContainerObject {
  public constructor() {
    super();
  }

  private readonly items: { [key: string]: BaseObject } = {};
  private _count = 0;

  public getCount(): number {
    return this._count;
  }

  public getItem(index: string): BaseObject {
    return this.items[index];
  }

  public contains(value: BaseObject): boolean {
    const name = value.toString();
    return !!this.items[name];
  }

  public setItem(key: string, value: BaseObject) {
    this.items[key] = value;
    this._count = Object.keys(this.items).length;
  }

  public toString(): string {
    const keys = Object.keys(this.items);
    return `{${keys
      .map(key => {
        const value = this.items[key];
        return `'${key}': ${value instanceof StringObject ? `'${value.toString()}'` : value.toString()}`;
      })
      .join(', ')}}`;
  }
}
