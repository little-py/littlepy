import { IntegerObject } from './IntegerObject';
import { RealObject } from './RealObject';
import { BaseObject } from './BaseObject';
import { NoneObject } from './NoneObject';
import { ObjectWrapperObject } from './ObjectWrapperObject';
import { StringObject } from './StringObject';
import { FunctionObject } from './FunctionObject';

export const fromBaseObject = (val: BaseObject, useObjectWrapper = true) => {
  if (val instanceof ObjectWrapperObject) {
    if (useObjectWrapper) {
      return val.object;
    }
  } else if (val instanceof StringObject) {
    return val.value;
  } else if (val instanceof IntegerObject) {
    return val.value;
  } else if (val instanceof RealObject) {
    return val.value;
  }
  return undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toBaseObject = (val: any, useObjectWrapper = true) => {
  if (val) {
    if (typeof val === 'function') {
      return new FunctionObject(null, val);
    } else if (typeof val === 'string') {
      return new StringObject(val);
    } else if (typeof val === 'number') {
      if (Math.floor(val) === val) {
        return new IntegerObject(val);
      } else {
        return new RealObject(val);
      }
    } else if (typeof val === 'object') {
      if (useObjectWrapper) {
        return new ObjectWrapperObject(val);
      }
    }
  }
  return new NoneObject();
};
