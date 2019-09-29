import { BaseObject } from './BaseObject';
import { ObjectType } from '../../api/ObjectType';

export class StringObject extends BaseObject {
  public constructor(value: string) {
    super(ObjectType.String);
    this.value = value;
  }

  public toBoolean(): boolean {
    return this.value && this.value.length > 0;
  }

  public toString(): string {
    return this.value;
  }

  public isContainer(): boolean {
    return true;
  }

  public contains(value: BaseObject): boolean {
    const substr = value.toString();
    return this.value.indexOf(substr) >= 0;
  }

  public readonly value: string;
}
