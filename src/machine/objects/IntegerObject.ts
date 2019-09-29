import { BaseObject } from './BaseObject';
import { ObjectType } from '../../api/ObjectType';

export class IntegerObject extends BaseObject {
  public constructor(value: number) {
    super(ObjectType.Integer);
    this.value = value;
  }

  public toBoolean(): boolean {
    return this.value !== 0;
  }

  public canBeInteger(): boolean {
    return true;
  }

  public toInteger(): number {
    return this.value;
  }

  public toString(): string {
    return this.value.toString();
  }

  public canBeReal(): boolean {
    return true;
  }

  public toReal(): number {
    return this.value;
  }

  public readonly value: number;
}
