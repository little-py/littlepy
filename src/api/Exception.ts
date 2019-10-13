import { ExceptionType } from './ExceptionType';
import { PyClassInstance } from './Instance';

export abstract class PyException extends PyClassInstance {
  readonly exceptionType: ExceptionType;
  readonly message: string;
  readonly params: string[];
}
