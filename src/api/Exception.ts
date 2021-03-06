import { ExceptionType } from './ExceptionType';
import { PyClassInstance } from './Instance';
import { UniqueErrorCode } from './UniqueErrorCode';
import { PyModule } from './Module';

export abstract class PyException extends PyClassInstance {
  readonly exceptionType: ExceptionType;
  readonly message: string;
  readonly params: string[];
  readonly uniqueError: UniqueErrorCode;
  readonly module: PyModule;
  readonly column: number;
  readonly row: number;
}
