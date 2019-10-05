import { BaseObject } from './BaseObject';
import { ExceptionType } from '../../api/ExceptionType';

export class IntegerObject extends BaseObject {
  public constructor(value: number) {
    super();
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

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_bit_length() {
    BaseObject.throwException(ExceptionType.NotImplementedError, 'bit_length');
  }

  // eslint-disable-next-line @typescript-eslint/camelcase,@typescript-eslint/no-unused-vars
  public native_to_bytes(bytes: BaseObject) {
    BaseObject.throwException(ExceptionType.NotImplementedError, 'to_bytes');
  }
}
