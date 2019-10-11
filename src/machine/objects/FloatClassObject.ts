import { ClassObject } from './ClassObject';
import { FunctionRunContext } from '../FunctionRunContext';
import { BaseObject } from './BaseObject';
import { ExceptionType } from '../../api/ExceptionType';
import { nativeFunction, param } from '../NativeTypes';

export class FloatClassObject extends ClassObject {
  public constructor(context: FunctionRunContext) {
    super(context, []);
  }

  @nativeFunction
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public fromhex(@param('bytes', BaseObject) bytes: BaseObject) {
    BaseObject.throwException(ExceptionType.NotImplementedError, 'fromhex');
  }
}
