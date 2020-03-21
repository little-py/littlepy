import { FullCode } from './FullCode';

export interface PyFunction {
  readonly name: string;
  readonly documentation: string;
  code: FullCode;
}
