import { CallableObject } from './CallableObject';
import { ObjectType } from '../../api/ObjectType';

export class FrozenSetObject extends CallableObject {
  public constructor() {
    super(ObjectType.FrozenSet);
  }
}
