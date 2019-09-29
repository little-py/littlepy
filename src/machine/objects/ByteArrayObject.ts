import { ObjectType } from './BaseObject';
import { CallableObject } from './CallableObject';

export class ByteArrayObject extends CallableObject {
  public constructor() {
    super(ObjectType.ByteArray);
  }
}
