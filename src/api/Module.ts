import { PyError } from './Error';
import { PyFunction } from './Function';
import { Token } from './Token';

export abstract class PyModule {
  readonly name: string;
  id: string;
  readonly errors: PyError[];
  readonly functions: PyFunction[];
  readonly tokens: Token[];
}
