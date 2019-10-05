import { ClassObject } from './ClassObject';
import { FunctionRunContext } from '../FunctionRunContext';
import { BaseObject } from './BaseObject';
import { ExceptionType } from '../../api/ExceptionType';

export class IntegerClassObject extends ClassObject {
  public constructor(context: FunctionRunContext) {
    super(context, []);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase,@typescript-eslint/no-unused-vars
  public native_from_bytes(bytes: BaseObject) {
    BaseObject.throwException(ExceptionType.NotImplementedError, 'from_bytes');
  }
}
