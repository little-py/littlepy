import { BaseObject, ObjectType } from './BaseObject';

export class BytesObject extends BaseObject {
  public constructor(value: string) {
    super(ObjectType.Bytes);
    this.value = value;
  }

  public value: string;
}
