import { PyInheritance, PyClass } from '../../api/Class';
import { FunctionRunContext } from '../FunctionRunContext';
import { ExceptionType } from '../../api/ExceptionType';

export class ExceptionClassObject extends PyClass {
  public constructor(context: FunctionRunContext, exceptionType: ExceptionType, inheritsFrom?: PyInheritance[]) {
    super(context, inheritsFrom || []);
    this.exceptionType = exceptionType;
  }

  public readonly exceptionType: ExceptionType;
}
