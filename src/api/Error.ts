import { PyErrorType } from './ErrorType';
import { ErrorCodeToTitle } from '../common/PythonErrorType';

// eslint-disable-next-line @typescript-eslint/prefer-interface
export type PyErrorContext = { [key: string]: string };

export class PyError {
  public constructor(type: PyErrorType, row: number, col: number, length: number, position: number, context?: PyErrorContext) {
    this.type = type;
    this.row = row;
    this.col = col;
    this.length = length;
    this.position = position;
    this.context = context;
    this.prefix = ErrorCodeToTitle[this.type];
  }

  public prefix: string;
  public row: number;
  public col: number;
  public length: number;
  public position: number;
  public type: PyErrorType;
  public context: { [key: string]: string };
}
