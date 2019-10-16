import { ObjectUtils } from '../api/ObjectUtils';
import { PyObject } from '../api/Object';
import { ExceptionType } from '../api/ExceptionType';
import { ExceptionObject } from './objects/ExceptionObject';
import { MemberWithMetadata, NativeProperty } from './NativeTypes';
import { nativeWrapper } from './embedded/NativeWrapper';
import { InstanceMethodObject } from './objects/InstanceMethodObject';
import { ListObject } from './objects/ListObject';
import { ObjectWrapperObject } from './objects/ObjectWrapperObject';
import { StringObject } from './objects/StringObject';
import { NumberObject } from './objects/NumberObject';
import { FunctionObject } from './objects/FunctionObject';
import { NoneObject } from './objects/NoneObject';
import { TupleObject } from './objects/TupleObject';
import { BooleanObject } from './objects/BooleanObject';
import { PropertyType } from '../api/Native';

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

  fromPyObject(val: PyObject) {
    if (val instanceof ObjectWrapperObject) {
      return val.object;
    } else if (val instanceof StringObject) {
      return val.value;
    } else if (val instanceof BooleanObject) {
      return val.toBoolean();
    } else if (val instanceof NumberObject) {
      return val.value;
    }
    return val;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toPyObject(val: any, useObjectWrapper) {
    if (val !== undefined) {
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
      } else if (typeof val === 'boolean') {
        return new BooleanObject(val);
      }

      if (val instanceof PyObject) {
        return val;
      }
    }
    return new NoneObject();
  }

  readNativeProperty(instance: PyObject, property: NativeProperty): PyObject {
    const value = property.getter.call(instance);
    switch (property.type) {
      case PropertyType.Boolean:
        if (typeof value !== 'boolean') {
          this.throwException(ExceptionType.TypeError);
        }
        return new BooleanObject(value);
      case PropertyType.Number:
        if (typeof value !== 'number') {
          this.throwException(ExceptionType.TypeError);
        }
        return new NumberObject(value);
      case PropertyType.String:
        if (typeof value !== 'string') {
          this.throwException(ExceptionType.TypeError);
        }
        return new StringObject(value);
      default:
        if (!(value instanceof PyObject)) {
          this.throwException(ExceptionType.TypeError);
        }
        return value;
    }
  }

  writeNativeProperty(instance: PyObject, property: NativeProperty, value: PyObject) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let newValue: any;
    switch (property.type) {
      case PropertyType.Boolean:
        if (!(value instanceof BooleanObject)) {
          this.throwException(ExceptionType.TypeError);
          return;
        }
        newValue = value.toBoolean();
        break;
      case PropertyType.String:
        if (!(value instanceof StringObject)) {
          this.throwException(ExceptionType.TypeError);
          return;
        }
        newValue = value.value;
        break;
      case PropertyType.Number:
        if (!(value instanceof NumberObject)) {
          this.throwException(ExceptionType.TypeError);
          return;
        }
        newValue = value.value;
        break;
      default:
        newValue = value;
        break;
    }
    property.setter.call(instance, newValue);
  }
}

export const objectUtils = new ObjectUtilsImpl();
