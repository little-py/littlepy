import { ExceptionType } from '../../api/ExceptionType';
import { PyObject } from '../../api/Object';
import { getObjectUtils } from '../../api/ObjectUtils';
import { pyFunction, pyParam } from '../../api/Decorators';

export class NumberObject extends PyObject {
  public constructor(value: number) {
    super();
    this.value = value;
  }

  public static toNumber(value: PyObject, name = ''): number {
    if (!(value instanceof NumberObject)) {
      getObjectUtils().throwException(ExceptionType.TypeError, name);
      /* istanbul ignore next */
      return;
    }
    return value.value;
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
  // eslint-disable-next-line @typescript-eslint/camelcase
  public bit_length() {
    getObjectUtils().throwException(ExceptionType.NotImplementedError, 'bit_length');
  }

  @pyFunction
  // eslint-disable-next-line @typescript-eslint/camelcase,@typescript-eslint/no-unused-vars
  public to_bytes(@pyParam('bytes', PyObject) bytes: PyObject) {
    getObjectUtils().throwException(ExceptionType.NotImplementedError, 'to_bytes');
  }
}
