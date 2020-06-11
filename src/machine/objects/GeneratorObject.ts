import { RunContext } from '../RunContext';
import { StackEntry } from '../StackEntry';
import { CallContext } from '../../api/CallContext';
import { CallableIgnore } from '../NativeTypes';
import { ExceptionType } from '../../api/ExceptionType';
import { PyObject } from '../../api/Object';
import { getObjectUtils } from '../../api/ObjectUtils';
import { pyFunction, pyParam } from '../../api/Decorators';
import { PropertyType } from '../../api/Native';
import { UniqueErrorCode } from '../../api/UniqueErrorCode';
import { IteratorObject } from './IteratorObject';

export class GeneratorObject extends IteratorObject {
  public constructor(stackHead: StackEntry, stackTail: StackEntry) {
    super(null);
    this.stackHead = stackHead;
    this.stackTail = stackTail;
  }

  public readonly stackTail: StackEntry;
  public readonly stackHead: StackEntry;
  public pendingValue: PyObject;
  public finished = false;

  @pyFunction
  public __iter__(): IteratorObject {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this;
  }

  @pyFunction
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  public __next__(
    @pyParam('', PropertyType.Machine) runContext: RunContext,
    @pyParam('', PropertyType.CallContext) callContext: CallContext,
  ): PyObject {
    if (this.finished) {
      getObjectUtils().throwException(ExceptionType.StopIteration, UniqueErrorCode.CalledNextOnFinishedIterator);
      /* istanbul ignore next */
      return undefined;
    }
    if (this.pendingValue) {
      const ret = this.pendingValue;
      this.pendingValue = undefined;
      return ret;
    }
    this.stackHead.parent = runContext.getStackEntry();
    this.stackHead.onFinish = (ret) => callContext.onFinish(ret, null);
    runContext.setStackEntry(this.stackTail);
    return new CallableIgnore();
  }
}
