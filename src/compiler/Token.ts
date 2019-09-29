import { KeywordType } from './Keyword';

export enum TokenType {
  Invalid,
  NewLine,
  Comment,
  Indent,
  Dedent,
  Identifier,
  Keyword,
  Literal,
  Operator,
  Delimiter,
}

export enum OperatorDelimiterType {
  Plus, // +
  Minus, // -
  Multiply, // * (also changes argument type in function definition)
  Power, // **
  Divide, // /
  FloorDivide, // //
  Modulus, // %
  At, // @
  ShiftLeft, // <<
  ShiftRight, // >>
  And, // &
  Or, // |
  Xor, // ^
  Invert, // ~
  Less, // <
  Greater, // >
  LessEqual, // <=
  GreaterEqual, // >=
  Equal, // ==
  NotEqual, // !=
  LastOperator,
  LeftBracket, // (
  RightBracket, // )
  LeftSquareBracket, // [
  RightSquareBracket, // ]
  LeftFigureBracket, // {
  RightFigureBracket, // }
  Comma, // ,
  Colon, // :
  Point, // .
  Semicolon, // ;
  EqualSign, // =
  Arrow, // ->
  EqualPlus, // +=
  EqualMinus, // -=
  EqualMultiply, // *=
  EqualDivide, // /=
  EqualFloorDivide, // //=
  EqualModulus, // %=
  EqualAt, // @=
  EqualAnd, // &=
  EqualOr, // |=
  EqualXor, // ^=
  EqualShiftRight, // >>=
  EqualShiftLeft, // <<=
  EqualPower, // **=
}

export interface TokenPosition {
  position: number;
  row: number;
  column: number;
}

export class Token {
  public constructor(src?: Token) {
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
  public arg1: number;
  public arg2: number;
  public id: number;
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
  return token && token.type === TokenType.Delimiter && token.arg1 === OperatorDelimiterType.Colon;
}

export function isBlockKeyword(token: Token): boolean {
  if (token && token.type === TokenType.Keyword) {
    switch (token.arg1) {
      case KeywordType.KeywordDef:
      case KeywordType.KeywordFor:
      case KeywordType.KeywordWhile:
      case KeywordType.KeywordIf:
      case KeywordType.KeywordElif:
      case KeywordType.KeywordElse:
      case KeywordType.KeywordClass:
      case KeywordType.KeywordTry:
      case KeywordType.KeywordExcept:
      case KeywordType.KeywordFinally:
        return true;
    }
  }
  return false;
}

export function isSemicolon(token: Token): boolean {
  return token && token.type === TokenType.Delimiter && token.arg1 === OperatorDelimiterType.Semicolon;
}

export function isLeftBracket(token: Token): boolean {
  return token && token.type === TokenType.Delimiter && token.arg1 === OperatorDelimiterType.LeftBracket;
}

export function isRightBracket(token: Token): boolean {
  return token && token.type === TokenType.Delimiter && token.arg1 === OperatorDelimiterType.RightBracket;
}

export function isComma(token: Token): boolean {
  return token && token.type === TokenType.Delimiter && token.arg1 === OperatorDelimiterType.Comma;
}

export function isPoint(token: Token): boolean {
  return token && token.type === TokenType.Delimiter && token.arg1 === OperatorDelimiterType.Point;
}

export function isLeftSquareBracket(token: Token): boolean {
  return token && token.type === TokenType.Delimiter && token.arg1 === OperatorDelimiterType.LeftSquareBracket;
}

export function isRightSquareBracket(token: Token): boolean {
  return token && token.type === TokenType.Delimiter && token.arg1 === OperatorDelimiterType.RightSquareBracket;
}

export function isRightFigureBracket(token: Token): boolean {
  return token && token.type === TokenType.Delimiter && token.arg1 === OperatorDelimiterType.RightFigureBracket;
}

export function isIdentifier(token: Token): boolean {
  return token && token.type === TokenType.Identifier;
}

export function isKeywordIn(token: Token) {
  return token && token.type === TokenType.Keyword && token.arg1 === KeywordType.KeywordIn;
}

export function isKeywordElse(token: Token) {
  return token && token.type === TokenType.Keyword && token.arg1 === KeywordType.KeywordElse;
}

export function isKeywordAs(token: Token) {
  return token && token.type === TokenType.Keyword && token.arg1 === KeywordType.KeywordAs;
}

export function isDelimiterEqual(token: Token) {
  return token && token.type === TokenType.Delimiter && token.arg1 === OperatorDelimiterType.EqualSign;
}

export function isOperatorMultiply(token: Token) {
  return token && token.type === TokenType.Operator && token.arg1 === OperatorDelimiterType.Multiply;
}

export function isUnaryOperator(token: Token): boolean {
  if (token.type === TokenType.Operator && (token.arg1 === OperatorDelimiterType.Invert || token.arg1 === OperatorDelimiterType.Plus || token.arg1 === OperatorDelimiterType.Minus)) {
    return true;
  }
  return token.type === TokenType.Keyword && (token.arg1 === KeywordType.KeywordNot || token.arg1 === KeywordType.KeywordCount);
}

export function isAssignmentDelimiter(token: Token): boolean {
  if (token && token.type === TokenType.Delimiter) {
    switch (token.arg1) {
      case OperatorDelimiterType.EqualSign:
      case OperatorDelimiterType.EqualPlus:
      case OperatorDelimiterType.EqualMinus:
      case OperatorDelimiterType.EqualMultiply:
      case OperatorDelimiterType.EqualDivide:
      case OperatorDelimiterType.EqualFloorDivide:
      case OperatorDelimiterType.EqualModulus:
      case OperatorDelimiterType.EqualAt:
      case OperatorDelimiterType.EqualAnd:
      case OperatorDelimiterType.EqualOr:
      case OperatorDelimiterType.EqualXor:
      case OperatorDelimiterType.EqualShiftRight:
      case OperatorDelimiterType.EqualShiftLeft:
      case OperatorDelimiterType.EqualPower:
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
    switch (token.arg1) {
      case OperatorDelimiterType.Comma:
      case OperatorDelimiterType.RightBracket:
      case OperatorDelimiterType.RightSquareBracket:
      case OperatorDelimiterType.RightFigureBracket:
      case OperatorDelimiterType.EqualSign:
      case OperatorDelimiterType.Colon:
        return true;
    }
  }
  if (token.type === TokenType.Keyword) {
    switch (token.arg1) {
      case KeywordType.KeywordElse:
        return true;
    }
  }
  return false;
}

export function getTokenOperatorPriority(token: Token): number {
  const type = token.type;
  const arg = token.arg1;
  if (type === TokenType.Keyword) {
    switch (arg) {
      case KeywordType.KeywordOr:
        return 1;
      case KeywordType.KeywordAnd:
        return 2;
      case KeywordType.KeywordNot:
        return 3;
      case KeywordType.KeywordIn:
      case KeywordType.KeywordNotIn:
      case KeywordType.KeywordIs:
      case KeywordType.KeywordIsNot:
        return 4;
    }
  }
  if (type === TokenType.Operator) {
    switch (arg) {
      case OperatorDelimiterType.Less:
      case OperatorDelimiterType.Greater:
      case OperatorDelimiterType.LessEqual:
      case OperatorDelimiterType.GreaterEqual:
      case OperatorDelimiterType.NotEqual:
      case OperatorDelimiterType.Equal:
        return 4;
      case OperatorDelimiterType.Or:
        return 5;
      case OperatorDelimiterType.Xor:
        return 6;
      case OperatorDelimiterType.And:
        return 7;
      case OperatorDelimiterType.ShiftLeft:
      case OperatorDelimiterType.ShiftRight:
        return 8;
      case OperatorDelimiterType.Plus:
      case OperatorDelimiterType.Minus:
        return 9;
      case OperatorDelimiterType.Multiply:
      case OperatorDelimiterType.At:
      case OperatorDelimiterType.Divide:
      case OperatorDelimiterType.FloorDivide:
      case OperatorDelimiterType.Modulus:
        return 10;
      case OperatorDelimiterType.Power:
        return 11;
    }
  }
  if (type === TokenType.Keyword && arg === KeywordType.KeywordAwait) {
    return 12;
  }
  return -1;
}

export function isIfOperator(token: Token): boolean {
  return token && token.type === TokenType.Keyword && token.arg1 == KeywordType.KeywordIf;
}

export function isBinaryOperator(token: Token): boolean {
  if (token.type === TokenType.Operator) {
    switch (token.arg1) {
      case OperatorDelimiterType.Plus:
      case OperatorDelimiterType.Minus:
      case OperatorDelimiterType.Multiply:
      case OperatorDelimiterType.Power:
      case OperatorDelimiterType.Divide:
      case OperatorDelimiterType.FloorDivide:
      case OperatorDelimiterType.Modulus:
      case OperatorDelimiterType.ShiftLeft:
      case OperatorDelimiterType.ShiftRight:
      case OperatorDelimiterType.And:
      case OperatorDelimiterType.Or:
      case OperatorDelimiterType.Xor:
      case OperatorDelimiterType.Less:
      case OperatorDelimiterType.Greater:
      case OperatorDelimiterType.LessEqual:
      case OperatorDelimiterType.GreaterEqual:
      case OperatorDelimiterType.Equal:
      case OperatorDelimiterType.NotEqual:
        return true;
    }
  } else if (token.type === TokenType.Keyword) {
    switch (token.arg1) {
      case KeywordType.KeywordAnd:
      case KeywordType.KeywordIs:
      case KeywordType.KeywordIsNot:
      case KeywordType.KeywordOr:
      case KeywordType.KeywordIn:
      case KeywordType.KeywordNotIn:
        return true;
    }
  }

  return false;
}
