import {
  DelimiterType,
  getTokenOperatorPriority,
  isBinaryOperator,
  isColon,
  isComma,
  isDelimiterEqual,
  isExpressionEnd,
  isIdentifier,
  isIfOperator,
  isKeywordElse,
  isKeywordIn,
  isLeftBracket,
  isLeftSquareBracket,
  isLiteral,
  isPoint,
  isRightBracket,
  isRightFigureBracket,
  isRightSquareBracket,
  isUnaryOperator,
  Token,
  TokenPosition,
  TokenType,
} from './Token';
import { CompilerContext } from './CompilerContext';
import { LexicalContext } from './LexicalContext';
import { GeneratedCode } from '../common/Instructions';
import { KeywordType } from './Keyword';
import { CodeGenerator } from './CodeGenerator';
import { CompiledModule } from './CompiledModule';
import { LiteralType } from './Literal';
import { InstructionType } from '../common/InstructionType';
import { PyErrorType } from '../api/ErrorType';
import { ArgumentType, FunctionArgument, FunctionBody, FunctionType } from '../common/FunctionBody';
import { ReferenceScope } from '../common/ReferenceScope';
import { CompilerBlockContext, CompilerBlockType } from './CompilerBlockContext';

export class ExpressionCompiler {
  private _from: number;
  private readonly _tokens: Token[];
  private readonly _end: number;
  private readonly _compilerContext: CompilerContext;
  private readonly _lexicalContext: LexicalContext;
  private readonly _compiledCode: CompiledModule;

  public static compile({
    tokens,
    compiledCode,
    compilerContext,
    lexicalContext,
    start,
    end,
    parseTuple,
  }: {
    tokens: Token[];
    compiledCode: CompiledModule;
    compilerContext: CompilerContext;
    lexicalContext: LexicalContext;
    start: number;
    end?: number;
    parseTuple?: boolean;
  }): GeneratedCode {
    if (end === undefined) {
      end = tokens.length;
    }
    if (parseTuple === undefined) {
      parseTuple = false;
    }
    const compiler = new ExpressionCompiler(tokens, end, compilerContext, lexicalContext, compiledCode);
    return compiler.compileInternal(start, parseTuple, false, false);
  }

  public constructor(tokens: Token[], end: number, compilerContext: CompilerContext, lexicalContext: LexicalContext, compiledCode: CompiledModule) {
    this._tokens = tokens;
    this._end = end;
    this._compilerContext = compilerContext;
    this._lexicalContext = lexicalContext;
    this._compiledCode = compiledCode;
  }

  private getClosestToken(from: number): Token {
    if (from >= this._tokens.length) {
      from--;
    }
    return this._tokens[from];
  }

  private compileInternal(start: number, parseTuple: boolean, parseComprehension: boolean, ignoreIf: boolean): GeneratedCode {
    const savedFrom = this._from;
    this._from = start;
    const startToken = this._tokens[start];
    const failedResult = new GeneratedCode();
    failedResult.success = false;
    let createdTuple;
    const parts: GeneratedCode[] = [];

    for (;;) {
      const values: GeneratedCode[] = [];
      const operators: Token[] = [];

      let token: Token = null;
      let hasComprehension = false;

      while (this._from < this._end) {
        const expectOperator = operators.length < values.length;
        token = this._tokens[this._from];
        if (expectOperator) {
          if (this.isAnyAccessor(this._from)) {
            const value = values[values.length - 1];
            this.compileAnyAccessor(value);
            if (!value.success) {
              return value;
            }
            continue;
          }
          if (
            parseComprehension &&
            parts.length === 0 &&
            operators.length === 0 &&
            token.type === TokenType.Keyword &&
            token.keyword === KeywordType.For
          ) {
            const value = values[values.length - 1];
            const newValue = this.compileComprehension(value);
            if (!newValue.success) {
              return newValue;
            }
            newValue.comprehension = true;
            values[values.length - 1] = newValue;
            hasComprehension = true;
            break;
          }
          if (isExpressionEnd(token) || isIfOperator(token)) {
            break;
          }
          if (!isBinaryOperator(token)) {
            this._compilerContext.addError(PyErrorType.ExpectedBinaryOperator, token);
            return failedResult;
          }
          operators.push(token);
          this._from++;
          continue;
        }
        const unaryOperators: Token[] = [];
        while (isUnaryOperator(token)) {
          unaryOperators.push(token);
          this._from++;
          if (this._from >= this._end) {
            this._compilerContext.addError(PyErrorType.ExpectedUnaryOperatorOrArgument, token);
            return failedResult;
          }
          token = this._tokens[this._from];
        }
        if (token.type === TokenType.Identifier) {
          const arg = this.compileIdentifierAndFunctionIndexer();
          if (!arg.success) {
            return failedResult;
          }
          values.push(arg);
        } else if (token.type === TokenType.Delimiter) {
          let stop = false;
          switch (token.delimiter) {
            case DelimiterType.LeftSquareBracket:
              this._from++;
              if (!this.compileListInstantiation(token, values)) {
                return failedResult;
              }
              break;
            case DelimiterType.LeftBracket:
              this._from++;
              if (!this.compileTupleInstantiation(token, values)) {
                return failedResult;
              }
              break;
            case DelimiterType.LeftFigureBracket:
              this._from++;
              if (!this.compileSetOrDictionary(token, values)) {
                return failedResult;
              }
              break;
            case DelimiterType.Comma:
            case DelimiterType.RightSquareBracket:
            case DelimiterType.RightBracket:
            case DelimiterType.RightFigureBracket:
            case DelimiterType.EqualSign:
            case DelimiterType.Colon: // for while/if/for end
              // end of the expression
              stop = true;
              break;
            default:
              // if (isAssignmentDelimiter(token)) {
              // end of the expression
              stop = true;
              // }
              break;
          }
          if (stop) {
            break;
          }
        } else if (token.type === TokenType.Keyword && token.keyword === KeywordType.Lambda) {
          const lambdaExpression = this.compileLambdaExpression(token);
          if (!lambdaExpression.success) {
            return lambdaExpression;
          }
          values.push(lambdaExpression);
          break;
        } else if (token.type === TokenType.Keyword && (token.keyword === KeywordType.For || token.keyword === KeywordType.AsyncFor)) {
          break;
        } else {
          const valueResult = this.compileValue(this._from);
          if (!valueResult.success) {
            return failedResult;
          }
          values.push(valueResult);
          this._from = valueResult.finish;
        }
        if (unaryOperators.length) {
          const unaryResult = CodeGenerator.unaryOperators(unaryOperators, values[values.length - 1]);
          if (!unaryResult.success) {
            return failedResult;
          }
          values[values.length - 1] = unaryResult;
        }
      }

      if (!values.length) {
        this._compilerContext.addError(PyErrorType.ExpectedExpressionValue, this.getClosestToken(this._from));
        return failedResult;
      }

      // safety check - should never happen - should be ExpectedExpressionValue instead
      /* istanbul ignore next */
      if (values.length === operators.length) {
        this._compilerContext.addError(PyErrorType.ExpectedRightOperand, operators[operators.length - 1]);
        return failedResult;
      }

      let compiledPart = this.compileOperators(values, operators);
      if (!compiledPart.success) {
        return compiledPart;
      }

      compiledPart.finish = this._from;

      if (!ignoreIf && isIfOperator(token)) {
        const ifOperator = this.compileIfExpression(compiledPart, token);
        if (!ifOperator.success) {
          return ifOperator;
        }
        compiledPart = ifOperator;
        token = this._tokens[compiledPart.finish];
      }

      // if (token && token.type === TokenType.Keyword && (token.arg1 === KeywordType.For || token.arg1 === KeywordType.AsyncFor)) {
      //   compiledPart = this.compileListComprehension(token, this._from, compiledPart);
      // }

      parts.push(compiledPart);
      token = this._tokens[compiledPart.finish];
      if (!parseTuple || !token || hasComprehension || !isComma(token)) {
        break;
      }
      createdTuple = true;
      this._from = compiledPart.finish + 1;
      token = this._tokens[this._from];
      if (!token || isExpressionEnd(token)) {
        break;
      }
    }
    let result: GeneratedCode;
    if (createdTuple) {
      result = CodeGenerator.tuple(parts, startToken.getPosition());
      result.finish = parts[parts.length - 1].finish;
    } else {
      result = parts[0];
    }
    this._from = savedFrom;
    return result;
  }

  private compileOperators(values: GeneratedCode[], operators: Token[]): GeneratedCode {
    const result = new GeneratedCode();
    result.success = false;
    while (values.length > 1) {
      let maxOperator = 0;
      let maxValue = getTokenOperatorPriority(operators[0]);
      /* istanbul ignore next */
      if (maxValue < 0) {
        // this should never happen, just additional check; there are no error examples that can cause this error
        this._compilerContext.addError(PyErrorType.ErrorUnexpectedScenario01, operators[0]);
        return result;
      }
      for (let i = 1; i < operators.length; i++) {
        const value = getTokenOperatorPriority(operators[i]);
        /* istanbul ignore next */
        if (value < 0) {
          // this should never happen, just additional check; there are no error examples that can cause this error
          this._compilerContext.addError(PyErrorType.ErrorUnexpectedScenario02, operators[i]);
          return result;
        }
        if (value > maxValue) {
          maxValue = value;
          maxOperator = i;
        }
      }
      const newValue = CodeGenerator.binaryOperator(values[maxOperator], operators[maxOperator], values[maxOperator + 1], this._compilerContext);
      if (!newValue.success) {
        return newValue;
      }
      values.splice(maxOperator + 1, 1);
      operators.splice(maxOperator, 1);
      values[maxOperator] = newValue;
    }
    return values[0];
  }

  private isExpressionEnd(index: number) {
    return isExpressionEnd(this._tokens[index]);
  }

  private isPoint(index: number) {
    return isPoint(this._tokens[index]);
  }

  private isLeftBracket(index: number) {
    return isLeftBracket(this._tokens[index]);
  }

  private isLeftSquareBracket(index: number) {
    return isLeftSquareBracket(this._tokens[index]);
  }

  private isIdentifier(index: number) {
    return isIdentifier(this._tokens[index]);
  }

  private isPropertyAccessor(index: number) {
    return this.isPoint(index) && this.isIdentifier(index + 1);
  }

  private isAnyAccessor(index: number) {
    if (!this._tokens[index]) {
      return false;
    }
    if (this.isExpressionEnd(index)) {
      return false;
    }
    if (this.isLeftBracket(index)) {
      return true;
    }
    if (this.isPropertyAccessor(index)) {
      return true;
    }
    return this.isLeftSquareBracket(index);
  }

  private appendFunctionCall(ret: GeneratedCode, position: TokenPosition, parentAt0: boolean): boolean {
    let token = this._tokens[this._from];
    const args: GeneratedCode[] = [];
    this._from++;
    let namedStarted = false;
    for (;;) {
      let prevToken = token;
      token = this._tokens[this._from];
      let argName: string;
      if (isIdentifier(token) && isDelimiterEqual(this._tokens[this._from + 1])) {
        argName = this._compiledCode.identifiers[token.identifier];
        this._from += 2;
        token = this._tokens[this._from];
        namedStarted = true;
      }
      if (!token) {
        this._compilerContext.addError(PyErrorType.UnexpectedEndOfCall, prevToken);
        return false;
      }
      if (isRightBracket(token)) {
        this._from++;
        CodeGenerator.appendFunctionCall(ret, args, this._compilerContext, position, parentAt0);
        return true;
      }
      if (namedStarted && !argName) {
        this._compilerContext.addError(PyErrorType.OrderedArgumentAfterNamed, token || prevToken);
        return false;
      }
      const arg = this.compileInternal(this._from, false, false, false);
      if (!arg.success) {
        return false;
      }
      if (argName) {
        arg.nameLiteral = argName;
      }
      args.push(arg);
      this._from = arg.finish;
      prevToken = token;
      token = this._tokens[this._from];
      if (isComma(token)) {
        this._from++;
        continue;
      }
      if (!isRightBracket(token)) {
        this._compilerContext.addError(PyErrorType.ExpectedEndOfFunctionCall, token || prevToken);
        return false;
      }
    }
  }

  private compileIdentifierAndFunctionIndexer(): GeneratedCode {
    const first = this._tokens[this._from];
    if (!this.isAnyAccessor(this._from + 1)) {
      if (isIdentifier(first)) {
        const block = this._compilerContext.getCurrentBlock();
        const scopeType = block.scopeChange[first.identifier];
        const reference = CodeGenerator.createVarReference(
          first.identifier,
          scopeType !== undefined ? scopeType : ReferenceScope.Default,
          first.getPosition(),
        );
        this._from++;
        return reference;
      }
    }
    this._from++;
    const ret = new GeneratedCode();
    ret.add(InstructionType.ReadObject, first.getPosition(), first.identifier, ReferenceScope.Default);
    ret.success = true;
    this.compileAnyAccessor(ret);
    if (!ret.success) {
      return;
    }
    ret.finish = this._from;
    ret.success = true;
    return ret;
  }

  private compileAnyAccessor(ret: GeneratedCode) {
    while (this.isAnyAccessor(this._from)) {
      const current = this._tokens[this._from];
      if (this.isPropertyAccessor(this._from)) {
        const identifier = this._tokens[this._from + 1].identifier;
        this._from += 2;
        if (!this.isAnyAccessor(this._from)) {
          CodeGenerator.appendPropertyReference(ret, 0, identifier, current.getPosition());
          break;
        }
        if (this.isLeftBracket(this._from)) {
          ret.add(InstructionType.ReadProperty, current.getPosition(), identifier, 0, 1);
          this.appendFunctionCall(ret, current.getPosition(), true);
        } else {
          ret.add(InstructionType.ReadProperty, current.getPosition(), identifier, 0, 0);
          continue;
        }
      }
      if (this.isLeftSquareBracket(this._from)) {
        this._from++;
        const indexArg = this.compileInternal(this._from, false, false, false);
        if (!indexArg.success) {
          ret.success = false;
          return;
        }
        this._from = indexArg.finish;
        let indexTo: GeneratedCode = null;
        let indexInterval: GeneratedCode = null;
        let token = this._tokens[this._from];
        if (isColon(token)) {
          indexTo = this.compileInternal(this._from + 1, false, false, false);
          if (!indexTo.success) {
            ret.success = false;
            return;
          }
          this._from = indexTo.finish;
          token = this._tokens[this._from];
          if (isColon(token)) {
            indexInterval = this.compileInternal(this._from + 1, false, false, false);
            if (!indexInterval.success) {
              ret.success = false;
              return;
            }
            this._from = indexInterval.finish;
            token = this._tokens[this._from];
          }
        }
        if (!isRightSquareBracket(token)) {
          this._compilerContext.addError(PyErrorType.ExpectedEndOfIndexer, current);
          const ret = new GeneratedCode();
          ret.success = false;
          return;
        }
        this._from++;
        if (!this.isAnyAccessor(this._from)) {
          if (indexTo) {
            CodeGenerator.appendArrayRange(ret, 0, indexArg, indexTo, indexInterval, current.getPosition(), true);
          } else {
            CodeGenerator.appendArrayIndexerReference(ret, 0, indexArg, current.getPosition());
          }
          break;
        }
        if (indexTo) {
          CodeGenerator.appendArrayRange(ret, 0, indexArg, indexTo, indexInterval, current.getPosition(), false);
        } else {
          CodeGenerator.appendTo(ret, indexArg, 1);
          ret.add(InstructionType.ReadArrayIndex, current.getPosition(), 0, 1, 0);
        }
        continue;
      }
      if (this.isLeftBracket(this._from)) {
        if (!this.appendFunctionCall(ret, current.getPosition(), false)) {
          const ret = new GeneratedCode();
          ret.success = false;
          return;
        }
      }
    }
  }

  private compileComprehension(value: GeneratedCode): GeneratedCode {
    const lastToken = this._tokens[this._tokens.length - 1];
    const parts: CompilerBlockContext[] = [];
    while (this._from < this._end) {
      let token = this._tokens[this._from];
      if (token.type !== TokenType.Keyword) {
        break;
      }
      if (token.keyword === KeywordType.For) {
        this._from++;
        const forToken = token;
        token = this._tokens[this._from];
        if (!isIdentifier(token)) {
          this._compilerContext.addError(PyErrorType.ComprehensionExpectedIdentifier, token || lastToken);
          value.success = false;
          return value;
        }
        const id = token.identifier;
        this._from++;
        token = this._tokens[this._from];
        if (!isKeywordIn(token)) {
          this._compilerContext.addError(PyErrorType.ComprehensionExpectedInKeyword, token || lastToken);
          value.success = false;
          return value;
        }
        this._from++;
        const expression = this.compileInternal(this._from, false, false, true);
        if (!expression.success) {
          value.success = false;
          return value;
        }
        this._from = expression.finish;
        const part = new CompilerBlockContext();
        part.position = forToken.getPosition();
        part.type = CompilerBlockType.For;
        part.arg1 = id;
        part.arg2 = expression;
        parts.push(part);
      } else if (token.keyword === KeywordType.If) {
        this._from++;
        const expression = this.compileInternal(this._from, false, false, true);
        if (!expression.success) {
          value.success = false;
          return value;
        }
        this._from = expression.finish;
        const part = new CompilerBlockContext();
        part.position = token.getPosition();
        part.type = CompilerBlockType.If;
        part.arg2 = expression;
        parts.push(part);
      } else {
        break;
      }
    }

    return CodeGenerator.comprehension(value, parts, this._compilerContext);
  }

  private compileListInstantiation(startToken: Token, values: GeneratedCode[]): boolean {
    const records: GeneratedCode[] = [];
    let token = startToken;
    for (;;) {
      let prevToken = token || startToken;
      token = this._tokens[this._from];
      if (!token) {
        this._compilerContext.addError(PyErrorType.ExpectedListDefinition, prevToken);
        return false;
      }
      if (isRightSquareBracket(token)) {
        this._from++;
        break;
      }
      const arg = this.compileInternal(this._from, false, records.length === 0, false);
      if (!arg.success) {
        return false;
      }
      this._from = arg.finish;
      if (this._from >= this._tokens.length) {
        // to not to duplicate error messages
        continue;
      }
      prevToken = token;
      token = this._tokens[this._from];
      if ((arg.comprehension || !isComma(token)) && !isRightSquareBracket(token)) {
        const source = token || prevToken;
        this._compilerContext.addError(PyErrorType.ListExpectedCommaOrRightSquareBracket, source);
        return false;
      }
      records.push(arg);
      if (token.delimiter === DelimiterType.Comma) {
        this._from++;
        continue;
      }
      // should be right square bracket
      this._from++;
      break;
    }
    if (records.length === 1 && records[0].comprehension) {
      values.push(records[0]);
      return true;
    }
    const array = CodeGenerator.list(records, startToken.getPosition());
    if (!array.success) {
      return false;
    }
    values.push(array);
    return true;
  }

  private compileTupleInstantiation(startToken: Token, values: GeneratedCode[]): boolean {
    const records: GeneratedCode[] = [];
    let token = startToken;
    for (;;) {
      let prevToken = token;
      token = this._tokens[this._from];
      if (!token) {
        this._compilerContext.addError(PyErrorType.ExpectedTupleBody, prevToken);
        return false;
      }
      if (isRightBracket(token)) {
        this._from++;
        // empty tuple
        break;
      }
      if (isComma(token)) {
        this._from++;
        continue;
      }
      const record = this.compileInternal(this._from, false, false, false);
      if (!record.success) {
        return false;
      }
      this._from = record.finish;
      records.push(record);
      prevToken = token;
      token = this._tokens[this._from];
      if (!isRightBracket(token) && !isComma(token)) {
        const source = token || prevToken;
        this._compilerContext.addError(PyErrorType.ExpectedTupleEnd, source);
        return false;
      }
      if (isRightBracket(token)) {
        this._from++;
        if (records.length === 1) {
          // it is not tuple, just parenthesis
          values.push(records[0]);
          return true;
        }
        break;
      }
      // it is comma
      this._from++;
    }
    const tuple = CodeGenerator.tuple(records, startToken.getPosition());
    if (!tuple.success) {
      return false;
    }
    values.push(tuple);
    return true;
  }

  private compileSetOrDictionary(startToken: Token, values: GeneratedCode[]): boolean {
    const records: GeneratedCode[] = [];
    const literals: string[] = [];
    let isDictionary = false;
    let token = startToken;
    for (;;) {
      let prevToken = token;
      token = this._tokens[this._from];
      if (!token) {
        this._compilerContext.addError(PyErrorType.ExpectedSetBody, prevToken);
        return false;
      }
      if (isRightFigureBracket(token)) {
        this._from++;
        // empty set
        break;
      }
      if (isComma(token)) {
        this._from++;
        continue;
      }
      let literalIndex = -1;
      if (isLiteral(token) && isColon(this._tokens[this._from + 1])) {
        if (!isDictionary && records.length) {
          this._compilerContext.addError(PyErrorType.SetMixedWithAndWithoutColon, this._tokens[this._from + 1]);
          return false;
        }
        isDictionary = true;
        literalIndex = token.literal;
        this._from += 2;
      }
      if (literalIndex === -1 && isDictionary) {
        this._compilerContext.addError(PyErrorType.SetMixedWithAndWithoutColon, token);
        return false;
      }
      const record = this.compileInternal(this._from, false, false, false);
      if (!record.success) {
        return false;
      }
      this._from = record.finish;
      records.push(record);
      if (isDictionary) {
        const literal = this._compiledCode.literals[literalIndex];
        if ((literal.type & LiteralType.LiteralMask) !== LiteralType.String) {
          this._compilerContext.addError(PyErrorType.ExpectedStringLiteralInSet, token);
          return false;
        }
        literals.push(literal.string);
      }
      prevToken = token;
      token = this._tokens[this._from];
      if (isRightFigureBracket(token)) {
        this._from++;
        break;
      }
      if (!isComma(token)) {
        this._compilerContext.addError(PyErrorType.ExpectedSetEnd, prevToken);
        return false;
      }
      // means it is comma
      this._from++;
    }
    const code = isDictionary
      ? CodeGenerator.dictionary(literals, records, this._compilerContext, startToken.getPosition())
      : CodeGenerator.set(records, startToken.getPosition());
    if (!code.success) {
      return false;
    }
    values.push(code);
    return true;
  }

  private compileIfExpression(condition: GeneratedCode, from: Token): GeneratedCode {
    this._from++;
    const ifExpression = this.compileInternal(this._from, false, false, false);
    if (!ifExpression.success) {
      return ifExpression;
    }
    this._from = ifExpression.finish;
    const token = this._tokens[this._from];
    if (this._from >= this._end || !isKeywordElse(token)) {
      const source = token || this._tokens[this._tokens.length - 1];
      this._compilerContext.addError(PyErrorType.IfExpressionExpectedElse, source);
      const ret = new GeneratedCode();
      ret.success = false;
      return ret;
    }

    this._from++;
    const elseExpression = this.compileInternal(this._from, false, false, false);
    if (!elseExpression.success) {
      return elseExpression;
    }

    this._from = elseExpression.finish;

    const ret = CodeGenerator.conditionalExpression(condition, ifExpression, elseExpression, this._compilerContext, from.getPosition());
    ret.finish = this._from;
    return ret;
  }

  private compileLambdaExpression(startToken: Token): GeneratedCode {
    this._from++;
    const args: number[] = [];
    for (;;) {
      const token = this._tokens[this._from];
      const nextToken = this._tokens[this._from + 1];
      if (isColon(token)) {
        break;
      }
      if (!isIdentifier(token) || (!isColon(nextToken) && !isComma(nextToken))) {
        this._compilerContext.addError(PyErrorType.ExpectedFunctionArgumentList, token || this._tokens[this._tokens.length - 1]);
        const ret = new GeneratedCode();
        ret.success = false;
        return ret;
      }
      args.push(token.identifier);
      this._from += 2;
      if (isColon(nextToken)) {
        break;
      }
    }
    const body = this.compileInternal(this._from, false, false, false);
    body.add(InstructionType.Ret, startToken.getPosition(), 0);
    this._from = body.finish;
    const func = new FunctionBody();
    const funcDef = this._compiledCode.functions.length;
    this._compiledCode.functions.push(func);
    func.module = this._compiledCode;
    func.type = FunctionType.Regular;
    func.name = this._compilerContext.getLambdaFunctionName();
    func.arguments = args.map(arg => {
      const ret = new FunctionArgument();
      ret.type = ArgumentType.Normal;
      ret.id = arg;
      ret.initReg = -1;
      return ret;
    });
    func.code = body.code;
    return CodeGenerator.readFunctionDef(funcDef, startToken.getPosition());
  }

  private compileValue(from: number): GeneratedCode {
    const token = this._tokens[from];
    let ret: GeneratedCode;
    if (token.type === TokenType.Keyword) {
      switch (token.keyword) {
        case KeywordType.False:
          ret = CodeGenerator.bool(0, token.getPosition());
          break;
        case KeywordType.True:
          ret = CodeGenerator.bool(1, token.getPosition());
          break;
        case KeywordType.None:
          ret = CodeGenerator.none(token.getPosition());
          break;
      }
      if (ret && ret.success) {
        ret.finish = from + 1;
        return ret;
      }
    }
    if (!isLiteral(token)) {
      this._compilerContext.addError(PyErrorType.ExpectedLiteral, token);
      ret = new GeneratedCode();
      ret.success = false;
      return ret;
    }
    const literal = this._compiledCode.literals[token.literal];
    ret = CodeGenerator.literal(literal, this._compilerContext, token.getPosition());
    if (ret.success) {
      ret.finish = from + 1;
    }
    return ret;
  }
}
