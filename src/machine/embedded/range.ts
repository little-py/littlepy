import { RunContext } from '../RunContext';
import { CallableContext } from '../CallableContext';
import { BaseObject } from '../objects/BaseObject';
import { ListObject } from '../objects/ListObject';
import { IntegerObject } from '../objects/IntegerObject';
import { FunctionObject } from '../objects/FunctionObject';

function rangeFunction(runContext: RunContext, callContext: CallableContext): BaseObject {
  let start: number;
  let end: number;
  let step = 1;
  if (callContext.indexedArgs.length === 1) {
    start = 0;
    end = callContext.indexedArgs[0].toInteger();
  } else if (callContext.indexedArgs.length === 2) {
    start = callContext.indexedArgs[0].toInteger();
    end = callContext.indexedArgs[1].toInteger();
  } else if (callContext.indexedArgs.length === 3) {
    start = callContext.indexedArgs[0].toInteger();
    end = callContext.indexedArgs[1].toInteger();
    step = callContext.indexedArgs[2].toInteger();
  } else {
    runContext.raiseFunctionArgumentCountMismatch();
    return runContext.getNoneObject();
  }
  if (step === 0) {
    runContext.raiseFunctionArgumentError();
    return runContext.getNoneObject();
  }
  // TODO: should be dynamically generated sequence
  const ret = new ListObject();
  if (step < 0) {
    for (let i = start; i > end; i += step) {
      ret.addItem(new IntegerObject(i));
    }
  } else {
    for (let i = start; i < end; i += step) {
      ret.addItem(new IntegerObject(i));
    }
  }
  return ret;
}

export function range() {
  const func = new FunctionObject();
  func.internalFunction = rangeFunction;
  return func;
}
