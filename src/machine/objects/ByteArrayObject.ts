import { CallableObject } from './CallableObject';
import { ObjectType } from '../../api/ObjectType';

export class ByteArrayObject extends CallableObject {
  public constructor() {
    super(ObjectType.ByteArray);
  }
}
