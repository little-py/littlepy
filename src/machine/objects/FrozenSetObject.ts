import { ContainerObject } from './ContainerObject';
import { StringObject } from './StringObject';
import { IteratorObject } from './IteratorObject';
import { BooleanObject } from './BooleanObject';
import { IterableObject } from './IterableObject';
import { PyObject } from '../../api/Object';
import { pyFunction, pyParam } from '../../api/Decorators';
import { PropertyType } from '../../api/Native';

export class FrozenSetObject extends ContainerObject {
  public constructor(items: PyObject[] = []) {
    super();
    this.items = items;
  }

  protected readonly items: PyObject[];

  public getItem(index: number): PyObject {
    return this.items[index];
  }

  public contains(value: PyObject): boolean {
    return this.items.findIndex((r) => r.equals(value)) >= 0;
  }

  public toString(): string {
    return `frozenset({${this.items.map((o) => (o instanceof StringObject ? `'${o.toString()}'` : o.toString())).join(', ')}})`;
  }

  @pyFunction
  public __iter__(): IteratorObject {
    return new IteratorObject(this);
  }

  getCount(): number {
    return this.items.length;
  }

  @pyFunction
  public isdisjoint(@pyParam('other', PropertyType.Iterable) other: IterableObject): BooleanObject {
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
    return BooleanObject.toBoolean(!found);
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

  @pyFunction
  public issubset(@pyParam('other', PropertyType.Iterable) other: IterableObject): BooleanObject {
    return BooleanObject.toBoolean(FrozenSetObject.issubset(this, other));
  }

  @pyFunction
  issuperset(@pyParam('other', PropertyType.Iterable) other: IterableObject): BooleanObject {
    return BooleanObject.toBoolean(FrozenSetObject.issubset(other, this));
  }

  protected unionBase(ret: FrozenSetObject, other: IterableObject): FrozenSetObject {
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

  @pyFunction
  public union(@pyParam('other', PropertyType.Iterable) other: IterableObject): FrozenSetObject {
    return this.unionBase(new FrozenSetObject(), other);
  }

  protected intersectionBase(ret: FrozenSetObject, other: IterableObject): FrozenSetObject {
    for (let i = 0; i < other.getCount(); i++) {
      const item = other.getItem(i);
      if (this.contains(item)) {
        ret.items.push(item);
      }
    }
    return ret;
  }

  @pyFunction
  public intersection(@pyParam('other', PropertyType.Iterable) other: IterableObject): FrozenSetObject {
    return this.intersectionBase(new FrozenSetObject(), other);
  }

  protected differenceBase(ret: FrozenSetObject, other: IterableObject): FrozenSetObject {
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

  @pyFunction
  public difference(@pyParam('other', PropertyType.Iterable) other: IterableObject): FrozenSetObject {
    return this.differenceBase(new FrozenSetObject(), other);
  }

  protected symmetricDifferenceBase(ret: FrozenSetObject, other: IterableObject): FrozenSetObject {
    this.differenceBase(ret, other);
    for (let i = 0; i < other.getCount(); i++) {
      const item = other.getItem(i);
      if (!this.contains(item)) {
        ret.items.push(item);
      }
    }
    return ret;
  }

  @pyFunction
  public symmetric_difference(@pyParam('other', PropertyType.Iterable) other: IterableObject): FrozenSetObject {
    return this.symmetricDifferenceBase(new FrozenSetObject(), other);
  }

  public equals(to: PyObject): boolean {
    if (!(to instanceof FrozenSetObject)) {
      return false;
    }
    return FrozenSetObject.issubset(this, to) && FrozenSetObject.issubset(to, this);
  }
}
