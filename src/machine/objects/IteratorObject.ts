import { BaseObject } from './BaseObject';
import { IterableObject } from './IterableObject';
import { nativeFunction } from '../NativeTypes';
import { ExceptionType } from '../../api/ExceptionType';

export class IteratorObject extends BaseObject {
  private index = 0;
  private iterableObject: IterableObject;
  public constructor(iterableObject: IterableObject) {
    super();
    this.iterableObject = iterableObject;
  }

  @nativeFunction
  public __iter__() {
    return this;
  }

  @nativeFunction
  public __next__() {
    if (this.index >= this.iterableObject.getCount()) {
      BaseObject.throwException(ExceptionType.StopIteration);
      /* istanbul ignore next */
      return;
    }
    return this.iterableObject.getItem(this.index++);
  }
}
