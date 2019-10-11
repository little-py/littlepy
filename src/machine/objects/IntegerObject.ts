import { BaseObject } from './BaseObject';
import { ExceptionType } from '../../api/ExceptionType';
import { nativeFunction, param } from '../NativeTypes';

export class IntegerObject extends BaseObject {
  public constructor(value: number) {
    super();
    this.value = value;
  }

  public static toInteger(value: BaseObject, name: string): number {
    if (!(value instanceof IntegerObject)) {
      BaseObject.throwException(ExceptionType.TypeError, name);
      /* istanbul ignore next */
      return;
    }
    return value.value;
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

  @nativeFunction
  // eslint-disable-next-line @typescript-eslint/camelcase
  public bit_length() {
    BaseObject.throwException(ExceptionType.NotImplementedError, 'bit_length');
  }

  @nativeFunction
  // eslint-disable-next-line @typescript-eslint/camelcase,@typescript-eslint/no-unused-vars
  public to_bytes(@param('bytes', BaseObject) bytes: BaseObject) {
    BaseObject.throwException(ExceptionType.NotImplementedError, 'to_bytes');
  }
}
