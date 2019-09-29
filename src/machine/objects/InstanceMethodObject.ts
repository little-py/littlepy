import { CallableObject } from './CallableObject';
import { ObjectType } from '../../api/ObjectType';

export class InstanceMethodObject extends CallableObject {
  public constructor() {
    super(ObjectType.InstanceMethod);
  }
}
