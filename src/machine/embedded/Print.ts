import { RunContext } from '../RunContext';
import { CallableContext } from '../CallableContext';
import { ReferenceObject } from '../objects/ReferenceObject';
import { CallableIgnore } from '../objects/CallableObject';

export function print(runContext: RunContext, callContext: CallableContext) {
  let output = '';
  for (let i = 0; i < callContext.indexedArgs.length; i++) {
    if (i > 0) {
      output += ' ';
    }
    let arg = callContext.indexedArgs[i];
    if (arg.object instanceof ReferenceObject) {
      arg = {
        object: arg.object.getValue(runContext),
        expand: arg.expand,
      };
    }
    output += arg.object.toString();
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
  return new CallableIgnore();
}
