import { BaseObject } from './BaseObject';

export class NoneObject extends BaseObject {
  toBoolean(): boolean {
    return false;
  }
}
