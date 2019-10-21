import { Callable } from './Callable';
import { FunctionContext } from './FunctionContext';
import { PyFunction } from './Function';

export class PyInheritance {
  public constructor(name, object) {
    this.name = name;
    this.object = object;
  }

  public readonly name: string;
  public readonly object: PyClass;
}

/* istanbul ignore next */
export class PyClass extends Callable {
  public constructor(body: PyFunction, context: FunctionContext, inheritsFrom: PyInheritance[], nativeConstructor: Function = null) {
    super(body, context, nativeConstructor);
    this.inheritsFrom = inheritsFrom;
  }

  public readonly inheritsFrom: PyInheritance[];

  public toString(): string {
    return `<class '${this.name}'>`;
  }
}
