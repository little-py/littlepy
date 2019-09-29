import { ErrorCodeToTitle, PythonErrorType } from './PythonErrorType';

// eslint-disable-next-line @typescript-eslint/prefer-interface
export type PythonErrorContext = { [key: string]: string };

export class PythonError {
  public constructor(type: PythonErrorType, row: number, col: number, length: number, position: number, context?: PythonErrorContext) {
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
  public type: PythonErrorType;
  public context: { [key: string]: string };
}
