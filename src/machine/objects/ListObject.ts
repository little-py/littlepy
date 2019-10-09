import { BaseObject } from './BaseObject';
import { IteratorObject } from './IteratorObject';
import { ContainerObject } from './ContainerObject';
import { StringObject } from './StringObject';
import { ExceptionType } from '../../api/ExceptionType';

export class ListObject extends ContainerObject {
  public constructor(values: BaseObject[] = []) {
    super();
    this.items = values;
  }

  public static initList() {
    BaseObject.createList = items => new ListObject(items);
  }

  private readonly items: BaseObject[];

  public contains(value: BaseObject): boolean {
    return this.items.findIndex(r => r.equals(value)) >= 0;
  }

  public getCount(): number {
    return this.items.length;
  }

  public getItem(index: number | string): BaseObject {
    if (typeof index === 'string') {
      BaseObject.throwException(ExceptionType.TypeError);
    }
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

  public removeItem(index: number) {
    this.items.splice(index, 1);
  }

  public toString(): string {
    return `[${this.items
      .map(r => {
        if (r instanceof StringObject) {
          return `'${r.toString()}'`;
        } else {
          return r.toString();
        }
      })
      .join(', ')}]`;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native___iter__() {
    return new IteratorObject(this);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_append(element: BaseObject) {
    this.items.push(element);
  }
}

ListObject.initList();
