import { GeneratedCode } from '../common/Instructions';
import { TokenPosition } from '../api/Token';
import { ReferenceScope } from '../common/ReferenceScope';

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
  public position: TokenPosition;
  public type: CompilerBlockType;
  public blockCode: GeneratedCode = new GeneratedCode();
  public arg1: number;
  public arg2: GeneratedCode;
  //public arg3: string[];
  public arg4: number[];
  public label: number;
  public indent: number;
  public path: string;
  public index: number;
  public parent: CompilerBlockContext;
  public documentation = '';
  public scopeChange: { [id: string]: ReferenceScope } = {};
  //public declaredVariables: { [key: string]: boolean } = {};
}
