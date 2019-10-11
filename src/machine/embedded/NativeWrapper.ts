import { CallableContext } from '../CallableContext';
import { CallableIgnore, MemberWithMetadata, NativeFinishCallback, NativeParam, RunContextBase } from '../NativeTypes';
import { BaseObject } from '../objects/BaseObject';
import { ExceptionObject } from '../objects/ExceptionObject';
import { ExceptionType } from '../../api/ExceptionType';
import { IntegerObject } from '../objects/IntegerObject';
import { RealObject } from '../objects/RealObject';
import { StringObject } from '../objects/StringObject';
import { BooleanObject } from '../objects/BooleanObject';
import { ListObject } from '../objects/ListObject';
import { DictionaryObject } from '../objects/DictionaryObject';
import { TupleObject } from '../objects/TupleObject';
import { IterableObject } from '../objects/IterableObject';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function nativeWrapper(instance: any, member: MemberWithMetadata) {
  return function(callContext: CallableContext, runContext: RunContextBase) {
    let ignoreParams = false;
    let hasCallback = false;
    try {
      const params = member.pythonParams || [];
      const args = (params || []).map(({ name, type, defaultValue, isCallback, args, kwargs }: NativeParam, index: number):
        | number
        | string
        | boolean
        | BaseObject
        | NativeFinishCallback
        | CallableContext
        | BaseObject[]
        | { [key: string]: BaseObject }
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
        if (type === CallableContext) {
          ignoreParams = true;
          return callContext;
        }
        if (type === RunContextBase) {
          return runContext;
        }
        let sourceArg: BaseObject;
        if (callContext.indexedArgs.length > index) {
          sourceArg = callContext.indexedArgs[index].object;
        } else {
          sourceArg = callContext.namedArgs[name];
          if (!sourceArg) {
            if (defaultValue !== undefined) {
              return defaultValue;
            }
            throw new ExceptionObject(ExceptionType.FunctionArgumentError, [], name);
          }
        }
        if (type === IntegerObject) {
          return IntegerObject.toInteger(sourceArg, name);
        }
        if (type === RealObject) {
          return RealObject.toReal(sourceArg, name);
        }
        if (type === StringObject) {
          return StringObject.toString(sourceArg, name);
        }
        if (type === BooleanObject) {
          if (!(sourceArg instanceof BooleanObject)) {
            throw new ExceptionObject(ExceptionType.TypeError, [], name);
          }
          return sourceArg.value !== 0;
        }
        if (type === ListObject) {
          if (!(sourceArg instanceof ListObject)) {
            throw new ExceptionObject(ExceptionType.TypeError, [], name);
          }
        } else if (type === DictionaryObject) {
          if (!(sourceArg instanceof DictionaryObject)) {
            throw new ExceptionObject(ExceptionType.TypeError, [], name);
          }
        } else if (type === TupleObject) {
          if (!(sourceArg instanceof TupleObject)) {
            throw new ExceptionObject(ExceptionType.TypeError, [], name);
          }
        } else if (type === IterableObject) {
          if (!(sourceArg instanceof IterableObject)) {
            throw new ExceptionObject(ExceptionType.TypeError, [], name);
          }
        }
        return sourceArg;
      });
      if (!ignoreParams) {
        if (args.length < callContext.indexedArgs.length) {
          runContext.raiseException(new ExceptionObject(ExceptionType.FunctionArgumentCountMismatch));
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
        //console.log('Native function error!', err);
        runContext.raiseException(new ExceptionObject(ExceptionType.SystemError));
      }
      return true;
    }
  };
}
