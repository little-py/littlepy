import { BaseObject } from './BaseObject';
import { RunContext } from '../RunContext';
import { StackEntry } from './StackEntry';
import { CallableContext } from '../CallableContext';

export class GeneratorObject extends BaseObject {
  public constructor(stackHead: StackEntry, stackTail: StackEntry) {
    super();
    this.stackHead = stackHead;
    this.stackTail = stackTail;
  }

  public readonly stackTail: StackEntry;
  public readonly stackHead: StackEntry;
  public pendingValue: BaseObject;
  public finished = false;

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native___iter__() {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native___next__(runContext: RunContext, callContext: CallableContext) {
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
    this.stackHead.onFinish = ret => callContext.onFinish(ret, null);
    runContext.setStackEntry(this.stackTail);
    return true;
  }
}
