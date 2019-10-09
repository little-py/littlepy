import { ContainerObject } from './ContainerObject';
import { BaseObject } from './BaseObject';
import { StringObject } from './StringObject';
import { IteratorObject } from './IteratorObject';
import { ExceptionType } from '../../api/ExceptionType';
import { BooleanObject } from './BooleanObject';
import { IterableObject } from './IterableObject';

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

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native___iter__() {
    return new IteratorObject(this);
  }

  getCount(): number {
    return this.items.length;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_isdisjoint(other: BaseObject) {
    if (!(other instanceof IterableObject)) {
      BaseObject.throwException(ExceptionType.TypeError);
      /* istanbul ignore next */
      return;
    }
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

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_issubset(other: BaseObject) {
    if (!(other instanceof IterableObject)) {
      BaseObject.throwException(ExceptionType.TypeError);
      /* istanbul ignore next */
      return;
    }
    return new BooleanObject(FrozenSetObject.issubset(this, other));
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  native_issuperset(other: BaseObject) {
    if (!(other instanceof IterableObject)) {
      BaseObject.throwException(ExceptionType.TypeError);
      /* istanbul ignore next */
      return;
    }
    return new BooleanObject(FrozenSetObject.issubset(other, this));
  }

  public union(ret: FrozenSetObject, other: IterableObject) {
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

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_union(other: BaseObject) {
    if (!(other instanceof IterableObject)) {
      BaseObject.throwException(ExceptionType.TypeError);
      /* istanbul ignore next */
      return;
    }
    const ret = new FrozenSetObject();
    return this.union(ret, other);
  }

  public intersection(ret: FrozenSetObject, other: IterableObject) {
    for (let i = 0; i < other.getCount(); i++) {
      const item = other.getItem(i);
      if (this.contains(item)) {
        ret.items.push(item);
      }
    }
    return ret;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_intersection(other: BaseObject) {
    if (!(other instanceof IterableObject)) {
      BaseObject.throwException(ExceptionType.TypeError);
      /* istanbul ignore next */
      return;
    }
    const ret = new FrozenSetObject();
    return this.intersection(ret, other);
  }

  public difference(ret: FrozenSetObject, other: IterableObject) {
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

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_difference(other: BaseObject) {
    if (!(other instanceof IterableObject)) {
      BaseObject.throwException(ExceptionType.TypeError);
      /* istanbul ignore next */
      return;
    }
    const ret = new FrozenSetObject();
    return this.difference(ret, other);
  }

  public symmetricDifference(ret: FrozenSetObject, other: IterableObject) {
    this.difference(ret, other);
    for (let i = 0; i < other.getCount(); i++) {
      const item = other.getItem(i);
      if (!this.contains(item)) {
        ret.items.push(item);
      }
    }
    return ret;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_symmetric_difference(other: BaseObject) {
    if (!(other instanceof IterableObject)) {
      BaseObject.throwException(ExceptionType.TypeError);
      /* istanbul ignore next */
      return;
    }
    const ret = new FrozenSetObject();
    return this.symmetricDifference(ret, other);
  }

  public equals(to: BaseObject): boolean {
    if (!(to instanceof FrozenSetObject)) {
      return false;
    }
    return FrozenSetObject.issubset(this, to) && FrozenSetObject.issubset(to, this);
  }
}
