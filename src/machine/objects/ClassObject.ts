import { CallableObject } from './CallableObject';
import { ObjectType } from '../../api/ObjectType';

export class ClassInheritance {
  public constructor(name, object) {
    this.name = name;
    this.object = object;
  }

  public readonly name: string;
  public readonly object: ClassObject;
}

export class ClassObject extends CallableObject {
  public constructor(inheritsFrom: ClassInheritance[], type: ObjectType = ObjectType.Class) {
    super(type);
    this.inheritsFrom = inheritsFrom;
  }

  public readonly inheritsFrom: ClassInheritance[];
}
