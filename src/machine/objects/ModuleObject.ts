import { BaseObject } from './BaseObject';
import { ObjectType } from '../../api/ObjectType';

export class ModuleObject extends BaseObject {
  public constructor() {
    super(ObjectType.Module);
  }
  public name: string;
}
