import { KeywordType } from './Keyword';

export enum TokenType {
  Invalid = 'Invalid',
  NewLine = 'NewLine',
  Comment = 'Comment',
  Indent = 'Indent',
  Dedent = 'Dedent',
  Identifier = 'Identifier',
  Keyword = 'Keyword',
  Literal = 'Literal',
  Operator = 'Operator',
  Delimiter = 'Delimiter',
}

export enum OperatorType {
  Plus = '+',
  Minus = '-',
  Multiply = '*', // * (also changes argument type in function definition)
  Power = '**',
  Divide = '/',
  FloorDivide = '//',
  Modulus = '%',
  At = '@',
  ShiftLeft = '<<',
  ShiftRight = '>>',
  And = '&',
  Or = '|',
  Xor = '^',
  Invert = '~',
  Less = '<',
  Greater = '>',
  LessEqual = '<=',
  GreaterEqual = '>=',
  Equal = '==',
  NotEqual = '!=',
}

export enum DelimiterType {
  LeftBracket = '(',
  RightBracket = ')',
  LeftSquareBracket = '[',
  RightSquareBracket = ']',
  LeftFigureBracket = '{',
  RightFigureBracket = '}',
  Comma = ',',
  Colon = ':',
  Point = '.',
  Semicolon = ';',
  EqualSign = '=',
  Arrow = '->',
  EqualPlus = '+=',
  EqualMinus = '-=',
  EqualMultiply = '*=',
  EqualDivide = '/=',
  EqualFloorDivide = '//=',
  EqualModulus = '%=',
  EqualAt = '@=',
  EqualAnd = '&=',
  EqualOr = '|=',
  EqualXor = '^=',
  EqualShiftRight = '>>=',
  EqualShiftLeft = '<<=',
  EqualPower = '**=',
}

export interface TokenPosition {
  position: number;
  row: number;
  column: number;
}

export class Token {
  public constructor() {}
  public type: TokenType;
  public offset: number;
  public length: number;
  public row: number;
  public col: number;
  public operator: OperatorType;
  public delimiter: DelimiterType;
  public keyword: KeywordType;
  public identifier: number;
  public literal: number;
  public debug: string;
  public getPosition(): TokenPosition {
    return {
      position: this.offset,
      row: this.row,
      column: this.col,
    };
  }
}
