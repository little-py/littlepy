import { ClassObject } from './ClassObject';
import { FunctionRunContext } from '../FunctionRunContext';
import { BaseObject } from './BaseObject';
import { ExceptionType } from '../../api/ExceptionType';
import { nativeFunction, param } from '../NativeTypes';

export class IntegerClassObject extends ClassObject {
  public constructor(context: FunctionRunContext) {
    super(context, []);
  }

  @nativeFunction
  // eslint-disable-next-line @typescript-eslint/camelcase,@typescript-eslint/no-unused-vars
  public from_bytes(@param('bytes', BaseObject) bytes: BaseObject) {
    BaseObject.throwException(ExceptionType.NotImplementedError, 'from_bytes');
  }
}
