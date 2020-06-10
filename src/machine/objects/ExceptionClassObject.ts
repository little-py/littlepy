import { PyInheritance, PyClass } from '../../api/Class';
import { FunctionContext } from '../../api/FunctionContext';
import { ExceptionType } from '../../api/ExceptionType';
import { FunctionBody } from '../../api/FunctionBody';
import { PyModule } from '../../api/Module';

export class ExceptionClassObject extends PyClass {
  public constructor(
    body: FunctionBody,
    context: FunctionContext,
    public readonly exceptionType: ExceptionType,
    public readonly module: PyModule,
    public readonly row: number,
    public readonly column: number,
    inheritsFrom?: PyInheritance[],
  ) {
    super(body, context, inheritsFrom || []);
  }
}
