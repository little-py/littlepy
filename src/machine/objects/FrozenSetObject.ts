import { ContainerObject } from './ContainerObject';
import { BaseObject } from './BaseObject';
import { StringObject } from './StringObject';
import { IteratorObject } from './IteratorObject';
import { BooleanObject } from './BooleanObject';
import { IterableObject } from './IterableObject';
import { nativeFunction, param } from '../NativeTypes';

export class FrozenSetObject extends ContainerObject {
  public constructor(items: BaseObject[] = []) {
    super();
    this.items = items;
  }

  protected readonly items: BaseObject[];

  public getItem(index: number): BaseObject {
    return this.items[index];
  }

  public contains(value: BaseObject): boolean {
    return this.items.findIndex(r => r.equals(value)) >= 0;
  }

  public toString(): string {
    return `frozenset({${this.items.map(o => (o instanceof StringObject ? `'${o.toString()}'` : o.toString())).join(', ')}})`;
  }

  @nativeFunction
  public __iter__() {
    return new IteratorObject(this);
  }

  getCount(): number {
    return this.items.length;
  }

  @nativeFunction
  public isdisjoint(@param('other', IterableObject) other: IterableObject) {
    let found = false;
    for (const item of this.items) {
      for (let i = 0; i < other.getCount(); i++) {
        if (other.getItem(i).equals(item)) {
          found = true;
          break;
        }
      }
      if (found) {
        break;
      }
    }
    return new BooleanObject(!found);
  }

  public static issubset(first: IterableObject, other: IterableObject): boolean {
    for (let i = 0; i < first.getCount(); i++) {
      const item = first.getItem(i);
      let found = false;
      for (let j = 0; j < other.getCount(); j++) {
        if (other.getItem(j).equals(item)) {
          found = true;
          break;
        }
      }
      if (!found) {
        return false;
      }
    }
    return true;
  }

  @nativeFunction
  public issubset(@param('other', IterableObject) other: IterableObject) {
    return new BooleanObject(FrozenSetObject.issubset(this, other));
  }

  @nativeFunction
  issuperset(@param('other', IterableObject) other: IterableObject) {
    return new BooleanObject(FrozenSetObject.issubset(other, this));
  }

  protected unionBase(ret: FrozenSetObject, other: IterableObject) {
    for (const item of this.items) {
      ret.items.push(item);
    }
    for (let i = 0; i < other.getCount(); i++) {
      const item = other.getItem(i);
      if (!ret.contains(item)) {
        ret.items.push(item);
      }
    }
    return ret;
  }

  @nativeFunction
  public union(@param('other', IterableObject) other: IterableObject) {
    return this.unionBase(new FrozenSetObject(), other);
  }

  protected intersectionBase(ret: FrozenSetObject, other: IterableObject) {
    for (let i = 0; i < other.getCount(); i++) {
      const item = other.getItem(i);
      if (this.contains(item)) {
        ret.items.push(item);
      }
    }
    return ret;
  }

  @nativeFunction
  public intersection(@param('other', IterableObject) other: IterableObject) {
    return this.intersectionBase(new FrozenSetObject(), other);
  }

  protected differenceBase(ret: FrozenSetObject, other: IterableObject) {
    for (const item of this.items) {
      let found = false;
      for (let i = 0; i < other.getCount(); i++) {
        if (other.getItem(i).equals(item)) {
          found = true;
          break;
        }
      }
      if (!found) {
        ret.items.push(item);
      }
    }
    return ret;
  }

  @nativeFunction
  public difference(@param('other', IterableObject) other: IterableObject) {
    return this.differenceBase(new FrozenSetObject(), other);
  }

  protected symmetricDifferenceBase(ret: FrozenSetObject, other: IterableObject) {
    this.differenceBase(ret, other);
    for (let i = 0; i < other.getCount(); i++) {
      const item = other.getItem(i);
      if (!this.contains(item)) {
        ret.items.push(item);
      }
    }
    return ret;
  }

  @nativeFunction
  // eslint-disable-next-line @typescript-eslint/camelcase
  public symmetric_difference(@param('other', IterableObject) other: IterableObject) {
    return this.symmetricDifferenceBase(new FrozenSetObject(), other);
  }

  public equals(to: BaseObject): boolean {
    if (!(to instanceof FrozenSetObject)) {
      return false;
    }
    return FrozenSetObject.issubset(this, to) && FrozenSetObject.issubset(to, this);
  }
}
