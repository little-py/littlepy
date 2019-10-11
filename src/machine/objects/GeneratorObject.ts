import { BaseObject } from './BaseObject';
import { RunContext } from '../RunContext';
import { StackEntry } from './StackEntry';
import { CallableContext } from '../CallableContext';
import { CallableIgnore, nativeFunction, param, RunContextBase } from '../NativeTypes';
import { ExceptionType } from '../../api/ExceptionType';

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

  @nativeFunction
  public __iter__() {
    return this;
  }

  @nativeFunction
  public __next__(@param('', RunContextBase) runContext: RunContext, @param('', CallableContext) callContext: CallableContext) {
    if (this.finished) {
      BaseObject.throwException(ExceptionType.StopIteration);
      /* istanbul ignore next */
      return;
    }
    if (this.pendingValue) {
      const ret = this.pendingValue;
      this.pendingValue = undefined;
      return ret;
    }
    this.stackHead.parent = runContext.getStackEntry();
    this.stackHead.onFinish = ret => callContext.onFinish(ret, null);
    runContext.setStackEntry(this.stackTail);
    return new CallableIgnore();
  }
}
