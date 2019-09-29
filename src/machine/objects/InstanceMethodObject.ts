import { ObjectType } from './BaseObject';
import { CallableObject } from './CallableObject';

export class InstanceMethodObject extends CallableObject {
  public constructor() {
    super(ObjectType.InstanceMethod);
  }
}
