import { IterableObject } from './IterableObject';
import { ExceptionType } from '../../api/ExceptionType';
import { PyObject } from '../../api/Object';
import { getObjectUtils } from '../../api/ObjectUtils';
import { pyFunction } from '../../api/Decorators';

export class IteratorObject extends PyObject {
  private index = 0;
  private iterableObject: IterableObject;
  public constructor(iterableObject: IterableObject) {
    super();
    this.iterableObject = iterableObject;
  }

  @pyFunction
  public __iter__() {
    return this;
  }

  @pyFunction
  public __next__() {
    if (this.index >= this.iterableObject.getCount()) {
      getObjectUtils().throwException(ExceptionType.StopIteration);
      /* istanbul ignore next */
      return;
    }
    return this.iterableObject.getItem(this.index++);
  }
}
