import { RunContext } from '../RunContext';
import { StackEntry } from '../StackEntry';
import { CallContext } from '../../api/CallContext';
import { CallableIgnore } from '../NativeTypes';
import { ExceptionType } from '../../api/ExceptionType';
import { PyObject } from '../../api/Object';
import { getObjectUtils } from '../../api/ObjectUtils';
import { pyFunction, pyParam } from '../../api/Decorators';
import { PropertyType } from '../../api/Native';

export class GeneratorObject extends PyObject {
  public constructor(stackHead: StackEntry, stackTail: StackEntry) {
    super();
    this.stackHead = stackHead;
    this.stackTail = stackTail;
  }

  public readonly stackTail: StackEntry;
  public readonly stackHead: StackEntry;
  public pendingValue: PyObject;
  public finished = false;

  @pyFunction
  public __iter__() {
    return this;
  }

  @pyFunction
  public __next__(@pyParam('', PropertyType.Machine) runContext: RunContext, @pyParam('', PropertyType.CallContext) callContext: CallContext) {
    if (this.finished) {
      getObjectUtils().throwException(ExceptionType.StopIteration);
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
