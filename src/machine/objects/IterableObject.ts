import { IteratorObject } from './IteratorObject';
import { ExceptionType } from '../../api/ExceptionType';
import { PyObject } from '../../api/Object';
import { getObjectUtils } from '../../api/ObjectUtils';
import { NumberObject } from './NumberObject';
import { pyFunction, pyParam } from '../../api/Decorators';

export abstract class IterableObject extends PyObject {
  protected constructor() {
    super();
  }

  abstract getItem(index: number | string): PyObject;
  abstract getCount(): number;

  @pyFunction
  public __iter__() {
    return new IteratorObject(this);
  }

  @pyFunction
  public index(
    @pyParam('element', PyObject) element: PyObject,
    @pyParam('start', NumberObject, 0) start: number,
    @pyParam('end', NumberObject, -1) end: number,
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
    getObjectUtils().throwException(ExceptionType.ValueError, 'cannot find element');
  }
}