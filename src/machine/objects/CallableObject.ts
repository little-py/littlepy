import { FunctionRunContext } from '../FunctionRunContext';
import { RunContext } from '../RunContext';
import { CallableContext } from '../CallableContext';
import { StringObject } from './StringObject';
import { NativeFunction, NativeReturnType } from '../NativeTypes';
import { PyObject } from '../../api/Object';

export type InternalFunction = (runContext: RunContext, callContext: CallableContext, parent: PyObject, returnReg: number) => NativeReturnType;

export function callNativeFunction(func: Function, parent: PyObject): NativeReturnType {
  return func.apply(parent, []);
}

export class CallableObject extends PyObject {
  public constructor(context: FunctionRunContext = null, nativeFunction: Function = null, newNativeFunction: NativeFunction = null) {
    super();
    const doc = new StringObject((context && context.func && context.func.documentation) || '');
    this.setAttribute('__doc__', doc);
    this.context = context;
    this.nativeFunction = nativeFunction;
    this.newNativeFunction = newNativeFunction;
  }

  getAttribute(name: string): PyObject {
    if (name === '__name__') {
      return new StringObject(this.name);
    }
    return super.getAttribute(name);
  }

  public readonly context: FunctionRunContext;
  public readonly nativeFunction: Function;
  public readonly newNativeFunction: NativeFunction;
  public isCallable(): boolean {
    return true;
  }
}
