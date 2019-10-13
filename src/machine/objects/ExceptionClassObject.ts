import { PyInheritance, PyClass } from '../../api/Class';
import { FunctionContext } from '../../api/FunctionContext';
import { ExceptionType } from '../../api/ExceptionType';
import { FunctionBody } from '../../common/FunctionBody';

export class ExceptionClassObject extends PyClass {
  public constructor(body: FunctionBody, context: FunctionContext, exceptionType: ExceptionType, inheritsFrom?: PyInheritance[]) {
    super(body, context, inheritsFrom || []);
    this.exceptionType = exceptionType;
  }

  public readonly exceptionType: ExceptionType;
}
