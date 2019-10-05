import { ClassObject } from './ClassObject';
import { FunctionRunContext } from '../FunctionRunContext';
import { BaseObject } from './BaseObject';
import { ExceptionType } from '../../api/ExceptionType';

export class FloatClassObject extends ClassObject {
  public constructor(context: FunctionRunContext) {
    super(context, []);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase,@typescript-eslint/no-unused-vars
  public native_fromhex(bytes: BaseObject) {
    BaseObject.throwException(ExceptionType.NotImplementedError, 'fromhex');
  }
}
