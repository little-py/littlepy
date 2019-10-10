import { RunContext } from '../RunContext';
import { CallableContext } from '../CallableContext';
import { ExceptionObject } from '../objects/ExceptionObject';
import { ExceptionType } from '../../api/ExceptionType';
import { CallableIgnore } from '../NativeTypes';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function hash(runContext: RunContext, callContext: CallableContext) {
  runContext.raiseException(new ExceptionObject(ExceptionType.NotImplementedError, [], 'hash'));
  return new CallableIgnore();
}
