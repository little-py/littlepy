import { PyInheritance, PyClass } from '../../api/Class';
import { FunctionContext } from '../../api/FunctionContext';
import { ExceptionType } from '../../api/ExceptionType';
import { FunctionBody } from '../../api/FunctionBody';

export class ExceptionClassObject extends PyClass {
  public constructor(body: FunctionBody, context: FunctionContext, public readonly exceptionType: ExceptionType, inheritsFrom?: PyInheritance[]) {
    super(body, context, inheritsFrom || []);
  }
}
