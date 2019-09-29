import { ClassInheritance, ClassObject } from './ClassObject';
import { ExceptionType } from './ExceptionObject';
import { ObjectType } from './BaseObject';

export class ExceptionClassObject extends ClassObject {
  public constructor(exceptionType: ExceptionType, inheritsFrom?: ClassInheritance[]) {
    super(inheritsFrom || [], ObjectType.ExceptionClass);
    this.exceptionType = exceptionType;
  }

  public readonly exceptionType: ExceptionType;
}
