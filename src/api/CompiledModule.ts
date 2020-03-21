import { FunctionBody } from './FunctionBody';
import { Literal } from './Literal';
import { Token } from './Token';
import { PyModule } from './Module';
import { PyError } from './Error';

/* istanbul ignore next */
export class CompiledModule extends PyModule {
  public tokens: Token[] = [];
  public readonly literals: Literal[] = [];
  public readonly identifiers: string[] = [];
  public readonly functions: FunctionBody[] = [];
  public name: string;
  public id: string;
  public readonly errors: PyError[] = [];
}
