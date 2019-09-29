import { CallableObject } from './CallableObject';
import { ObjectType } from '../../api/ObjectType';

export class FunctionObject extends CallableObject {
  public constructor() {
    super(ObjectType.Function);
  }
}
