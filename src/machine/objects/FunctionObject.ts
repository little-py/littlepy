import { CallableObject } from './CallableObject';
import { ObjectType } from './BaseObject';

export class FunctionObject extends CallableObject {
  public constructor() {
    super(ObjectType.Function);
  }
}
