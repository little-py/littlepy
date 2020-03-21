import { PyError } from './Error';
import { PyFunction } from './Function';
import { Token } from './Token';
import { Literal } from './Literal';

export abstract class PyModule {
  readonly name: string;
  id: string;
  readonly errors: PyError[];
  readonly functions: PyFunction[];
  readonly tokens: Token[];
  readonly literals: Literal[];
  readonly identifiers: string[];
}
