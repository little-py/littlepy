import { StringObject } from './StringObject';
import { ContainerObject } from './ContainerObject';
import { PyObject } from '../../api/Object';

export class TupleObject extends ContainerObject {
  public getCount(): number {
    return this.items.length;
  }

  public constructor(items: PyObject[]) {
    super();
    this.items = items;
  }

  public readonly items: PyObject[];

  public getItem(index: number): PyObject {
    return this.items[index];
  }

  public addItem(obj: PyObject) {
    this.items.push(obj);
  }

  public contains(value: PyObject): boolean {
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
