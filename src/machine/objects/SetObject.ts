import { BaseObject } from './BaseObject';
import { IteratorObject } from './IteratorObject';
import { StringObject } from './StringObject';
import { ContainerObject } from './ContainerObject';

export class SetObject extends ContainerObject {
  public constructor() {
    super();
  }

  private readonly items: BaseObject[] = [];

  public getItem(index: number): BaseObject {
    return this.items[index];
  }

  public addItem(value: BaseObject) {
    this.items.push(value);
  }

  public contains(value: BaseObject): boolean {
    return this.items.findIndex(r => r.equals(value)) >= 0;
  }

  public toString(): string {
    return `{${this.items.map(o => (o instanceof StringObject ? `'${o.toString()}'` : o.toString())).join(', ')}}`;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native___iter__() {
    return new IteratorObject(this);
  }

  getCount(): number {
    return this.items.length;
  }
}
