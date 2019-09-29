import { ObjectType } from './BaseObject';
import { CallableObject } from './CallableObject';

export class FrozenSetObject extends CallableObject {
  public constructor() {
    super(ObjectType.FrozenSet);
  }
}
