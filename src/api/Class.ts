import { CallableObject } from '../machine/objects/CallableObject';
import { FunctionRunContext } from '../machine/FunctionRunContext';

export class PyInheritance {
  public constructor(name, object) {
    this.name = name;
    this.object = object;
  }

  public readonly name: string;
  public readonly object: PyClass;
}

export class PyClass extends CallableObject {
  public constructor(context: FunctionRunContext, inheritsFrom: PyInheritance[], nativeConstructor: Function = null) {
    super(context, nativeConstructor);
    this.inheritsFrom = inheritsFrom;
  }

  public readonly inheritsFrom: PyInheritance[];

  public toString(): string {
    return `<class '${this.name}'>`;
  }
}
