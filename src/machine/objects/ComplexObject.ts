import { CallableObject } from './CallableObject';
import { ObjectType } from '../../api/ObjectType';

export class ComplexObject extends CallableObject {
  public constructor() {
    super(ObjectType.Complex);
  }
}
