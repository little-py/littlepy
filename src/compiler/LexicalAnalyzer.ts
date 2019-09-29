import { LexicalContext } from './LexicalContext';
import { OperatorDelimiterType, Token, TokenType } from './Token';
import { Keyword, KeywordType } from './Keyword';
import { isDigit, isFirstIdentifierChar, isIdentifierChar, isStringMarkerChar } from './Characters';
import { Literal, LiteralType } from './Literal';
import { CompiledModule } from './CompiledModule';
import { PythonErrorType } from '../common/PythonErrorType';
import { PythonError, PythonErrorContext } from '../common/PythonError';

const TAB_LENGTH = 4;

export class LexicalAnalyzer {
  private _col: number;
  private _row: number;
  private _context: LexicalContext;
  private _indentStack: number[];
  private _sourcePos: number;
  private _source: string;
  private _currentChar: string;
  private readonly _compiledCode: CompiledModule;

  public constructor(compiledCode: CompiledModule) {
    this._compiledCode = compiledCode;
  }

  private addError(type: PythonErrorType, row: number, col: number, position: number, length: number, context?: PythonErrorContext) {
    this._compiledCode.errors.push(new PythonError(type, row, col, length, position, context));
  }

  public parse(source: string, context: LexicalContext) {
    this._indentStack = [];
    this._context = context;
    this._source = source;
    this._sourcePos = -1;
    this.nextChar();
    this._row = 0;
    this._col = 0;
    this.addIndent();

    while (this._sourcePos < this._source.length) {
      this.parseInternal();
    }

    if (this._compiledCode.tokens.length === 0 || this._compiledCode.tokens[this._compiledCode.tokens.length - 1].type !== TokenType.NewLine) {
      const token = new Token();
      token.type = TokenType.NewLine;
      this.prepareToken(token);
      this.addToken(token);
    }

    while (this._indentStack.length > 0) {
      this._indentStack.pop();
      const token = new Token();
      token.type = TokenType.Dedent;
      this.prepareToken(token);
      this.addToken(token);
    }

    if (DEBUG) {
      for (const token of this._compiledCode.tokens) {
        if (token.length) {
          token.debug = source.substr(token.offset, token.length);
        }
      }
    }
  }

  private addIndent() {
    const token = new Token();
    token.type = TokenType.Indent;
    this.prepareToken(token);
    this.addToken(token);
  }

  private parseInternal() {
    for (;;) {
      if (this._currentChar === ' ') {
        this._col++;
        this.nextChar();
      } else if (this._currentChar === '\t') {
        this._col = (Math.floor(this._col / TAB_LENGTH) + 1) * TAB_LENGTH;
        this.nextChar();
      } else {
        break;
      }
    }

    if (this._sourcePos >= this._source.length) {
      return;
    }

    if (this._currentChar === '#') {
      const token = new Token();
      token.type = TokenType.Comment;
      this.prepareToken(token);
      this.nextChar();
      this._col++;
      while (this._sourcePos < this._source.length) {
        // @ts-ignore
        if (this._currentChar === '\r' || this._currentChar === '\n') {
          break;
        }
        token.length++;
        this.nextChar();
        this._col++;
      }
      this.addToken(token);
      // continue to handle new line
    }

    if (this._sourcePos >= this._source.length) {
      return;
    }

    if (this._currentChar === '\r' || this._currentChar === '\n') {
      const token = new Token();
      token.type = TokenType.NewLine;
      this.prepareToken(token);
      this.addToken(token);
      this.nextLine();
      return;
    }

    if (!this.handleIndents()) {
      return;
    }

    if (isFirstIdentifierChar(this._currentChar) || isStringMarkerChar(this._currentChar)) {
      const token = new Token();
      token.type = TokenType.Identifier;
      this.prepareToken(token);
      const tokenStart = this._sourcePos;
      token.length = 0;
      if (!isStringMarkerChar(this._currentChar)) {
        token.length = 1;
        this.nextChar();
        this._col++;
        while (isIdentifierChar(this._currentChar)) {
          this.nextChar();
          token.length++;
          this._col++;
        }
      }
      if (isStringMarkerChar(this._currentChar) && token.length <= 2) {
        this.handleStringLiteral(token);
      }
      if (token.type === TokenType.Identifier) {
        const id = this._source.substr(tokenStart, token.length);
        const keywordType = Keyword.getKeywordType(id);
        if (keywordType !== KeywordType.InvalidKeyword) {
          const last = this._compiledCode.tokens[this._compiledCode.tokens.length - 1];
          if (last && last.type === TokenType.Keyword) {
            const compositeKeyword = Keyword.getCompositeKeyword(last.arg1 as KeywordType, keywordType);
            if (compositeKeyword !== KeywordType.InvalidKeyword) {
              last.arg1 = compositeKeyword;
              last.length = token.offset + token.length - last.offset;
              return;
            }
          }
          token.arg1 = keywordType;
          token.type = TokenType.Keyword;
        } else {
          token.arg1 = this._context.addIdentifier(id);
        }
      }
      this.addToken(token);
      return;
    }

    if (isDigit(this._currentChar) || this._currentChar === '.') {
      if (this.handleNumericLiteral()) {
        return;
      }
    }

    if (this.handleOperatorsDelimiters()) {
      return;
    }

    this.addError(PythonErrorType.UnknownChar, this._row, this._col, this._sourcePos, 1);
    this.skipToNextLine();
  }

  private handleIndents(): boolean {
    if (this._indentStack.length === 0) {
      this._indentStack.push(this._col);
    }
    const isNewLine = !this._compiledCode.tokens.length || this._compiledCode.tokens[this._compiledCode.tokens.length - 1].type === TokenType.NewLine;
    if (isNewLine && this._col !== this._indentStack[this._indentStack.length - 1]) {
      if (this._col > this._indentStack[this._indentStack.length - 1]) {
        const token = new Token();
        token.type = TokenType.Indent;
        this.prepareToken(token);
        this.addToken(token);
        this._indentStack.push(this._col);
      } else {
        const it = this._indentStack.findIndex(c => c === this._col);
        if (it < 0) {
          this.addError(PythonErrorType.MismatchedIndent, this._row, 0, this._sourcePos - this._col, this._col);
          this.skipToNextLine();
          return false;
        }
        while (this._indentStack.length > it + 1) {
          this._indentStack.pop();
          const token = new Token();
          token.type = TokenType.Dedent;
          this.prepareToken(token);
          this.addToken(token);
        }
      }
    }
    return true;
  }

  private skipToNextLine() {
    while (this._sourcePos < this._source.length && (this._currentChar !== '\r' && this._currentChar !== '\n')) {
      this.nextChar();
    }
    this.nextLine();
  }

  private addToken(token: Token) {
    this._compiledCode.tokens.push(token);
  }

  private prepareToken(token: Token) {
    token.offset = this._sourcePos;
    token.length = 0;
    token.row = this._row;
    token.col = this._col;
  }

  private nextLine() {
    if (this._currentChar === '\r') {
      this.nextChar();
      // @ts-ignore
      if (this._currentChar === '\n') {
        this.nextChar();
      }
    } else if (this._currentChar === '\n') {
      this.nextChar();
      // @ts-ignore
      if (this._currentChar === '\r') {
        this.nextChar();
      }
    }
    this._col = 0;
    this._row++;
  }

  private handleStringLiteral(token: Token) {
    const start = token.offset;
    let c1 = token.length > 0 ? this._source[start].toLowerCase() : '';
    let c2 = token.length > 1 ? this._source[start + 1].toLowerCase() : '';
    let literalType = LiteralType.String;
    let isRaw = false;
    if (c1 === 'r') {
      c1 = c2;
      c2 = '';
      isRaw = true;
    } else if (c2 === 'r') {
      c2 = '';
      isRaw = true;
    }
    if (c2 !== '') {
      return;
    }
    if (c1 === 'f') {
      literalType = LiteralType.FormattedString;
    } else if (c1 === 'b') {
      literalType = LiteralType.Bytes;
    } else if (c1 === 'u') {
      if (isRaw) {
        return;
      }
      literalType = LiteralType.Unicode;
    }
    if (isRaw) {
      literalType |= LiteralType.Raw;
    }
    const quoteType = this._currentChar;
    let isLong = false;
    if (quoteType === this._source[this._sourcePos + 1] && quoteType === this._source[this._sourcePos + 2]) {
      literalType |= LiteralType.Long;
      this.nextChar();
      this.nextChar();
      this.nextChar();
      this._col += 3;
      isLong = true;
    } else {
      this.nextChar();
      this._col++;
    }
    token.type = TokenType.Literal;
    let value = '';
    while (this._sourcePos < this._source.length) {
      if (this._currentChar === quoteType && (!isLong || (this._source[this._sourcePos + 1] === quoteType && this._source[this._sourcePos + 2] === quoteType))) {
        if (isLong) {
          this.nextChar();
          this.nextChar();
          this.nextChar();
          this._col += 3;
        } else {
          this.nextChar();
          this._col++;
        }
        break;
      }
      if (!isRaw && this._currentChar === '\\') {
        this.nextChar();
        this._col++;
        // @ts-ignore
        if (this._currentChar === '\r' || this._currentChar === '\n') {
          this.nextLine();
          continue;
        }
        let escapedChar;
        switch (this._currentChar) {
          // @ts-ignore
          case "'":
          // @ts-ignore
          case '"':
          case '\\':
            escapedChar = this._currentChar;
            this.nextChar();
            this._col++;
            break;
          // @ts-ignore
          case 'a':
          // @ts-ignore
          case 'b':
            this.nextChar();
            this._col++;
            break;
          default:
            this.addError(PythonErrorType.UnknownEscapeChar, this._row, this._col, this._sourcePos, 1);
            break;
        }
        if (escapedChar) {
          value += escapedChar;
        }
      } else {
        value += this._currentChar;
        this._col++;
        this.nextChar();
      }
    }
    token.length = this._sourcePos - start;
    token.arg1 = this._compiledCode.literals.length;
    const literal = new Literal();
    literal.type = literalType;
    literal.string = value;
    this._compiledCode.literals.push(literal);
  }

  private handleNumericLiteral(): boolean {
    const token = new Token();
    token.type = TokenType.Literal;
    let literalType = LiteralType.Integer;
    this.prepareToken(token);
    const start = this._sourcePos;

    let hasPoint = false;
    if (this._currentChar === '.') {
      if (!isDigit(this._source[this._sourcePos + 1])) {
        return false;
      }
      literalType = LiteralType.FloatingPoint;
      hasPoint = true;
      this.nextChar();
      this._col++;
    }
    while (this._sourcePos < this._source.length) {
      if (isDigit(this._currentChar) || this._currentChar === '_') {
        this.nextChar();
        this._col++;
        continue;
      }
      if (this._currentChar === '.') {
        if (hasPoint) {
          break;
        }
        literalType = LiteralType.FloatingPoint;
        hasPoint = true;
        this.nextChar();
        this._col++;
        continue;
      }
      break;
    }
    if (this._currentChar === 'j' || this._currentChar === 'J') {
      literalType = LiteralType.Imaginary;
      this.nextChar();
      this._col++;
    }
    token.arg1 = this._compiledCode.literals.length;
    token.length = this._sourcePos - start;
    if (token.length === 0) {
      return false;
    }
    const value = this._source.substr(start, token.length);
    const literal = new Literal();
    literal.type = literalType;
    if (literalType === LiteralType.Integer) {
      literal.integer = Number(value);
    } else {
      literal.integer = Number(value);
    }
    this._compiledCode.literals.push(literal);
    this.addToken(token);
    return true;
  }

  private nextChar() {
    this._sourcePos++;
    this._currentChar = this._source[this._sourcePos];
  }

  private handleOperatorsDelimiters(): boolean {
    const c1 = this._source[this._sourcePos];
    const c2 = this._sourcePos + 1 < this._source.length ? this._source[this._sourcePos + 1] : '';
    const c3 = this._sourcePos + 2 < this._source.length ? this._source[this._sourcePos + 2] : '';
    let type = -1;
    let len = 0;

    switch (c1) {
      case '+':
        if (c2 === '=') {
          type = OperatorDelimiterType.EqualPlus;
          len = 2;
        } else {
          type = OperatorDelimiterType.Plus;
          len = 1;
        }
        break;
      case '-':
        if (c2 === '=') {
          type = OperatorDelimiterType.EqualMinus;
          len = 2;
        } else if (c2 === '>') {
          type = OperatorDelimiterType.Arrow;
          len = 2;
        } else {
          type = OperatorDelimiterType.Minus;
          len = 1;
        }
        break;
      case '*':
        if (c2 === '=') {
          type = OperatorDelimiterType.EqualMultiply;
          len = 2;
        } else if (c2 === '*') {
          if (c3 === '=') {
            type = OperatorDelimiterType.EqualPower;
            len = 3;
          } else {
            type = OperatorDelimiterType.Power;
            len = 2;
          }
        } else {
          type = OperatorDelimiterType.Multiply;
          len = 1;
        }
        break;
      case '/':
        if (c2 === '=') {
          type = OperatorDelimiterType.EqualDivide;
          len = 2;
        } else if (c2 === '/') {
          if (c3 === '=') {
            type = OperatorDelimiterType.EqualFloorDivide;
            len = 3;
          } else {
            type = OperatorDelimiterType.FloorDivide;
            len = 2;
          }
        } else {
          type = OperatorDelimiterType.Divide;
          len = 1;
        }
        break;
      case '%':
        if (c2 === '=') {
          type = OperatorDelimiterType.EqualModulus;
          len = 2;
        } else {
          type = OperatorDelimiterType.Modulus;
          len = 1;
        }
        break;
      case '@':
        if (c2 === '=') {
          type = OperatorDelimiterType.EqualAt;
          len = 2;
        } else {
          type = OperatorDelimiterType.At;
          len = 1;
        }
        break;
      case '<':
        if (c2 === '<') {
          if (c3 === '=') {
            type = OperatorDelimiterType.EqualShiftLeft;
            len = 3;
          } else {
            type = OperatorDelimiterType.ShiftLeft;
            len = 2;
          }
        } else if (c2 === '=') {
          type = OperatorDelimiterType.LessEqual;
          len = 2;
        } else {
          type = OperatorDelimiterType.Less;
          len = 1;
        }
        break;
      case '>':
        if (c2 === '>') {
          if (c3 === '=') {
            type = OperatorDelimiterType.EqualShiftRight;
            len = 3;
          } else {
            type = OperatorDelimiterType.ShiftRight;
            len = 2;
          }
        } else if (c2 === '=') {
          type = OperatorDelimiterType.GreaterEqual;
          len = 2;
        } else {
          type = OperatorDelimiterType.Greater;
          len = 1;
        }
        break;
      case '&':
        if (c2 === '=') {
          type = OperatorDelimiterType.EqualAnd;
          len = 2;
        } else {
          type = OperatorDelimiterType.And;
          len = 1;
        }
        break;
      case '|':
        if (c2 === '=') {
          type = OperatorDelimiterType.EqualOr;
          len = 2;
        } else {
          type = OperatorDelimiterType.Or;
          len = 1;
        }
        break;
      case '^':
        if (c2 === '=') {
          type = OperatorDelimiterType.EqualXor;
          len = 2;
          break;
        } else {
          type = OperatorDelimiterType.Xor;
          len = 1;
        }
        break;
      case '~':
        type = OperatorDelimiterType.Invert;
        len = 1;
        break;
      case '=':
        if (c2 === '=') {
          type = OperatorDelimiterType.Equal;
          len = 2;
        } else {
          type = OperatorDelimiterType.EqualSign;
          len = 1;
        }
        break;
      case '!':
        if (c2 === '=') {
          type = OperatorDelimiterType.NotEqual;
          len = 2;
        }
        break;
      case '(':
        type = OperatorDelimiterType.LeftBracket;
        len = 1;
        break;
      case ')':
        type = OperatorDelimiterType.RightBracket;
        len = 1;
        break;
      case '[':
        type = OperatorDelimiterType.LeftSquareBracket;
        len = 1;
        break;
      case ']':
        type = OperatorDelimiterType.RightSquareBracket;
        len = 1;
        break;
      case '{':
        type = OperatorDelimiterType.LeftFigureBracket;
        len = 1;
        break;
      case '}':
        type = OperatorDelimiterType.RightFigureBracket;
        len = 1;
        break;
      case ',':
        type = OperatorDelimiterType.Comma;
        len = 1;
        break;
      case ':':
        type = OperatorDelimiterType.Colon;
        len = 1;
        break;
      case '.':
        type = OperatorDelimiterType.Point;
        len = 1;
        break;
      case ';':
        type = OperatorDelimiterType.Semicolon;
        len = 1;
        break;
      default:
        return false;
    }
    if (len === 0) {
      return false;
    }
    const token = new Token();
    token.type = type < OperatorDelimiterType.LastOperator ? TokenType.Operator : TokenType.Delimiter;
    this.prepareToken(token);
    token.arg1 = type;
    token.length = len;
    this.addToken(token);
    for (let i = 0; i < len; i++) {
      this.nextChar();
    }
    this._col += len;
    return true;
  }
}
