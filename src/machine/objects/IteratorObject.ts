import { BaseObject, ObjectType } from './BaseObject';
import { FunctionObject } from './FunctionObject';
import { RunContext } from '../RunContext';

export class IteratorObject extends BaseObject {
  private index = 0;
  private iterableObject: BaseObject;
  public constructor(iterableObject: BaseObject) {
    super(ObjectType.Iterator);
    this.iterableObject = iterableObject;
    const iter = new FunctionObject();
    iter.internalFunction = () => this;
    this.setAttribute('__iter__', iter);
    const next = new FunctionObject();
    next.internalFunction = (runContext: RunContext) => {
      if (!this.iterableObject.isContainer() || this.index >= this.iterableObject.count()) {
        runContext.raiseStopIteration();
        return;
      }
      return this.iterableObject.getItem(this.index++);
    };
    this.setAttribute('__next__', next);
  }
}

export function setIteratorFunction(obj: BaseObject) {
  const iter = new FunctionObject();
  iter.internalFunction = () => new IteratorObject(obj);
  obj.setAttribute('__iter__', iter);
}
