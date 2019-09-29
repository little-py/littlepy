import { BaseObject, ObjectType } from './BaseObject';
import { RunContext } from '../RunContext';
import { StackEntry } from './StackEntry';
import { FunctionObject } from './FunctionObject';
import { CallableContext } from '../CallableContext';

export class GeneratorObject extends BaseObject {
  public constructor() {
    super(ObjectType.Generator);
    const iter = new FunctionObject();
    iter.internalFunction = () => this;
    this.setAttribute('__iter__', iter);
    const next = new FunctionObject();
    next.internalFunction = (runContext: RunContext, callContext: CallableContext, parent: BaseObject, returnReg: number) => {
      if (this.finished) {
        runContext.raiseStopIteration();
        return true;
      }
      if (this.pendingValue) {
        const ret = this.pendingValue;
        this.pendingValue = undefined;
        return ret;
      }
      this.stackHead.parent = runContext.getStackEntry();
      this.stackHead.returnReg = returnReg;
      runContext.setStackEntry(this.stackTail);
      return true;
    };
    this.setAttribute('__next__', next);
  }

  public stackTail: StackEntry;
  public stackHead: StackEntry;
  public pendingValue: BaseObject;
  public finished = false;
}
