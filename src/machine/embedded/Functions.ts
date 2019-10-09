import { BaseObject } from '../objects/BaseObject';
import { ExceptionObject } from '../objects/ExceptionObject';
import { ExceptionType } from '../../api/ExceptionType';
import { RealObject } from '../objects/RealObject';
import { IntegerObject } from '../objects/IntegerObject';
import { IterableObject } from '../objects/IterableObject';
import { BooleanObject } from '../objects/BooleanObject';
import { StringObject } from '../objects/StringObject';
import { CallableContext } from '../CallableContext';

export const exportedFunctions = {
  abs: function(x: BaseObject) {
    if (x instanceof IntegerObject) {
      return new IntegerObject(Math.abs(x.value));
    }
    if (!x.canBeReal()) {
      throw new ExceptionObject(ExceptionType.TypeError, [], 'x');
    }
    return new RealObject(Math.abs(x.toReal()));
  },
  all: function(x: BaseObject) {
    if (!(x instanceof IterableObject)) {
      throw new ExceptionObject(ExceptionType.ValueError);
    }
    let ret = true;
    for (let i = 0; i < x.getCount(); i++) {
      if (!x.getItem(i).toBoolean()) {
        ret = false;
        break;
      }
    }
    return new BooleanObject(ret);
  },
  any: function(x: BaseObject) {
    if (!(x instanceof IterableObject)) {
      throw new ExceptionObject(ExceptionType.ValueError);
    }
    let ret = false;
    for (let i = 0; i < x.getCount(); i++) {
      if (x.getItem(i).toBoolean()) {
        ret = true;
        break;
      }
    }
    return new BooleanObject(ret);
  },
  chr: function(x: BaseObject) {
    if (!x.canBeInteger()) {
      throw new ExceptionObject(ExceptionType.ValueError);
    }
    return new StringObject(String.fromCharCode(x.toInteger()));
  },
  min: function(callContext: CallableContext) {
    if (callContext.indexedArgs.length === 0) {
      throw new ExceptionObject(ExceptionType.ValueError);
    }
    let ret = callContext.indexedArgs[0].object.toReal();
    for (let i = 1; i < callContext.indexedArgs.length; i++) {
      const next = callContext.indexedArgs[i].object.toReal();
      if (next < ret) {
        ret = next;
      }
    }
    return new RealObject(ret);
  },
  max: function(callContext: CallableContext) {
    if (callContext.indexedArgs.length === 0) {
      throw new ExceptionObject(ExceptionType.ValueError);
    }
    let ret = callContext.indexedArgs[0].object.toReal();
    for (let i = 1; i < callContext.indexedArgs.length; i++) {
      const next = callContext.indexedArgs[i].object.toReal();
      if (next > ret) {
        ret = next;
      }
    }
    return new RealObject(ret);
  },
  sum: function(callContext: CallableContext) {
    if (callContext.indexedArgs.length === 0) {
      throw new ExceptionObject(ExceptionType.ValueError);
    }
    let ret = 0;
    for (let i = 0; i < callContext.indexedArgs.length; i++) {
      const next = callContext.indexedArgs[i].object.toReal();
      ret += next;
    }
    return new RealObject(ret);
  },
};
