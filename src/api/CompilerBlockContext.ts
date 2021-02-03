import { TokenPosition } from './Token';
import { ReferenceScope } from './ReferenceScope';
import { CodeFragment } from './CodeFragment';

export interface DeclareVariable {
  id: number;
  scope: ReferenceScope;
  position: TokenPosition;
}

export enum CompilerBlockType {
  For = 'For',
  While = 'While',
  Function = 'Function',
  Module = 'Module',
  Class = 'Class',
  If = 'If',
  Else = 'Else',
  ElseIf = 'ElseIf',
  Try = 'Try',
  Except = 'Except',
  Finally = 'Finally',
  With = 'With',
}

export class CompilerBlockContext {
  constructor(public blockCode: CodeFragment, public readonly type: CompilerBlockType, public readonly parent: CompilerBlockContext) {
    if (type === CompilerBlockType.Module || type === CompilerBlockType.Function) {
      this.functionContext = this;
    } else {
      this.functionContext = this.parent?.functionContext;
    }
  }

  public addVariableAccess(id: number, position: TokenPosition): void {
    if (!this.accessedVariables[id]) {
      this.accessedVariables[id] = [];
    }
    this.accessedVariables[id].push(position);
  }

  public position: TokenPosition;
  public arg1: number;
  public arg2: CodeFragment;
  public arg4: number[];
  public label: number;
  public indent: number;
  public path: string;
  public index: number;
  public documentation = '';
  public functionContext: CompilerBlockContext;
  public functionVariables: { [key: number]: DeclareVariable } = {};
  public accessedVariables: { [key: number]: TokenPosition[] } = {};
}
