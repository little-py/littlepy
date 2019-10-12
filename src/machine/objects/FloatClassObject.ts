import { ClassObject } from './ClassObject';
import { FunctionRunContext } from '../FunctionRunContext';
import { ExceptionType } from '../../api/ExceptionType';
import { PyObject } from '../../api/Object';
import { getObjectUtils } from '../../api/ObjectUtils';
import { pyFunction, pyParam } from '../../api/Decorators';

export class FloatClassObject extends ClassObject {
  public constructor(context: FunctionRunContext) {
    super(context, []);
  }

  @pyFunction
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public fromhex(@pyParam('bytes', PyObject) bytes: PyObject) {
    getObjectUtils().throwException(ExceptionType.NotImplementedError, 'fromhex');
  }
}
