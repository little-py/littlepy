import { CallableObject } from './CallableObject';
import { ClassInstanceObject } from './ClassInstanceObject';
import { PyObject } from '../../api/Object';

export class SuperProxyObject extends CallableObject {
  public readonly classInstance: ClassInstanceObject;
  public constructor(classInstance: ClassInstanceObject) {
    super();
    this.classInstance = classInstance;
  }
  public getAttribute(name: string): PyObject {
    for (let i = 1; i < this.classInstance.classInheritance.length; i++) {
      const ret = this.classInstance.classInheritance[i].object.getAttribute(name);
      if (ret) {
        return ret;
      }
    }
  }
}
