import { BaseObject } from './BaseObject';
import { IteratorObject } from './IteratorObject';

export abstract class IterableObject extends BaseObject {
  protected constructor() {
    super();
  }

  abstract getItem(index: number | string): BaseObject;
  abstract getCount(): number;

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native___iter__() {
    return new IteratorObject(this);
  }
}
