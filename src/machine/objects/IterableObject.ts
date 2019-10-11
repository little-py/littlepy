import { BaseObject } from './BaseObject';
import { IteratorObject } from './IteratorObject';
import { ExceptionType } from '../../api/ExceptionType';
import { IntegerObject } from './IntegerObject';
import { nativeFunction, param } from '../NativeTypes';

export abstract class IterableObject extends BaseObject {
  protected constructor() {
    super();
  }

  abstract getItem(index: number | string): BaseObject;
  abstract getCount(): number;

  @nativeFunction
  public __iter__() {
    return new IteratorObject(this);
  }

  @nativeFunction
  public index(
    @param('element', BaseObject) element: BaseObject,
    @param('start', IntegerObject, 0) start: number,
    @param('end', IntegerObject, -1) end: number,
  ) {
    if (end === -1) {
      end = this.getCount();
    }
    for (let i = start; i < end; i++) {
      const item = this.getItem(i);
      if (item && item.equals(element)) {
        return i;
      }
    }
    BaseObject.throwException(ExceptionType.ValueError, 'cannot find element');
  }
}
