import { ExceptionType } from '../../api/ExceptionType';
import { PyObject } from '../../api/Object';
import { getObjectUtils } from '../../api/ObjectUtils';
import { pyFunction, pyParam } from '../../api/Decorators';
import { UniqueErrorCode } from '../../api/UniqueErrorCode';

export class NumberObject extends PyObject {
  public constructor(value: number) {
    super();
    this.value = value;
  }

  equals(to: PyObject): boolean {
    if (to instanceof NumberObject) {
      return this.value === to.value;
    }
  }

  public toBoolean(): boolean {
    return this.value !== 0;
  }

  public toString(): string {
    return this.value.toString();
  }

  public readonly value: number;

  @pyFunction
  public bit_length(): void {
    getObjectUtils().throwException(ExceptionType.NotImplementedError, UniqueErrorCode.NotImplemented, 'bit_length');
  }

  @pyFunction
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public to_bytes(@pyParam('bytes') bytes: PyObject): void {
    getObjectUtils().throwException(ExceptionType.NotImplementedError, UniqueErrorCode.NotImplemented, 'to_bytes');
  }
}
