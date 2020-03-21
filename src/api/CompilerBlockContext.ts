import { TokenPosition } from './Token';
import { ReferenceScope } from './ReferenceScope';
import { CodeFragment } from './CodeFragment';

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
  constructor(fragment: CodeFragment) {
    this.blockCode = fragment;
  }

  public position: TokenPosition;
  public type: CompilerBlockType;
  public blockCode: CodeFragment;
  public arg1: number;
  public arg2: CodeFragment;
  public arg4: number[];
  public label: number;
  public indent: number;
  public path: string;
  public index: number;
  public parent: CompilerBlockContext;
  public documentation = '';
  public scopeChange: { [id: string]: ReferenceScope } = {};
}
