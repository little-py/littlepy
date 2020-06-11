import { IterableObject } from './IterableObject';
import { ExceptionType } from '../../api/ExceptionType';
import { PyObject } from '../../api/Object';
import { getObjectUtils } from '../../api/ObjectUtils';
import { pyFunction } from '../../api/Decorators';
import { UniqueErrorCode } from '../../api/UniqueErrorCode';

export class IteratorObject extends PyObject {
  private index = 0;
  private iterableObject: IterableObject;
  public constructor(iterableObject: IterableObject) {
    super();
    this.iterableObject = iterableObject;
  }

  @pyFunction
  public __iter__(): IteratorObject {
    return this;
  }

  @pyFunction
  public __next__(): PyObject {
    if (this.index >= this.iterableObject.getCount()) {
      getObjectUtils().throwException(ExceptionType.StopIteration, UniqueErrorCode.IteratorFinished);
      /* istanbul ignore next */
      return;
    }
    return this.iterableObject.getItem(this.index++);
  }
}
