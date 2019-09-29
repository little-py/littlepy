import { BaseObject, ObjectType } from './BaseObject';

export class ModuleObject extends BaseObject {
  public constructor() {
    super(ObjectType.Module);
  }
  public name: string;
}
