import { ContainerObject } from '../objects/ContainerObject';
import { CallableIgnore, CallableObject } from '../objects/CallableObject';
import { RunContext } from '../RunContext';
import { CallableContext } from '../CallableContext';

export function len(runContext: RunContext, callContext: CallableContext) {
  if (callContext.indexedArgs.length !== 1) {
    runContext.raiseFunctionArgumentCountMismatch();
    return new CallableIgnore();
  }

  const argument = callContext.indexedArgs[0].object;

  if (argument instanceof ContainerObject) {
    return argument.getCount();
  }
  const len = argument.getAttribute('__len__');
  if (!len || !(len instanceof CallableObject)) {
    runContext.raiseTypeConversion();
  } else {
    callContext.indexedArgs = [];
    runContext.callFunction(len, argument, (ret, exception) => {
      callContext.onFinish(ret, exception);
    });
  }
  return new CallableIgnore();
}
