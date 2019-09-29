import { RunContext } from '../RunContext';
import { CallableContext } from '../CallableContext';
import { BaseObject, ObjectType } from '../objects/BaseObject';
import { ReferenceObject } from '../objects/ReferenceObject';
import { FunctionObject } from '../objects/FunctionObject';

function printFunction(runContext: RunContext, callContext: CallableContext): BaseObject {
  let output = '';
  for (let i = 0; i < callContext.indexedArgs.length; i++) {
    if (i > 0) {
      output += ' ';
    }
    let arg = callContext.indexedArgs[i];
    if (arg.type === ObjectType.Reference) {
      arg = (arg as ReferenceObject).getValue(runContext);
    }
    output += arg.toString();
  }
  if (callContext.namedArgs.end) {
    runContext.write(output);
    let end = callContext.namedArgs.end.toString();
    for (;;) {
      const returnPos = end.indexOf('\n');
      if (returnPos < 0) {
        break;
      }
      runContext.writeLine(output + end.substr(0, returnPos));
      end = end.substr(returnPos + 1);
    }
    if (end) {
      runContext.write(end);
    }
  } else {
    runContext.writeLine(output);
  }
  return null;
}

export function print() {
  const func = new FunctionObject();
  func.internalFunction = printFunction;
  return func;
}
