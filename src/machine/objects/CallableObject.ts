import { BaseObject } from './BaseObject';
import { FunctionRunContext } from '../FunctionRunContext';
import { RunContext } from '../RunContext';
import { CallableContext } from '../CallableContext';

export class CallableObject extends BaseObject {
  public context: FunctionRunContext;
  public internalFunction: (runContext: RunContext, callContext: CallableContext, parent: BaseObject, returnReg: number) => BaseObject | void | boolean;
  public isCallable(): boolean {
    return true;
  }
}
