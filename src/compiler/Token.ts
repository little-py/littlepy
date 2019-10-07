import {KeywordType} from './Keyword';

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
  public constructor(/*src?: Token*/) {
    // if (src) {
    //   this.type = src.type;
    //   this.offset = src.offset;
    //   this.length = src.length;
    //   this.row = src.row;
    //   this.col = src.col;
    //   this.arg1 = src.arg1;
    //   this.arg2 = src.arg2;
    //   this.id = src.id;
    // }
  }
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

export function isLiteral(token: Token): boolean {
  return token && token.type === TokenType.Literal;
}

export function isColon(token: Token): boolean {
  return token && token.type === TokenType.Delimiter && token.delimiter === DelimiterType.Colon;
}

export function isBlockKeyword(token: Token): boolean {
  if (token && token.type === TokenType.Keyword) {
    switch (token.keyword) {
      case KeywordType.Def:
      case KeywordType.For:
      case KeywordType.While:
      case KeywordType.If:
      case KeywordType.Elif:
      case KeywordType.Else:
      case KeywordType.Class:
      case KeywordType.Try:
      case KeywordType.Except:
      case KeywordType.Finally:
        return true;
    }
  }
  return false;
}

export function isSemicolon(token: Token): boolean {
  return token && token.type === TokenType.Delimiter && token.delimiter === DelimiterType.Semicolon;
}

export function isLeftBracket(token: Token): boolean {
  return token && token.type === TokenType.Delimiter && token.delimiter === DelimiterType.LeftBracket;
}

export function isRightBracket(token: Token): boolean {
  return token && token.type === TokenType.Delimiter && token.delimiter === DelimiterType.RightBracket;
}

export function isComma(token: Token): boolean {
  return token && token.type === TokenType.Delimiter && token.delimiter === DelimiterType.Comma;
}

export function isPoint(token: Token): boolean {
  return token && token.type === TokenType.Delimiter && token.delimiter === DelimiterType.Point;
}

export function isLeftSquareBracket(token: Token): boolean {
  return token && token.type === TokenType.Delimiter && token.delimiter === DelimiterType.LeftSquareBracket;
}

export function isRightSquareBracket(token: Token): boolean {
  return token && token.type === TokenType.Delimiter && token.delimiter === DelimiterType.RightSquareBracket;
}

export function isRightFigureBracket(token: Token): boolean {
  return token && token.type === TokenType.Delimiter && token.delimiter === DelimiterType.RightFigureBracket;
}

export function isIdentifier(token: Token): boolean {
  return token && token.type === TokenType.Identifier;
}

export function isKeywordIn(token: Token) {
  return token && token.type === TokenType.Keyword && token.keyword === KeywordType.In;
}

export function isKeywordElse(token: Token) {
  return token && token.type === TokenType.Keyword && token.keyword === KeywordType.Else;
}

export function isKeywordAs(token: Token) {
  return token && token.type === TokenType.Keyword && token.keyword === KeywordType.As;
}

export function isDelimiterEqual(token: Token) {
  return token && token.type === TokenType.Delimiter && token.delimiter === DelimiterType.EqualSign;
}

export function isOperatorMultiply(token: Token) {
  return token && token.type === TokenType.Operator && token.operator === OperatorType.Multiply;
}

export function isUnaryOperator(token: Token): boolean {
  if (
    token.type === TokenType.Operator &&
    (token.operator === OperatorType.Invert || token.operator === OperatorType.Plus || token.operator === OperatorType.Minus)
  ) {
    return true;
  }
  return token.type === TokenType.Keyword && token.keyword === KeywordType.Not;
}

export function isAssignmentDelimiter(token: Token): boolean {
  if (token && token.type === TokenType.Delimiter) {
    switch (token.delimiter) {
      case DelimiterType.EqualSign:
      case DelimiterType.EqualPlus:
      case DelimiterType.EqualMinus:
      case DelimiterType.EqualMultiply:
      case DelimiterType.EqualDivide:
      case DelimiterType.EqualFloorDivide:
      case DelimiterType.EqualModulus:
      case DelimiterType.EqualAt:
      case DelimiterType.EqualAnd:
      case DelimiterType.EqualOr:
      case DelimiterType.EqualXor:
      case DelimiterType.EqualShiftRight:
      case DelimiterType.EqualShiftLeft:
      case DelimiterType.EqualPower:
        return true;
    }
  }
  return false;
}

export function isExpressionEnd(token: Token): boolean {
  if (isAssignmentDelimiter(token)) {
    return true;
  }
  if (token.type === TokenType.Delimiter) {
    switch (token.delimiter) {
      case DelimiterType.Comma:
      case DelimiterType.RightBracket:
      case DelimiterType.RightSquareBracket:
      case DelimiterType.RightFigureBracket:
      case DelimiterType.EqualSign:
      case DelimiterType.Colon:
        return true;
    }
  }
  if (token.type === TokenType.Keyword) {
    switch (token.keyword) {
      case KeywordType.Else:
      case KeywordType.As:
      case KeywordType.If:
      case KeywordType.For:
        return true;
    }
  }
  return false;
}

export function getTokenOperatorPriority(token: Token): number {
  const type = token.type;
  if (type === TokenType.Keyword) {
    switch (token.keyword) {
      case KeywordType.Or:
        return 1;
      case KeywordType.And:
        return 2;
      case KeywordType.Not:
        return 3;
      case KeywordType.In:
      case KeywordType.NotIn:
      case KeywordType.Is:
      case KeywordType.IsNot:
        return 4;
    }
  }
  if (type === TokenType.Operator) {
    switch (token.operator) {
      case OperatorType.Less:
      case OperatorType.Greater:
      case OperatorType.LessEqual:
      case OperatorType.GreaterEqual:
      case OperatorType.NotEqual:
      case OperatorType.Equal:
        return 4;
      case OperatorType.Or:
        return 5;
      case OperatorType.Xor:
        return 6;
      case OperatorType.And:
        return 7;
      case OperatorType.ShiftLeft:
      case OperatorType.ShiftRight:
        return 8;
      case OperatorType.Plus:
      case OperatorType.Minus:
        return 9;
      case OperatorType.Multiply:
      case OperatorType.At:
      case OperatorType.Divide:
      case OperatorType.FloorDivide:
      case OperatorType.Modulus:
        return 10;
      case OperatorType.Power:
        return 11;
    }
  }
  if (type === TokenType.Keyword && token.keyword === KeywordType.Await) {
    return 12;
  }
  return -1;
}

export function isIfOperator(token: Token): boolean {
  return token && token.type === TokenType.Keyword && token.keyword === KeywordType.If;
}

export function isBinaryOperator(token: Token): boolean {
  if (token.type === TokenType.Operator) {
    switch (token.operator) {
      case OperatorType.Plus:
      case OperatorType.Minus:
      case OperatorType.Multiply:
      case OperatorType.Power:
      case OperatorType.Divide:
      case OperatorType.FloorDivide:
      case OperatorType.Modulus:
      case OperatorType.ShiftLeft:
      case OperatorType.ShiftRight:
      case OperatorType.And:
      case OperatorType.Or:
      case OperatorType.Xor:
      case OperatorType.Less:
      case OperatorType.Greater:
      case OperatorType.LessEqual:
      case OperatorType.GreaterEqual:
      case OperatorType.Equal:
      case OperatorType.NotEqual:
        return true;
    }
  } else if (token.type === TokenType.Keyword) {
    switch (token.keyword) {
      case KeywordType.And:
      case KeywordType.Is:
      case KeywordType.IsNot:
      case KeywordType.Or:
      case KeywordType.In:
      case KeywordType.NotIn:
        return true;
    }
  }

  return false;
}
