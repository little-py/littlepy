import { ObjectType } from './BaseObject';
import { CallableObject } from './CallableObject';

export class ComplexObject extends CallableObject {
  public constructor() {
    super(ObjectType.Complex);
  }
}
