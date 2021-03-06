/* eslint-disable @typescript-eslint/no-explicit-any */
import { PyObject } from '../../api/Object';
import { getObjectUtils } from '../../api/ObjectUtils';

export class ObjectWrapperObject extends PyObject {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public constructor(object: any) {
    super();
    this.object = object;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public readonly object: any;

  public getAttribute(name: string): PyObject {
    const val = this.object[name];
    return getObjectUtils().toPyObject(val, true);
  }

  public setAttribute(name: string, value: PyObject): void {
    this.object[name] = getObjectUtils().fromPyObject(value);
  }
}
