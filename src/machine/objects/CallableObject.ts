import { BaseObject } from './BaseObject';
import { FunctionRunContext } from '../FunctionRunContext';
import { RunContext } from '../RunContext';
import { CallableContext } from '../CallableContext';
import { StringObject } from './StringObject';
import { RealObject } from './RealObject';
import { BooleanObject } from './BooleanObject';
import { ExceptionObject } from './ExceptionObject';
import { ExceptionType } from '../../api/ExceptionType';

export class CallableIgnore {}

export type NativeReturnType = BaseObject | void | boolean;
export type InternalFunction = (runContext: RunContext, callContext: CallableContext, parent: BaseObject, returnReg: number) => NativeReturnType;

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm;
const ARGUMENT_NAMES = /([^\s,]+)/g;

function getParamNames(func: Function): string[] {
  const signature = func.toString();
  const fnStr = signature.replace(STRIP_COMMENTS, '');
  return fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES) || [];
}

export function callNativeFunction(func: Function, runContext: RunContext, callContext: CallableContext, parent: BaseObject): NativeReturnType {
  const names = getParamNames(func);
  const args = new Array(Math.max(names.length));
  const runContextIndex = names.findIndex(t => t === 'runContext');
  if (runContextIndex >= 0) {
    args[runContextIndex] = runContext;
  }
  const callContextIndex = names.findIndex(t => t === 'callContext');
  if (callContextIndex >= 0) {
    args[callContextIndex] = callContext;
  } else {
    for (let i = 0; i < callContext.indexedArgs.length; i++) {
      if (i >= args.length) {
        runContext.raiseException(new ExceptionObject(ExceptionType.FunctionArgumentCountMismatch));
        return true;
      }
      args[i] = callContext.indexedArgs[i].object;
    }
    for (const key of Object.keys(callContext.namedArgs)) {
      const i = names.findIndex(t => t === key);
      if (i >= 0) {
        args[i] = callContext.namedArgs[key];
      }
    }
  }
  try {
    const ret = func.apply(parent, args);
    if (ret === undefined) {
      return ret;
    }
    if (ret instanceof CallableIgnore) {
      return true;
    }
    switch (typeof ret) {
      case 'number':
        return new RealObject(ret);
      case 'string':
        return new StringObject(ret);
      case 'boolean':
        return new BooleanObject(ret ? 1 : 0);
      default:
        if (!(ret instanceof BaseObject)) {
          runContext.raiseException(new ExceptionObject(ExceptionType.TypeError));
        } else {
          return ret;
        }
    }
  } catch (err) {
    if (err instanceof ExceptionObject) {
      runContext.raiseException(err);
    } else {
      console.log('Callable function error!', err);
      runContext.raiseException(new ExceptionObject(ExceptionType.SystemError));
    }
    return true;
  }
}

export class CallableObject extends BaseObject {
  public constructor(context: FunctionRunContext = null, nativeFunction: Function = null) {
    super();
    const doc = new StringObject((context && context.func && context.func.documentation) || '');
    this.setAttribute('__doc__', doc);
    this.context = context;
    this.nativeFunction = nativeFunction;
  }

  getAttribute(name: string): BaseObject {
    if (name === '__name__') {
      return new StringObject(this.name);
    }
    return super.getAttribute(name);
  }

  public readonly context: FunctionRunContext;
  public readonly nativeFunction: Function;
  public isCallable(): boolean {
    return true;
  }
}
