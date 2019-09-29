import { IntegerObject } from './IntegerObject';
import { RealObject } from './RealObject';
import { FunctionObject } from './FunctionObject';
import { RunContext } from '../RunContext';
import { CallableContext } from '../CallableContext';
import { BaseObject, ObjectType } from './BaseObject';
import { NoneObject } from './NoneObject';
import { ObjectWrapperObject } from './ObjectWrapperObject';
import { StringObject } from './StringObject';

export const fromBaseObject = (val: BaseObject, useObjectWrapper = true) => {
  switch (val.type) {
    case ObjectType.ObjectWrapper:
      if (!useObjectWrapper) {
        break;
      }
      return (val as ObjectWrapperObject).object;
    case ObjectType.String:
      return (val as StringObject).value;
    case ObjectType.Integer:
      return (val as IntegerObject).value;
    case ObjectType.Real:
      return (val as RealObject).value;
  }
  return undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const toBaseObject = (val: any, useObjectWrapper = true) => {
  if (val) {
    if (typeof val === 'function') {
      const func = new FunctionObject();
      func.internalFunction = (runContext: RunContext, callContext: CallableContext, parent: BaseObject): BaseObject => {
        const args = callContext.indexedArgs.map(arg => fromBaseObject(arg));
        const ret = val.apply(parent ? fromBaseObject(parent) : undefined, args);
        return toBaseObject(ret);
      };
      return func;
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
