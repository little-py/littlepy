import { ClassInheritance } from './ClassObject';
import { FunctionRunContext } from '../FunctionRunContext';
import { PyObject } from '../../api/Object';

export class ClassInstanceObject extends PyObject {
  public readonly classInheritance: ClassInheritance[];

  public getAttribute(name: string): PyObject {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public constructor(classInheritance: ClassInheritance[], context: FunctionRunContext) {
    super();
    if (classInheritance.length) {
      this.classInheritance = classInheritance;
    }
  }
}
