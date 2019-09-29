import { GeneratedCode } from '../common/Instructions';
import { TokenPosition } from './Token';

export enum CompilerBlockType {
  For,
  While,
  Function,
  Module,
  Class,
  If,
  Else,
  ElseIf,
  Try,
  Except,
  Finally,
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
  //public declaredVariables: { [key: string]: boolean } = {};
}
