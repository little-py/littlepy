import { BaseObject } from './BaseObject';
import { ObjectType } from '../../api/ObjectType';

export class NoneObject extends BaseObject {
  public constructor() {
    super(ObjectType.None);
  }
}
