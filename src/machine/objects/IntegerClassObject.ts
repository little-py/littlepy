import { ClassObject } from './ClassObject';
import { FunctionRunContext } from '../FunctionRunContext';
import { ExceptionType } from '../../api/ExceptionType';
import { PyObject } from '../../api/Object';
import { getObjectUtils } from '../../api/ObjectUtils';
import { pyFunction, pyParam } from '../../api/Decorators';

export class IntegerClassObject extends ClassObject {
  public constructor(context: FunctionRunContext) {
    super(context, []);
  }

  @pyFunction
  // eslint-disable-next-line @typescript-eslint/camelcase,@typescript-eslint/no-unused-vars
  public from_bytes(@pyParam('bytes', PyObject) bytes: PyObject) {
    getObjectUtils().throwException(ExceptionType.NotImplementedError, 'from_bytes');
  }
}