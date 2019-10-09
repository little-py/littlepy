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
    const startValue = start ? IntegerObject.toInteger(start, 'start') : 0;
    const endValue = end ? IntegerObject.toInteger(end, 'end') : this.getCount();
    for (let i = startValue; i < endValue; i++) {
      const item = this.getItem(i);
      if (item && item.equals(element)) {
        return new IntegerObject(i);
      }
    }
    BaseObject.throwException(ExceptionType.ValueError, 'cannot find element');
  }
}
