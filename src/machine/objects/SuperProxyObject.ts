import { CallableObject } from './CallableObject';
import { PyObject } from '../../api/Object';
import { PyClassInstance } from '../../api/Instance';

export class SuperProxyObject extends CallableObject {
  public readonly classInstance: PyClassInstance;
  public constructor(classInstance: PyClassInstance) {
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
