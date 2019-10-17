import { IteratorObject } from './IteratorObject';
import { ContainerObject } from './ContainerObject';
import { StringObject } from './StringObject';
import { ExceptionType } from '../../api/ExceptionType';
import { PyObject } from '../../api/Object';
import { getObjectUtils } from '../../api/ObjectUtils';
import { pyFunction, pyParam } from '../../api/Decorators';

export class ListObject extends ContainerObject {
  public constructor(values: PyObject[] = []) {
    super();
    this.items = values;
  }

  private readonly items: PyObject[];

  public contains(value: PyObject): boolean {
    return this.items.findIndex(r => r.equals(value)) >= 0;
  }

  public getCount(): number {
    return this.items.length;
  }

  public getItem(index: number | string): PyObject {
    if (typeof index === 'string') {
      getObjectUtils().throwException(ExceptionType.TypeError);
    }
    return this.items[index];
  }

  public setItem(index: number, value: PyObject) {
    this.items[index] = value;
  }

  public addItem(value: PyObject) {
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

  @pyFunction
  public __iter__() {
    return new IteratorObject(this);
  }

  @pyFunction
  public append(@pyParam('element') element: PyObject) {
    this.items.push(element);
  }
}
