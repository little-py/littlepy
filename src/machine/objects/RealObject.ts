import { BaseObject } from './BaseObject';
import { ExceptionType } from '../../api/ExceptionType';
import { IntegerObject } from './IntegerObject';

export class RealObject extends BaseObject {
  public constructor(value: number) {
    super();
    this.value = value;
  }

  public static toReal(value: BaseObject, name = ''): number {
    if (!(value instanceof RealObject) && !(value instanceof IntegerObject)) {
      BaseObject.throwException(ExceptionType.TypeError, name);
      /* istanbul ignore next */
      return;
    }
    return value.value;
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
