import { FunctionContext } from './FunctionContext';
import { StringObject } from '../machine/objects/StringObject';
import { PyObject } from './Object';
import { PyFunction } from './Function';

export class Callable extends PyObject {
  public constructor(body: PyFunction = null, context: FunctionContext = null, nativeFunction: Function = null, newNativeFunction: Function = null) {
    super();
    const doc = new StringObject((body && body.documentation) || '');
    this.setAttribute('__doc__', doc);
    const name = new StringObject((body && body.name) || '');
    this.setAttribute('__name__', name);
    this.context = context;
    this.body = body;
    this.nativeFunction = nativeFunction;
    this.newNativeFunction = newNativeFunction;
  }

  public readonly context: FunctionContext;
  public readonly body: PyFunction;
  public readonly nativeFunction: Function;
  public readonly newNativeFunction: Function;
  public isCallable(): boolean {
    return true;
  }
}
