import { CallableObject } from './CallableObject';
import { FunctionRunContext } from '../FunctionRunContext';

export class ClassInheritance {
  public constructor(name, object) {
    this.name = name;
    this.object = object;
  }

  public readonly name: string;
  public readonly object: ClassObject;
}

export class ClassObject extends CallableObject {
  public constructor(context: FunctionRunContext, inheritsFrom: ClassInheritance[]) {
    super();
    this.inheritsFrom = inheritsFrom;
  }

  public readonly inheritsFrom: ClassInheritance[];

  public toString(): string {
    return `<class '${this.name}'>`;
  }
}
