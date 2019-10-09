import { BaseObject } from './BaseObject';
import { StringObject } from './StringObject';
import { FrozenSetObject } from './FrozenSetObject';
import { IterableObject } from './IterableObject';
import { ExceptionType } from '../../api/ExceptionType';
import { CallableContext } from '../CallableContext';

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

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_union(other: BaseObject) {
    if (!(other instanceof IterableObject)) {
      BaseObject.throwException(ExceptionType.TypeError);
      /* istanbul ignore next */
      return;
    }
    const ret = new SetObject();
    return this.union(ret, other);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_intersection(other: BaseObject) {
    if (!(other instanceof IterableObject)) {
      BaseObject.throwException(ExceptionType.TypeError);
      /* istanbul ignore next */
      return;
    }
    const ret = new SetObject();
    return this.intersection(ret, other);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_difference(other: BaseObject) {
    if (!(other instanceof IterableObject)) {
      BaseObject.throwException(ExceptionType.TypeError);
      /* istanbul ignore next */
      return;
    }
    const ret = new SetObject();
    return this.difference(ret, other);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_symmetric_difference(other: BaseObject) {
    if (!(other instanceof IterableObject)) {
      BaseObject.throwException(ExceptionType.TypeError);
      /* istanbul ignore next */
      return;
    }
    const ret = new SetObject();
    return this.symmetricDifference(ret, other);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_add(obj: BaseObject) {
    this.addItem(obj);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_remove(obj: BaseObject) {
    const pos = this.items.findIndex(r => r.equals(obj));
    if (pos >= 0) {
      this.items.splice(pos, 1);
    } else {
      BaseObject.throwException(ExceptionType.KeyError);
    }
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_discard(obj: BaseObject) {
    const pos = this.items.findIndex(r => r.equals(obj));
    if (pos >= 0) {
      this.items.splice(pos, 1);
    }
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_update(callContext: CallableContext) {
    for (const item of callContext.indexedArgs) {
      if (item.object instanceof IterableObject) {
        for (let i = 0; i < item.object.getCount(); i++) {
          this.native_add(item.object.getItem(i));
        }
      } else {
        this.native_add(item.object);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_clear() {
    this.items.splice(0, this.items.length);
  }
}
