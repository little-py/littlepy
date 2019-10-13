import { PyInheritance } from './Class';
import { FunctionRunContext } from '../machine/FunctionRunContext';
import { PyObject } from './Object';

export class PyClassInstance extends PyObject {
  public readonly classInheritance: PyInheritance[];

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
  public constructor(classInheritance: PyInheritance[], context: FunctionRunContext) {
    super();
    if (classInheritance.length) {
      this.classInheritance = classInheritance;
    }
  }
}
