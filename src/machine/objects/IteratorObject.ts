import { BaseObject } from './BaseObject';
import { RunContext } from '../RunContext';
import { IterableObject } from './IterableObject';

export class IteratorObject extends BaseObject {
  private index = 0;
  private iterableObject: IterableObject;
  public constructor(iterableObject: IterableObject) {
    super();
    this.iterableObject = iterableObject;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native___iter__() {
    return this;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native___next__(runContext: RunContext) {
    if (this.index >= this.iterableObject.getCount()) {
      runContext.raiseStopIteration();
      return;
    }
    return this.iterableObject.getItem(this.index++);
  }
}
