import { BaseObject } from './BaseObject';
import { ObjectType } from '../../api/ObjectType';

export class RealObject extends BaseObject {
  public constructor(value: number) {
    super(ObjectType.Real);
    this.value = value;
  }

  public toBoolean(): boolean {
    return this.value !== 0;
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

  public canBeInteger(): boolean {
    return true;
  }

  public toInteger(): number {
    return Math.round(this.value);
  }

  public readonly value: number;
}
