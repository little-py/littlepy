import { BaseObject, ObjectType } from './BaseObject';
import { CallableObject } from './CallableObject';
import { ClassInstanceObject } from './ClassInstanceObject';

export class SuperProxyObject extends CallableObject {
  public readonly classInstance: ClassInstanceObject;
  public constructor(classInstance: ClassInstanceObject) {
    super(ObjectType.SuperProxy);
    this.classInstance = classInstance;
  }
  public getAttribute(name: string): BaseObject {
    for (let i = 1; i < this.classInstance.classInheritance.length; i++) {
      const ret = this.classInstance.classInheritance[i].object.getAttribute(name);
      if (ret) {
        return ret;
      }
    }
  }
}
