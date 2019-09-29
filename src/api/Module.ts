import { PyError } from './Error';
import { PyFunction } from './Function';

export interface PyModule {
  readonly name: string;
  readonly id: string;
  readonly errors: PyError[];
  readonly functions: PyFunction[];
}
