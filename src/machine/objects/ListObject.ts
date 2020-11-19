import { IteratorObject } from './IteratorObject';
import { ContainerObject } from './ContainerObject';
import { StringObject } from './StringObject';
import { ExceptionType } from '../../api/ExceptionType';
import { PyObject } from '../../api/Object';
import { getObjectUtils } from '../../api/ObjectUtils';
import { pyFunction, pyParam } from '../../api/Decorators';
import { UniqueErrorCode } from '../../api/UniqueErrorCode';
import { PropertyType } from '../../api/Native';
import { IterableObject } from './IterableObject';

export class ListObject extends ContainerObject {
  public constructor(values: PyObject[] = []) {
    super();
    this.items = values;
  }

  private items: PyObject[];

  public getValues(): PyObject[] {
    return this.items;
  }

  public contains(value: PyObject): boolean {
    return this.items.findIndex((r) => r.equals(value)) >= 0;
  }

  public getCount(): number {
    return this.items.length;
  }

  public getItem(index: number | string): PyObject {
    if (typeof index === 'string') {
      getObjectUtils().throwException(ExceptionType.TypeError, UniqueErrorCode.ExpectedStringObject);
    }
    return this.items[index];
  }

  public setItem(index: number, value: PyObject): void {
    this.items[index] = value;
  }

  public addItem(value: PyObject): void {
    this.items.push(value);
  }

  public toBoolean(): boolean {
    return this.items.length > 0;
  }

  public removeItem(index: number): void {
    this.items.splice(index, 1);
  }

  public toString(): string {
    return `[${this.items
      .map((r) => {
        if (r instanceof StringObject) {
          return `'${r.toString()}'`;
        } else {
          return r.toString();
        }
      })
      .join(', ')}]`;
  }

  @pyFunction
  public __iter__(): IteratorObject {
    return new IteratorObject(this);
  }

  @pyFunction
  public append(@pyParam('element') element: PyObject): void {
    this.items.push(element);
  }

  @pyFunction
  public insert(@pyParam('pos', PropertyType.Number) pos: number, @pyParam('elmnt') elmnt: PyObject): void {
    this.items.splice(pos, 0, elmnt);
  }

  @pyFunction
  public extend(@pyParam('iterable', PropertyType.Iterable) iterable: IterableObject): void {
    const count = iterable.getCount();
    for (let i = 0; i < count; i++) {
      this.items.push(iterable.getItem(i));
    }
  }

  @pyFunction
  public remove(@pyParam('elmnt') elmnt: PyObject): void {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].equals(elmnt)) {
        this.items.splice(i, 1);
        break;
      }
    }
  }

  @pyFunction
  public pop(@pyParam('pos', PropertyType.Number, -1) pos: number): void {
    if (pos === -1) {
      pos = this.items.length - 1;
    }
    this.items.splice(pos, 1);
  }

  @pyFunction
  public clear(): void {
    this.items.splice(0, this.items.length);
  }

  @pyFunction
  public sort(@pyParam('reverse', PropertyType.Boolean, false) reverse: boolean): void {
    if (reverse) {
      this.items.sort((a, b) => b.compare(a));
    } else {
      this.items.sort((a, b) => a.compare(b));
    }
  }

  @pyFunction
  public copy(): ListObject {
    return new ListObject(this.items);
  }

  @pyFunction
  public count(@pyParam('value') value: PyObject): number {
    let count = 0;
    for (const item of this.items) {
      if (item.equals(value)) {
        count++;
      }
    }
    return count;
  }

  @pyFunction
  public reverse(): void {
    this.items = this.items.reverse();
  }
}
