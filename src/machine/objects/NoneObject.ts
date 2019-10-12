import { PyObject } from '../../api/Object';

export class NoneObject extends PyObject {
  toBoolean(): boolean {
    return false;
  }
}
