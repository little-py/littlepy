import { CallContext } from '../../api/CallContext';
import { CallableIgnore, MemberWithMetadata, NativeFinishCallback, NativeParam, RunContextBase } from '../NativeTypes';
import { ExceptionObject } from '../objects/ExceptionObject';
import { ExceptionType } from '../../api/ExceptionType';
import { NumberObject } from '../objects/NumberObject';
import { StringObject } from '../objects/StringObject';
import { BooleanObject } from '../objects/BooleanObject';
import { ListObject } from '../objects/ListObject';
import { DictionaryObject } from '../objects/DictionaryObject';
import { TupleObject } from '../objects/TupleObject';
import { IterableObject } from '../objects/IterableObject';
import { PyObject } from '../../api/Object';
import { PropertyType } from '../../api/Native';
import { getObjectUtils } from '../../api/ObjectUtils';
import { UniqueErrorCode } from '../../api/UniqueErrorCode';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function nativeWrapper(instance: any, member: MemberWithMetadata) {
  function wrapper(callContext: CallContext, runContext: RunContextBase) {
    let ignoreParams = false;
    let hasCallback = false;
    const params = member.pythonParams || [];
    try {
      const args = (params || []).map(({ name, type, defaultValue, isCallback, args, kwargs }: NativeParam, index: number):
        | number
        | string
        | boolean
        | PyObject
        | NativeFinishCallback
        | CallContext
        | PyObject[]
        | { [key: string]: PyObject }
        | RunContextBase => {
        if (isCallback) {
          hasCallback = true;
          return callContext.onFinish;
        }
        if (args) {
          ignoreParams = true;
          return callContext.indexedArgs.map(a => a.object);
        }
        if (kwargs) {
          return callContext.namedArgs;
        }
        if (type === PropertyType.CallContext) {
          ignoreParams = true;
          return callContext;
        }
        if (type === PropertyType.Machine) {
          return runContext;
        }
        let sourceArg: PyObject;
        if (callContext.indexedArgs.length > index) {
          sourceArg = callContext.indexedArgs[index].object;
        } else {
          sourceArg = callContext.namedArgs[name];
          if (!sourceArg) {
            if (defaultValue !== undefined) {
              return defaultValue;
            }
            throw new ExceptionObject(ExceptionType.FunctionArgumentError, UniqueErrorCode.RequiredArgumentIsMissing, [], name);
          }
        }
        if (type === PropertyType.Number) {
          return getObjectUtils().toNumber(sourceArg, name);
        }
        if (type === PropertyType.String) {
          return getObjectUtils().toString(sourceArg, name);
        }
        if (type === PropertyType.Boolean) {
          if (!(sourceArg instanceof BooleanObject)) {
            throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedBooleanObject, [], name);
          }
          return sourceArg.value !== 0;
        }
        if (type === PropertyType.List) {
          if (!(sourceArg instanceof ListObject)) {
            throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedListObject, [], name);
          }
        } else if (type === PropertyType.Dictionary) {
          if (!(sourceArg instanceof DictionaryObject)) {
            throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedDictionaryObject, [], name);
          }
        } else if (type === PropertyType.Tuple) {
          if (!(sourceArg instanceof TupleObject)) {
            throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedTupleObject, [], name);
          }
        } else if (type === PropertyType.Iterable) {
          if (!(sourceArg instanceof IterableObject)) {
            throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedIterableObject, [], name);
          }
        }
        return sourceArg;
      });
      if (!ignoreParams) {
        if (args.length < callContext.indexedArgs.length) {
          runContext.raiseException(new ExceptionObject(ExceptionType.FunctionArgumentCountMismatch, UniqueErrorCode.FunctionTooManyArguments));
          return true;
        }
      }
      const ret = member.apply(this, args);
      if (hasCallback) {
        return true;
      }
      if (ret === undefined) {
        return runContext.getNoneObject();
      }
      if (ret instanceof CallableIgnore) {
        return true;
      }
      switch (typeof ret) {
        case 'number':
          return new NumberObject(ret);
        case 'string':
          return new StringObject(ret);
        case 'boolean':
          return BooleanObject.toBoolean(ret);
        default:
          if (!(ret instanceof PyObject)) {
            runContext.raiseException(new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedPythonObject));
          } else {
            return ret;
          }
      }
    } catch (err) {
      if (err instanceof ExceptionObject) {
        runContext.raiseException(err);
      } else {
        //console.log('Native function error!', err);
        runContext.raiseException(new ExceptionObject(ExceptionType.SystemError, UniqueErrorCode.UnexpectedJsException));
      }
      return true;
    }
  }
  return wrapper;
}
