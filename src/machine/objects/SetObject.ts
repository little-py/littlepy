import { BaseObject } from './BaseObject';
import { StringObject } from './StringObject';
import { FrozenSetObject } from './FrozenSetObject';
import { IterableObject } from './IterableObject';
import { ExceptionType } from '../../api/ExceptionType';
import { nativeFunction, param, paramArgs } from '../NativeTypes';

export class SetObject extends FrozenSetObject {
  public constructor(items: BaseObject[] = []) {
    super(items);
  }

  public addItem(value: BaseObject) {
    if (!this.contains(value)) {
      this.items.push(value);
    }
  }

  public toString(): string {
    return `{${this.items.map(o => (o instanceof StringObject ? `'${o.toString()}'` : o.toString())).join(', ')}}`;
  }

  @nativeFunction
  public union(@param('other', IterableObject) other: IterableObject) {
    return this.unionBase(new SetObject(), other);
  }

  @nativeFunction
  public intersection(@param('other', IterableObject) other: IterableObject) {
    return this.intersectionBase(new SetObject(), other);
  }

  @nativeFunction
  public difference(@param('other', IterableObject) other: IterableObject) {
    return this.differenceBase(new SetObject(), other);
  }

  @nativeFunction
  // eslint-disable-next-line @typescript-eslint/camelcase
  public symmetric_difference(@param('other', IterableObject) other: IterableObject) {
    return this.symmetricDifferenceBase(new SetObject(), other);
  }

  @nativeFunction
  public add(@param('obj', BaseObject) obj: BaseObject) {
    this.addItem(obj);
  }

  @nativeFunction
  public remove(@param('obj', BaseObject) obj: BaseObject) {
    const pos = this.items.findIndex(r => r.equals(obj));
    if (pos >= 0) {
      this.items.splice(pos, 1);
    } else {
      BaseObject.throwException(ExceptionType.KeyError);
    }
  }

  @nativeFunction
  public discard(@param('obj', BaseObject) obj: BaseObject) {
    const pos = this.items.findIndex(r => r.equals(obj));
    if (pos >= 0) {
      this.items.splice(pos, 1);
    }
  }

  @nativeFunction
  public update(@paramArgs args: BaseObject[]) {
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

  @nativeFunction
  public clear() {
    this.items.splice(0, this.items.length);
  }
}
