import { FunctionBody } from '../common/FunctionBody';
import { Literal } from './Literal';
import { PythonError } from '../common/PythonError';
import { Token } from './Token';

export class CompiledModule {
  public readonly tokens: Token[] = [];
  public readonly literals: Literal[] = [];
  public readonly identifiers: string[] = [];
  public readonly functions: FunctionBody[] = [];
  public name: string;
  public id: string;
  public readonly errors: PythonError[] = [];
}
