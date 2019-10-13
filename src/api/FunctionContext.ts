import { PyObject } from './Object';
import { PyScope } from './Scope';

export class FunctionContext {
  public scope: PyScope;
  public defaultValues: PyObject[];
}
