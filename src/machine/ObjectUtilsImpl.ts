import { ObjectUtils } from '../api/ObjectUtils';
import { PyObject } from '../api/Object';
import { ExceptionType } from '../api/ExceptionType';
import { ExceptionObject } from './objects/ExceptionObject';
import { MemberWithMetadata } from './NativeTypes';
import { nativeWrapper } from './embedded/NativeWrapper';
import { InstanceMethodObject } from './objects/InstanceMethodObject';
import { ListObject } from './objects/ListObject';
import { ObjectWrapperObject } from './objects/ObjectWrapperObject';
import { StringObject } from './objects/StringObject';
import { NumberObject } from './objects/NumberObject';
import { FunctionObject } from './objects/FunctionObject';
import { NoneObject } from './objects/NoneObject';
import { TupleObject } from './objects/TupleObject';

class ObjectUtilsImpl implements ObjectUtils {
  createList(items: PyObject[]): PyObject {
    return new ListObject(items);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createNativeMethod(func: Function, instance: any, name: string): PyObject {
    if (!func) {
      return null;
    }
    const method = func as MemberWithMetadata;
    if (!method.pythonMethod) {
      return null;
    }
    if (!method.pythonWrapper) {
      method.pythonWrapper = nativeWrapper(instance, method);
    }
    const ret = new InstanceMethodObject(null, null, null, method.pythonWrapper.bind(instance));
    ret.name = name;
    return ret;
  }

  createTuple(items: PyObject[]): PyObject {
    return new TupleObject(items);
  }

  throwException(type: ExceptionType, ...args: string[]): void {
    throw new ExceptionObject(type, [], ...args);
  }

  fromPyObject(val: PyObject, useObjectWrapper) {
    if (val instanceof ObjectWrapperObject) {
      if (useObjectWrapper) {
        return val.object;
      }
    } else if (val instanceof StringObject) {
      return val.value;
    } else if (val instanceof NumberObject) {
      return val.value;
    }
    return undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toPyObject(val: any, useObjectWrapper) {
    if (val) {
      if (typeof val === 'function') {
        return new FunctionObject(null, val);
      } else if (typeof val === 'string') {
        return new StringObject(val);
      } else if (typeof val === 'number') {
        if (Math.floor(val) === val) {
          return new NumberObject(val);
        } else {
          return new NumberObject(val);
        }
      } else if (typeof val === 'object') {
        if (useObjectWrapper) {
          return new ObjectWrapperObject(val);
        }
      }
    }
    return new NoneObject();
  }
}

export const objectUtils = new ObjectUtilsImpl();
