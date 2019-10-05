import { ClassInheritance, ClassObject } from './ClassObject';
import { FunctionRunContext } from '../FunctionRunContext';
import { ExceptionType } from '../../api/ExceptionType';

export class ExceptionClassObject extends ClassObject {
  public constructor(context: FunctionRunContext, exceptionType: ExceptionType, inheritsFrom?: ClassInheritance[]) {
    super(context, inheritsFrom || []);
    this.exceptionType = exceptionType;
  }

  public readonly exceptionType: ExceptionType;
}
