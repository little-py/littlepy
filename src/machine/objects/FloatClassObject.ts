import { FunctionContext } from '../../api/FunctionContext';
import { ExceptionType } from '../../api/ExceptionType';
import { PyObject } from '../../api/Object';
import { getObjectUtils } from '../../api/ObjectUtils';
import { pyFunction, pyParam } from '../../api/Decorators';
import { PyClass } from '../../api/Class';
import { PyFunction } from '../../api/Function';
import { UniqueErrorCode } from '../../api/UniqueErrorCode';

export class FloatClassObject extends PyClass {
  public constructor(body: PyFunction, context: FunctionContext) {
    super(body, context, []);
  }

  @pyFunction
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public fromhex(@pyParam('bytes') bytes: PyObject): void {
    getObjectUtils().throwException(ExceptionType.NotImplementedError, UniqueErrorCode.NotImplemented, 'fromhex');
  }
}
