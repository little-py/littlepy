import { BaseObject } from './BaseObject';
import { ObjectType } from '../../api/ObjectType';

export class BytesObject extends BaseObject {
  public constructor(value: string) {
    super(ObjectType.Bytes);
    this.value = value;
  }

  public value: string;
}
