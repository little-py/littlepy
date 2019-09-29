import { BaseObject } from './BaseObject';
import { CallableObject } from './CallableObject';
import { ClassInheritance } from './ClassObject';
import { ObjectType } from '../../api/ObjectType';

export class ClassInstanceObject extends CallableObject {
  public readonly classInheritance: ClassInheritance[];

  public getAttribute(name: string): BaseObject {
    let ret = this.attributes[name];
    if (ret) {
      return ret;
    }
    for (const { object } of this.classInheritance) {
      ret = object.getAttribute(name);
      if (ret) {
        return ret;
      }
    }
  }

  public constructor(classInheritance: ClassInheritance[], type: ObjectType = ObjectType.ClassInstance) {
    super(type);
    this.classInheritance = classInheritance;
  }
}
