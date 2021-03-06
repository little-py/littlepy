import { FunctionContext } from './FunctionContext';
import { StringObject } from '../machine/objects/StringObject';
import { PyObject } from './Object';
import { PyFunction } from './Function';

export class Callable extends PyObject {
  // eslint-disable-next-line @typescript-eslint/ban-types
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
  // eslint-disable-next-line @typescript-eslint/ban-types
  public readonly nativeFunction: Function;
  // eslint-disable-next-line @typescript-eslint/ban-types
  public readonly newNativeFunction: Function;

  /* istanbul ignore next */
  public isCallable(): boolean {
    return true;
  }
}
