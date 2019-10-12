import { PyObject } from './Object';
import { ExceptionType } from './ExceptionType';

export interface PyException extends PyObject {
  readonly exceptionType: ExceptionType;
  readonly message: string;
  readonly params: string[];
}
