import { FunctionBody } from '../common/FunctionBody';
import { Literal } from './Literal';
import { Token } from '../api/Token';
import { PyModule } from '../api/Module';
import { PyError } from '../api/Error';

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
