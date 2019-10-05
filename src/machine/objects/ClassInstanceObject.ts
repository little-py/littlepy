import { BaseObject } from './BaseObject';
import { ClassInheritance } from './ClassObject';
import { FunctionRunContext } from '../FunctionRunContext';

export class ClassInstanceObject extends BaseObject {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public constructor(classInheritance: ClassInheritance[], context: FunctionRunContext) {
    super();
    this.classInheritance = classInheritance;
  }
}
