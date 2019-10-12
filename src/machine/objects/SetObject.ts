import { StringObject } from './StringObject';
import { FrozenSetObject } from './FrozenSetObject';
import { IterableObject } from './IterableObject';
import { ExceptionType } from '../../api/ExceptionType';
import { PyObject } from '../../api/Object';
import { getObjectUtils } from '../../api/ObjectUtils';
import { pyFunction, pyParam, pyParamArgs } from '../../api/Decorators';

export class SetObject extends FrozenSetObject {
  public constructor(items: PyObject[] = []) {
    super(items);
  }

  public addItem(value: PyObject) {
    if (!this.contains(value)) {
      this.items.push(value);
    }
  }

  public toString(): string {
    return `{${this.items.map(o => (o instanceof StringObject ? `'${o.toString()}'` : o.toString())).join(', ')}}`;
  }

  @pyFunction
  public union(@pyParam('other', IterableObject) other: IterableObject) {
    return this.unionBase(new SetObject(), other);
  }

  @pyFunction
  public intersection(@pyParam('other', IterableObject) other: IterableObject) {
    return this.intersectionBase(new SetObject(), other);
  }

  @pyFunction
  public difference(@pyParam('other', IterableObject) other: IterableObject) {
    return this.differenceBase(new SetObject(), other);
  }

  @pyFunction
  // eslint-disable-next-line @typescript-eslint/camelcase
  public symmetric_difference(@pyParam('other', IterableObject) other: IterableObject) {
    return this.symmetricDifferenceBase(new SetObject(), other);
  }

  @pyFunction
  public add(@pyParam('obj', PyObject) obj: PyObject) {
    this.addItem(obj);
  }

  @pyFunction
  public remove(@pyParam('obj', PyObject) obj: PyObject) {
    const pos = this.items.findIndex(r => r.equals(obj));
    if (pos >= 0) {
      this.items.splice(pos, 1);
    } else {
      getObjectUtils().throwException(ExceptionType.KeyError);
    }
  }

  @pyFunction
  public discard(@pyParam('obj', PyObject) obj: PyObject) {
    const pos = this.items.findIndex(r => r.equals(obj));
    if (pos >= 0) {
      this.items.splice(pos, 1);
    }
  }

  @pyFunction
  public update(@pyParamArgs args: PyObject[]) {
    for (const item of args) {
      if (item instanceof IterableObject) {
        for (let i = 0; i < item.getCount(); i++) {
          this.add(item.getItem(i));
        }
      } else {
        this.add(item);
      }
    }
  }

  @pyFunction
  public clear() {
    this.items.splice(0, this.items.length);
  }
}
