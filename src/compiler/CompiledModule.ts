import { FunctionBody } from '../common/FunctionBody';
import { Literal } from './Literal';
import { Token } from './Token';
import { PyModule } from '../api/Module';
import { PyError } from '../api/Error';

export class CompiledModule implements PyModule {
  public tokens: Token[] = [];
  public readonly literals: Literal[] = [];
  public readonly identifiers: string[] = [];
  public readonly functions: FunctionBody[] = [];
  public name: string;
  public id: string;
  public readonly errors: PyError[] = [];
}
