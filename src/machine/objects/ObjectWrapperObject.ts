import { BaseObject, ObjectType } from './BaseObject';
import { fromBaseObject, toBaseObject } from './ToBaseObject';

export class ObjectWrapperObject extends BaseObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public constructor(object: any) {
    super(ObjectType.ObjectWrapper);
    this.object = object;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public readonly object: any;

  public getAttribute(name: string): BaseObject {
    const val = this.object[name];
    return toBaseObject(val);
  }

  public setAttribute(name: string, value: BaseObject) {
    this.object[name] = fromBaseObject(value);
  }
}
