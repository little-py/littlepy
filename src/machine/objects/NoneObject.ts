import { BaseObject, ObjectType } from './BaseObject';

export class NoneObject extends BaseObject {
  public constructor() {
    super(ObjectType.None);
  }
}
