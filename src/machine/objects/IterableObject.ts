import { BaseObject } from './BaseObject';
import { IteratorObject } from './IteratorObject';
import { ExceptionType } from '../../api/ExceptionType';
import { IntegerObject } from './IntegerObject';

export abstract class IterableObject extends BaseObject {
  protected constructor() {
    super();
  }

  abstract getItem(index: number | string): BaseObject;
  abstract getCount(): number;

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native___iter__() {
    return new IteratorObject(this);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_index(element: BaseObject, start: BaseObject, end: BaseObject) {
    let from: number, to: number;
    if (!start) {
      from = 0;
    } else {
      if (!start.canBeInteger()) {
        BaseObject.throwException(ExceptionType.TypeError, 'start');
        return;
      }
      from = start.toInteger();
    }
    if (!end) {
      to = this.getCount();
    } else {
      if (!end.canBeInteger()) {
        BaseObject.throwException(ExceptionType.TypeError, 'end');
        return;
      }
      to = end.toInteger();
    }
    for (let i = from; i <= to; i++) {
      const item = this.getItem(i);
      if (item && item.equals(element)) {
        return new IntegerObject(i);
      }
    }
    BaseObject.throwException(ExceptionType.ValueError, 'cannot find element');
  }
}
