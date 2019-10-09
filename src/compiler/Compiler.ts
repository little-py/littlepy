import { GeneratedCode } from '../common/Instructions';
import { LexicalContext } from './LexicalContext';
import { CompilerContext } from './CompilerContext';
import {
  DelimiterType,
  isAssignmentDelimiter,
  isBlockKeyword,
  isColon,
  isComma,
  isDelimiterEqual,
  isIdentifier,
  isKeywordAs,
  isLeftBracket,
  isOperatorMultiply,
  isPoint,
  isRightBracket,
  isSemicolon,
  OperatorType,
  Token,
  TokenPosition,
  TokenType,
} from './Token';
import { ArgumentType, createDebugInformation, FunctionArgument, FunctionBody, FunctionType } from '../common/FunctionBody';
import { CodeGenerator } from './CodeGenerator';
import { KeywordType } from './Keyword';
import { ExpressionCompiler } from './ExpressionCompiler';
import { CompiledModule } from './CompiledModule';
import { LexicalAnalyzer } from './LexicalAnalyzer';
import { CompilerBlockContext, CompilerBlockType } from './CompilerBlockContext';
import { InstructionType } from '../common/InstructionType';
import { RowDescriptor } from '../api/RowDescriptor';
import { RowType } from '../api/RowType';
import { PyErrorType } from '../api/ErrorType';
import { LiteralType } from './Literal';
import { ReferenceScope } from '../common/ReferenceScope';

function getAssignmentInstruction(assignmentOperator: Token): InstructionType {
  let opType = InstructionType.Pass;
  if (assignmentOperator.type === TokenType.Delimiter) {
    switch (assignmentOperator.delimiter) {
      case DelimiterType.EqualPlus:
        opType = InstructionType.Add;
        break;
      case DelimiterType.EqualMinus:
        opType = InstructionType.Sub;
        break;
      case DelimiterType.EqualMultiply:
        opType = InstructionType.Mul;
        break;
      case DelimiterType.EqualDivide:
        opType = InstructionType.Div;
        break;
      case DelimiterType.EqualFloorDivide:
        opType = InstructionType.Floor;
        break;
      case DelimiterType.EqualModulus:
        opType = InstructionType.Mod;
        break;
      case DelimiterType.EqualAt:
        opType = InstructionType.At;
        break;
      case DelimiterType.EqualAnd:
        opType = InstructionType.BinAnd;
        break;
      case DelimiterType.EqualOr:
        opType = InstructionType.BinOr;
        break;
      case DelimiterType.EqualXor:
        opType = InstructionType.BinXor;
        break;
      case DelimiterType.EqualShiftRight:
        opType = InstructionType.Shr;
        break;
      case DelimiterType.EqualShiftLeft:
        opType = InstructionType.Shl;
        break;
      case DelimiterType.EqualPower:
        opType = InstructionType.Pow;
        break;
    }
  }
  return opType;
}

export class Compiler {
  private readonly _compiledModule: CompiledModule;
  private readonly _compilerContext: CompilerContext;
  private readonly _lexicalContext: LexicalContext;
  private readonly _calculateExpression: boolean;
  private _pendingFinishedBlocks: CompilerBlockContext[] = [];
  private _pendingIndentedTokens: Token[] = [];
  private _line: Token[];
  private _offset: number;
  private _indent: number;
  private _insideIndentedBlocks = false;

  private constructor(code: CompiledModule, lexicalContext: LexicalContext, calculateExpression: boolean) {
    this._compiledModule = code;
    this._calculateExpression = calculateExpression;
    this._compilerContext = new CompilerContext(code);
    this._lexicalContext = lexicalContext;
    this._offset = 0;
    this._indent = 0;
  }

  public static compileModule(
    name: string,
    id: string,
    text: string,
    wrapWithPrint: boolean,
  ): {
    code: CompiledModule;
    rows: RowDescriptor[];
  } {
    const compiledCode = new CompiledModule();
    const lexicalAnalyzer = new LexicalAnalyzer(compiledCode);
    const lexicalContext = new LexicalContext(compiledCode);
    lexicalAnalyzer.parse(text, lexicalContext);
    const compiler = new Compiler(compiledCode, lexicalContext, wrapWithPrint);
    compiler.compileModuleWithContext(name);
    compiledCode.name = name;
    compiledCode.id = id;
    delete compiledCode.tokens;
    return { code: compiledCode, rows: compiler._compilerContext.rowDescriptors };
  }

  private compileModuleWithContext(name: string): boolean {
    const block = this._compilerContext.enterBlock(this._compiledModule.tokens[0].getPosition());
    block.type = CompilerBlockType.Module;
    block.indent = -1;
    block.path = name;
    block.index = 0;
    block.arg1 = this._compiledModule.functions.length;

    this._offset = 0;
    this._indent = 0;

    while (this._offset < this._compiledModule.tokens.length) {
      if (!this.scanLine()) {
        return false;
      }
      if (!this._line.length) {
        continue;
      }
      if (this._calculateExpression) {
        this.parseLineAsExpression();
      } else {
        this.parseCombinedLine();
      }
      if (this._pendingIndentedTokens.length) {
        this._line = this._pendingIndentedTokens;
        this._pendingIndentedTokens = [];
        this._indent++;
        this._compilerContext.updateRowDescriptor({
          isInline: true,
        });
        this._insideIndentedBlocks = true;
        this.parseCombinedLine();
        this._insideIndentedBlocks = false;
        this._indent--;
        if (!this.finishBlock(this._line[this._line.length - 1])) {
          return false;
        }
      }
    }

    if (this._pendingFinishedBlocks.length) {
      this.parseFinishedBlocks(this._line[this._line.length - 1]);
    }

    while (this._compilerContext.getBlockCount() > 1) {
      this.finishBlock(this._line[this._line.length - 1]);
    }

    const func = new FunctionBody();
    this._compiledModule.functions.push(func);
    func.module = this._compiledModule;
    func.name = name;
    func.type = FunctionType.Module;
    func.code = CodeGenerator.copyCode(block.blockCode);
    func.initialize();

    return true;
  }

  private scanLine(): boolean {
    let lineStart = this._offset;
    this._line = [];
    while (this._offset < this._compiledModule.tokens.length) {
      const token = this._compiledModule.tokens[this._offset];
      if (token.type === TokenType.Comment) {
        if (lineStart === this._offset) {
          this._compilerContext.row = token.row;
          this._compilerContext.setRowType(RowType.Comment);
          lineStart++;
        }
        this._offset++;
        continue;
      }
      if (token.type === TokenType.Indent) {
        if (lineStart === this._offset) {
          lineStart++;
        }
        this._indent++;
        this._offset++;
      } else if (token.type === TokenType.Dedent) {
        this._indent--;
        this._offset++;
        if (!this.finishBlock(token)) {
          return false;
        }
      } else if (token.type === TokenType.NewLine) {
        if (lineStart === this._offset) {
          lineStart++;
          this._offset++;
        } else {
          break;
        }
      } else {
        this._line.push(token);
        this._offset++;
      }
    }
    if (lineStart < this._compiledModule.tokens.length) {
      this._compilerContext.row = this._compiledModule.tokens[lineStart].row;
    }
    return true;
  }

  private finishBlock(token: Token): boolean {
    const block = this._compilerContext.getCurrentBlock();
    const parentBlock = block.parent;

    if (this._pendingFinishedBlocks.length > 0) {
      const pending = this._pendingFinishedBlocks[0];
      if (pending.indent > block.indent) {
        this.parseFinishedBlocks(token);
      }
    }

    createDebugInformation(this._compiledModule, block.blockCode.code);

    if (!parentBlock) {
      if (block.type === CompilerBlockType.Module) {
        return true;
      }
      this._compilerContext.addError(PyErrorType.UnexpectedBlockEnd, token);
      return false;
    }

    switch (block.type) {
      case CompilerBlockType.For:
        this._pendingFinishedBlocks.push(block);
        break;
      case CompilerBlockType.While:
        const whileCode = CodeGenerator.whileCycle(block.arg2, block.blockCode, this._compilerContext, block.position);
        CodeGenerator.appendTo(parentBlock.blockCode, whileCode);
        break;
      case CompilerBlockType.Module:
      case CompilerBlockType.Class:
      case CompilerBlockType.Function: {
        const func = this._compiledModule.functions[block.arg1];
        func.code = CodeGenerator.copyCode(block.blockCode);
        func.documentation = block.documentation;
        func.initialize();
        this._compilerContext.leaveBlock();
        if (block.type === CompilerBlockType.Function || block.type === CompilerBlockType.Class) {
          if (!this.declareFunction(block.arg1, block.position)) {
            return false;
          }
        }
        return true;
      }
      case CompilerBlockType.With: {
        const withCode = CodeGenerator.with(block.arg1, block.arg2, block.blockCode, this._compilerContext, block.position);
        CodeGenerator.appendTo(parentBlock.blockCode, withCode);
        break;
      }
      case CompilerBlockType.If:
      case CompilerBlockType.Try:
      case CompilerBlockType.Else:
      case CompilerBlockType.ElseIf:
      case CompilerBlockType.Except:
      case CompilerBlockType.Finally: {
        this._pendingFinishedBlocks.push(block);
        break;
      }
    }
    this._compilerContext.leaveBlock();
    return true;
  }

  private finishIfBlock() {
    const ifCode = CodeGenerator.condition(this._pendingFinishedBlocks, this._compilerContext);
    CodeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, ifCode);
    return true;
  }

  private finishTryBlock() {
    const tryCode = CodeGenerator.tryExcept(this._pendingFinishedBlocks, this._compilerContext);
    CodeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, tryCode);
    return true;
  }

  private finishForBlock() {
    const forCode = CodeGenerator.forCycle(this._pendingFinishedBlocks, this._compilerContext);
    CodeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, forCode);
    return true;
  }

  private parseFinishedBlocks(nextToken: Token) {
    const firstBlock = this._pendingFinishedBlocks[0];
    if (firstBlock.indent < this._indent) {
      return;
    }
    const keyword =
      firstBlock.indent === this._indent && nextToken && nextToken.type === TokenType.Keyword ? (nextToken.keyword as KeywordType) : KeywordType.Pass;
    switch (firstBlock.type) {
      case CompilerBlockType.If:
        switch (keyword) {
          case KeywordType.Else:
          case KeywordType.Elif:
            return;
        }
        this.finishIfBlock();
        break;
      case CompilerBlockType.Try:
        switch (keyword) {
          case KeywordType.Except:
          case KeywordType.Finally:
          case KeywordType.Else:
            return;
        }
        this.finishTryBlock();
        break;
      case CompilerBlockType.For:
        if (this._pendingFinishedBlocks.length === 1 && keyword === KeywordType.Else) {
          return;
        }
        this.finishForBlock();
        break;
    }
    this._pendingFinishedBlocks = [];
  }

  private parseCombinedLine(): boolean {
    if (isBlockKeyword(this._line[0]) || this._line.findIndex(t => isSemicolon(t)) < 0) {
      return this.parseLine(false);
    }
    let originalLine = this._line;
    while (originalLine.length) {
      const semi = originalLine.findIndex(t => isSemicolon(t));
      if (semi < 0) {
        this._line = originalLine;
        return this.parseLine(true);
      }
      this._line = originalLine.slice(0, semi);
      if (!this.parseLine(true)) {
        return false;
      }
      originalLine = originalLine.slice(semi + 1);
    }
  }

  private parseLine(isFromCombinedLine: boolean): boolean {
    const first = this._line[0];
    if (isFromCombinedLine || this._insideIndentedBlocks) {
      if (isBlockKeyword(first)) {
        this._compilerContext.addError(PyErrorType.BlockInCombinedLine, first);
        return false;
      }
    }
    if (this._pendingFinishedBlocks.length) {
      this.parseFinishedBlocks(first);
    }
    if (first.type === TokenType.Keyword) {
      switch (first.keyword) {
        case KeywordType.Def:
          return this.parseFunctionDefinition();
        case KeywordType.For:
          return this.parseForDefinition();
        case KeywordType.While:
          return this.parseWhileDefinition();
        case KeywordType.If:
        case KeywordType.Elif:
          return this.parseIfElifDefinition();
        case KeywordType.Else:
          return this.parseElseDefinition();
        case KeywordType.Class:
          return this.parseClassDefinition();
        case KeywordType.Import:
          return this.parseImportDefinition();
        case KeywordType.Del:
          return this.parseDelDefinition();
        case KeywordType.From:
          return this.parseImportFromDefinition();
        case KeywordType.Pass:
          return this.parsePassDefinition();
        case KeywordType.Raise:
          return this.parseRaiseDefinition();
        case KeywordType.Return:
          return this.parseReturnDefinition();
        case KeywordType.Try:
          return this.parseTryDefinition();
        case KeywordType.Except:
          return this.parseExceptDefinition();
        case KeywordType.Finally:
          return this.parseFinallyDefinition();
        case KeywordType.Break:
          return this.parseBreakDefinition();
        case KeywordType.Continue:
          return this.parseContinueDefinition();
        case KeywordType.Yield:
          return this.parseYieldDefinition();
        case KeywordType.With:
          return this.parseWithDefinition();
        case KeywordType.Global:
        case KeywordType.NonLocal:
          return this.parseScopeDefinition();
      }
    } else if (first.type === TokenType.Literal) {
      const literal = this._compiledModule.literals[first.literal];
      if ((literal.type & LiteralType.LiteralMask) === LiteralType.String) {
        const block = this._compilerContext.getCurrentBlock();
        if ((block.type === CompilerBlockType.Function || block.type === CompilerBlockType.Class) && block.blockCode.code.length === 0) {
          block.documentation = literal.string;
        }
      }
    }
    return this.parseAssignmentOrCallOperator();
  }

  private parseEndOfBlockDefinition(from: number): boolean {
    if (!isColon(this._line[from])) {
      const block = this._line[from] || this._line[this._line.length - 1];
      this._compilerContext.addError(PyErrorType.BlockExpectedColon, block);
      return false;
    }
    if (from + 1 < this._line.length) {
      this._pendingIndentedTokens = this._line.slice(from + 1);
    }
    return true;
  }

  private parseForDefinition(): boolean {
    const first = this._line[0];
    if (this._line.length < 4) {
      this._compilerContext.addError(PyErrorType.IncompleteForDefinition, first);
      return false;
    }
    const argument = this._line[1];
    const keyword = this._line[2];
    if (argument.type !== TokenType.Identifier) {
      this._compilerContext.addError(PyErrorType.ForExpectedArgument, argument);
      return false;
    }
    if (keyword.type !== TokenType.Keyword || keyword.keyword !== KeywordType.In) {
      this._compilerContext.addError(PyErrorType.ForExpectedIn, keyword);
      return false;
    }
    const expression = ExpressionCompiler.compile({
      tokens: this._line,
      compiledCode: this._compiledModule,
      compilerContext: this._compilerContext,
      lexicalContext: this._lexicalContext,
      start: 3,
    });
    if (!expression.success) {
      return false;
    }

    this._compilerContext.setRowType(RowType.ForCycle);

    const block = this._compilerContext.enterBlock(first.getPosition());
    block.arg1 = argument.identifier;
    block.type = CompilerBlockType.For;
    block.arg2 = expression;
    block.indent = this._indent;

    const parent = block.parent;
    parent.index++;
    block.path = parent.path + '.' + parent.index.toString();

    return this.parseEndOfBlockDefinition(expression.finish);
  }

  private parseWhileDefinition(): boolean {
    if (this._line.length < 3) {
      const last = this._line[this._line.length - 1];
      this._compilerContext.addError(PyErrorType.IncompleteWhileDefinition, last);
      return false;
    }
    const expression = ExpressionCompiler.compile({
      tokens: this._line,
      compiledCode: this._compiledModule,
      compilerContext: this._compilerContext,
      lexicalContext: this._lexicalContext,
      start: 1,
    });
    if (!expression.success) {
      return false;
    }

    this._compilerContext.setRowType(RowType.WhileCycle);

    const block = this._compilerContext.enterBlock(this._line[0].getPosition());
    block.type = CompilerBlockType.While;
    block.arg2 = expression;
    block.indent = this._indent;

    const parent = block.parent;
    parent.index++;
    block.path = parent.path + '.' + parent.index.toString();

    return this.parseEndOfBlockDefinition(expression.finish);
  }

  private parseFunctionDefinition(): boolean {
    if (this._line.length < 5) {
      const last = this._line[this._line.length - 1];
      this._compilerContext.addError(PyErrorType.IncompleteFunctionDeclaration, last);
      return false;
    }

    const identifier = this._line[1];
    if (identifier.type !== TokenType.Identifier) {
      this._compilerContext.addError(PyErrorType.ExpectedFunctionName, identifier);
      return false;
    }

    const open = this._line[2];
    if (!isLeftBracket(open)) {
      this._compilerContext.addError(PyErrorType.ExpectedFunctionArgumentList, open);
      return false;
    }
    this._compilerContext.setRowType(RowType.FunctionDefinition);
    const func = new FunctionBody();
    this._compiledModule.functions.push(func);
    func.module = this._compiledModule;
    func.type = FunctionType.Regular;
    func.name = this._compiledModule.identifiers[identifier.identifier];
    let initializeIndex = 2; // first two registers are used in declareFunction()

    let from = 3;
    while (from < this._line.length) {
      let current = this._line[from];
      if (isRightBracket(current)) {
        from++;
        break;
      }
      let starCount = 0;
      if (isOperatorMultiply(current)) {
        starCount = 1;
        from++;
        current = this._line[from];
      } else if (current && current.type === TokenType.Operator && current.operator === OperatorType.Power) {
        starCount = 2;
        from++;
        current = this._line[from];
      }
      if (current.type !== TokenType.Identifier) {
        this._compilerContext.addError(PyErrorType.ExpectedArgumentName, current);
        return false;
      }
      const arg = new FunctionArgument();
      switch (starCount) {
        case 0:
          arg.type = ArgumentType.Normal;
          break;
        case 1:
          arg.type = ArgumentType.ArbitraryArguments;
          break;
        case 2:
          arg.type = ArgumentType.KeywordArguments;
          break;
      }
      func.arguments.push(arg);
      arg.id = current.identifier;
      arg.initReg = -1;
      from++;
      current = this._line[from];
      if (current.type !== TokenType.Delimiter) {
        continue;
      }
      if (current.delimiter === DelimiterType.Comma) {
        from++;
        continue;
      }
      if (current.delimiter !== DelimiterType.EqualSign) {
        continue;
      }
      from++;
      const defaultValue = ExpressionCompiler.compile({
        tokens: this._line,
        compiledCode: this._compiledModule,
        compilerContext: this._compilerContext,
        lexicalContext: this._lexicalContext,
        start: from,
      });
      if (!defaultValue.success) {
        return false;
      }
      from = defaultValue.finish;
      if (from >= this._line.length) {
        current = this._line[this._line.length - 1];
        this._compilerContext.addError(PyErrorType.IncompleteFunctionArgumentList, current);
        return false;
      }
      CodeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, defaultValue, initializeIndex);
      arg.initReg = initializeIndex++;

      current = this._line[from];
      if (isComma(current)) {
        from++;
        continue;
      }
      if (isRightBracket(current)) {
        from++;
        break;
      }

      this._compilerContext.addError(PyErrorType.ExpectedEndOfFunctionDef, current);
      return false;
    }

    const block = this._compilerContext.enterBlock(this._line[0].getPosition());
    block.type = CompilerBlockType.Function;
    block.arg1 = this._compiledModule.functions.length - 1;
    block.indent = this._indent;

    const parent = block.parent;
    parent.index++;
    block.path = parent.path + '.' + func.name;

    if (parent.type === CompilerBlockType.Class) {
      func.parent = parent.arg1;
      func.type = FunctionType.ClassMember;
    } else {
      func.type = FunctionType.Regular;
    }

    return this.parseEndOfBlockDefinition(from);
  }

  private parseClassDefinition(): boolean {
    const first = this._line[0];

    if (this._line.length < 3) {
      const last = this._line[this._line.length - 1];
      this._compilerContext.addError(PyErrorType.IncompleteClassDeclaration, last);
      return false;
    }

    const className = this._line[1];

    if (!isIdentifier(className)) {
      this._compilerContext.addError(PyErrorType.ExpectedClassName, className);
      return false;
    }

    const inheritsFrom: string[] = [];

    let position = 2;

    if (this._line.length > 3 && isLeftBracket(this._line[2])) {
      for (position = 3; position < this._line.length; ) {
        const current = this._line[position];
        if (!isIdentifier(current)) {
          this._compilerContext.addError(PyErrorType.IncorrectInheritanceList, current);
          return false;
        }
        let id = this._compiledModule.identifiers[current.identifier];
        position++;
        while (isPoint(this._line[position]) && isIdentifier(this._line[position + 1])) {
          position++;
          id += `.${this._compiledModule.identifiers[this._line[position].identifier]}`;
          position++;
        }
        inheritsFrom.push(id);
        if (isRightBracket(this._line[position])) {
          break;
        }
        if (!isComma(this._line[position])) {
          this._compilerContext.addError(PyErrorType.IncorrectInheritanceList, current);
          return false;
        }
        position++;
      }
      if (!isRightBracket(this._line[position])) {
        this._compilerContext.addError(PyErrorType.IncorrectInheritanceList, this._line[position] || this._line[this._line.length - 1]);
        return false;
      }
      position++;
    }

    const identifier = className.identifier;

    const func = new FunctionBody();
    this._compiledModule.functions.push(func);
    func.name = this._compiledModule.identifiers[identifier];
    func.module = this._compiledModule;
    func.inheritsFrom = inheritsFrom;

    const block = this._compilerContext.enterBlock(first.getPosition());
    block.type = CompilerBlockType.Class;
    block.arg1 = this._compiledModule.functions.length - 1;
    block.indent = this._indent;
    func.type = FunctionType.Class;

    return this.parseEndOfBlockDefinition(position);
  }

  private parseIfElifDefinition(): boolean {
    const first = this._line[0];

    if (first.keyword === KeywordType.Elif) {
      const firstBlock = this._pendingFinishedBlocks[0];
      if (!firstBlock || firstBlock.type !== CompilerBlockType.If) {
        this._compilerContext.addError(PyErrorType.CannotFindIfOrElifForElif, first);
        return false;
      }
    }

    const expression = ExpressionCompiler.compile({
      tokens: this._line,
      compiledCode: this._compiledModule,
      compilerContext: this._compilerContext,
      lexicalContext: this._lexicalContext,
      start: 1,
    });
    if (!expression.success) {
      return false;
    }
    const isIf = first.keyword === KeywordType.If;
    this._compilerContext.setRowType(isIf ? RowType.IfBlock : RowType.ElifBlock);
    const block = this._compilerContext.enterBlock(first.getPosition());
    block.type = isIf ? CompilerBlockType.If : CompilerBlockType.ElseIf;
    block.arg2 = expression;
    block.indent = this._indent;

    return this.parseEndOfBlockDefinition(expression.finish);
  }

  private parseElseDefinition(): boolean {
    const first = this._line[0];
    const firstBlock = this._pendingFinishedBlocks[0];
    if (
      !firstBlock ||
      (firstBlock.type !== CompilerBlockType.If && firstBlock.type !== CompilerBlockType.For && firstBlock.type !== CompilerBlockType.Try)
    ) {
      this._compilerContext.addError(PyErrorType.CannotFindIfOrElifForElse, first);
      return false;
    }

    this._compilerContext.setRowType(RowType.ElseBlock);

    const block = this._compilerContext.enterBlock(first.getPosition());
    block.type = CompilerBlockType.Else;
    block.indent = this._indent;

    return this.parseEndOfBlockDefinition(1);
  }

  private parseImportDefinition(): boolean {
    const first = this._line[0];
    if (this._line.length < 2) {
      this._compilerContext.addError(PyErrorType.IncompleteImportDefinition, first);
      return false;
    }
    let rename: Token;
    const name = this._line[1];
    if (this._line.length > 2) {
      const source = this._line[2];
      if (source.type !== TokenType.Keyword || source.keyword !== KeywordType.As || this._line.length !== 4) {
        this._compilerContext.addError(PyErrorType.ImportDefinitionIsTooLong, source);
      }
      rename = this._line[3];
    }
    if (name.type !== TokenType.Identifier) {
      this._compilerContext.addError(PyErrorType.ImportExpectedIdentifier, first);
      return false;
    }
    if (rename && rename.type !== TokenType.Identifier) {
      this._compilerContext.addError(PyErrorType.ImportExpectedAsIdentifier, first);
      return false;
    }
    const imp = rename
      ? CodeGenerator.importAsDirective(
          this._compiledModule.identifiers[name.identifier],
          this._compiledModule.identifiers[rename.identifier],
          this._compilerContext,
          first.getPosition(),
        )
      : CodeGenerator.importDirective(this._compiledModule.identifiers[name.identifier], this._compilerContext, first.getPosition());
    this._compilerContext.setRowType(rename ? RowType.ImportAs : RowType.Import);
    CodeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, imp);
    return true;
  }

  private parseImportFromDefinition(): boolean {
    const first = this._line[0];
    if (this._line.length < 4) {
      this._compilerContext.addError(PyErrorType.IncompleteImportFromDefinition, first);
      return false;
    }
    if (this._line.length > 4) {
      this._compilerContext.addError(PyErrorType.ImportFromDefinitionIsTooLong, first);
      return false;
    }
    if (this._line[2].type !== TokenType.Keyword || this._line[2].keyword !== KeywordType.Import) {
      this._compilerContext.addError(PyErrorType.ImportFromExpectedImport, first);
      return false;
    }
    const module = this._line[1];
    const func = this._line[3];
    if (!isIdentifier(module) || !isIdentifier(func)) {
      this._compilerContext.addError(PyErrorType.ImportFromExpectedIdentifier, first);
      return false;
    }
    const imp = CodeGenerator.importFromDirective(
      this._compiledModule.identifiers[func.identifier],
      this._compiledModule.identifiers[module.identifier],
      this._compilerContext,
      first.getPosition(),
    );
    this._compilerContext.setRowType(RowType.ImportFrom);
    CodeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, imp);
    return true;
  }

  private parseBreakDefinition(): boolean {
    const first = this._line[0];
    if (this._line.length !== 1) {
      this._compilerContext.addError(PyErrorType.BreakHasNoArguments, first);
      return false;
    }
    this._compilerContext.setRowType(RowType.Break);
    const breakCode = CodeGenerator.breakCode(first.getPosition());
    CodeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, breakCode);
    return true;
  }

  private parseContinueDefinition(): boolean {
    const first = this._line[0];
    if (this._line.length !== 1) {
      this._compilerContext.addError(PyErrorType.ContinueHasNoArguments, first);
      return false;
    }
    this._compilerContext.setRowType(RowType.Continue);
    const continueCode = CodeGenerator.continueCode(first.getPosition());
    CodeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, continueCode);
    return true;
  }

  private parsePassDefinition(): boolean {
    const first = this._line[0];
    if (this._line.length !== 1) {
      this._compilerContext.addError(PyErrorType.PassHasNoArguments, first);
      return false;
    }
    this._compilerContext.setRowType(RowType.Pass);
    const pass = CodeGenerator.pass(first.getPosition());
    CodeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, pass);
    return true;
  }

  private parseRaiseDefinition(): boolean {
    const first = this._line[0];
    const expression = ExpressionCompiler.compile({
      tokens: this._line,
      compiledCode: this._compiledModule,
      compilerContext: this._compilerContext,
      lexicalContext: this._lexicalContext,
      start: 1,
    });
    if (!expression.success) {
      return false;
    }
    const from = expression.finish;
    if (from !== this._line.length) {
      this._compilerContext.addError(PyErrorType.RaiseExpectedEndOfLine, first);
      return false;
    }
    const raise = CodeGenerator.raise(expression, first.getPosition());
    this._compilerContext.setRowType(RowType.Raise);
    CodeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, raise);
    return true;
  }

  // at the moment it is only yield and return
  private parseKeywordAndExpression(): boolean {
    const first = this._line[0];
    let returnCode: GeneratedCode;
    if (this._line.length === 1) {
      switch (first.keyword) {
        case KeywordType.Return:
          returnCode = CodeGenerator.returnEmpty(first.getPosition());
          break;
        case KeywordType.Yield:
          this._compilerContext.addError(PyErrorType.ExpectedYieldExpression, first);
          return false;
        case KeywordType.Del:
          this._compilerContext.addError(PyErrorType.ExpectedIdentifierForDel, first);
          return false;
      }
    } else {
      const expression = ExpressionCompiler.compile({
        tokens: this._line,
        compiledCode: this._compiledModule,
        compilerContext: this._compilerContext,
        lexicalContext: this._lexicalContext,
        start: 1,
      });
      if (!expression.success) {
        return false;
      }
      const from = expression.finish;
      if (from !== this._line.length) {
        this._compilerContext.addError(PyErrorType.ReturnOrYieldExpectedEndOfLine, first);
        return false;
      }
      switch (first.keyword) {
        case KeywordType.Return:
          returnCode = CodeGenerator.returnValue(expression, first.getPosition());
          break;
        case KeywordType.Yield:
          returnCode = CodeGenerator.yield(expression, first.getPosition());
          break;
        case KeywordType.Del:
          returnCode = CodeGenerator.delete(expression, first.getPosition());
          break;
      }
    }
    switch (first.keyword) {
      case KeywordType.Return:
        this._compilerContext.setRowType(RowType.Return);
        break;
      case KeywordType.Yield:
        this._compilerContext.setRowType(RowType.Yield);
        break;
      case KeywordType.Del:
        this._compilerContext.setRowType(RowType.Del);
        break;
    }
    CodeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, returnCode);
    return true;
  }

  private parseYieldDefinition(): boolean {
    return this.parseKeywordAndExpression();
  }

  private parseReturnDefinition(): boolean {
    return this.parseKeywordAndExpression();
  }

  private parseTryDefinition(): boolean {
    const block = this._compilerContext.enterBlock(this._line[0].getPosition());
    block.type = CompilerBlockType.Try;
    block.indent = this._indent;

    this._compilerContext.setRowType(RowType.TryBlock);

    return this.parseEndOfBlockDefinition(1);
  }

  private parseWithDefinition(): boolean {
    const expression = ExpressionCompiler.compile({
      tokens: this._line,
      compiledCode: this._compiledModule,
      compilerContext: this._compilerContext,
      lexicalContext: this._lexicalContext,
      start: 1,
    });
    if (!expression.success) {
      return false;
    }
    const from = expression.finish;
    if (!isKeywordAs(this._line[from]) || !isIdentifier(this._line[from + 1])) {
      this._compilerContext.addError(PyErrorType.WithExpectedAs, this._line[from] || this._line[this._line.length - 1]);
      return false;
    }
    const block = this._compilerContext.enterBlock(this._line[0].getPosition());
    block.type = CompilerBlockType.With;
    block.indent = this._indent;
    block.arg1 = this._line[from + 1].identifier;
    block.arg2 = expression;
    this._compilerContext.setRowType(RowType.With);

    return this.parseEndOfBlockDefinition(from + 2);
  }

  private parseExceptDefinition(): boolean {
    const first = this._line[0];
    const firstBlock = this._pendingFinishedBlocks[0];
    if (!firstBlock || firstBlock.type !== CompilerBlockType.Try) {
      this._compilerContext.addError(PyErrorType.ExceptExpectedTry, first);
      return false;
    }

    const identifiers: number[] = [];

    let next = 1;
    let hasBracket = false;

    if (isLeftBracket(this._line[next])) {
      hasBracket = true;
      next++;
    }

    while (next < this._line.length) {
      if (isColon(this._line[next])) {
        break;
      }
      let id = '';
      while (isIdentifier(this._line[next]) && isPoint(this._line[next + 1])) {
        id += `${this._compiledModule.identifiers[this._line[next].identifier]}.`;
        next += 2;
      }
      if (!isIdentifier(this._line[next])) {
        this._compilerContext.addError(PyErrorType.ExceptExpectedIdentifier, this._line[next] || this._line[this._line.length - 1]);
        return false;
      }
      id += this._compiledModule.identifiers[this._line[next].identifier];
      next++;
      identifiers.push(this._compilerContext.getIdentifier(id));
      if (next >= this._line.length) {
        break;
      }
      if (!hasBracket) {
        break;
      }
      if (isRightBracket(this._line[next])) {
        break;
      }
      if (isComma(this._line[next])) {
        next++;
        continue;
      }
      this._compilerContext.addError(PyErrorType.ExceptExpectedRightBracket, this._line[next] || this._line[this._line.length - 1]);
      return false;
    }

    if (hasBracket) {
      if (!isRightBracket(this._line[next])) {
        this._compilerContext.addError(PyErrorType.ExceptExpectedRightBracket, this._line[next] || this._line[this._line.length - 1]);
        return false;
      }
      next++;
    }

    let exceptionIdentifier = -1;

    if (isKeywordAs(this._line[next])) {
      next++;
      if (!isIdentifier(this._line[next])) {
        const current = next < this._line.length ? this._line[next] : this._line[this._line.length - 1];
        this._compilerContext.addError(PyErrorType.ExceptExpectedIdentifierAfterAs, current);
        return false;
      }
      exceptionIdentifier = this._line[next].identifier;
      next++;
    }

    this._compilerContext.setRowType(RowType.ExceptBlock);

    const block = this._compilerContext.enterBlock(first.getPosition());
    block.type = CompilerBlockType.Except;
    block.indent = this._indent;
    block.arg1 = exceptionIdentifier;
    block.arg4 = identifiers;

    return this.parseEndOfBlockDefinition(next);
  }

  private parseFinallyDefinition(): boolean {
    const first = this._line[0];
    const firstBlock = this._pendingFinishedBlocks[0];
    if (!firstBlock || firstBlock.type !== CompilerBlockType.Try) {
      this._compilerContext.addError(PyErrorType.FinallyCannotFindTry, first);
      return false;
    }
    const block = this._compilerContext.enterBlock(first.getPosition());
    block.type = CompilerBlockType.Finally;
    block.indent = this._indent;

    this._compilerContext.setRowType(RowType.FinallyBlock);

    return this.parseEndOfBlockDefinition(1);
  }

  private parseAssignmentOrCallOperator(): boolean {
    let start = 0;
    const expressions: GeneratedCode[] = [];
    let isAugmented = false;
    let augmentedOperator: Token;
    while (start < this._line.length) {
      const expression = ExpressionCompiler.compile({
        tokens: this._line,
        compiledCode: this._compiledModule,
        compilerContext: this._compilerContext,
        lexicalContext: this._lexicalContext,
        start,
        parseTuple: true,
      });
      if (!expression.success) {
        return false;
      }
      expression.position = this._line[start].getPosition();
      start = expression.finish;
      expressions.push(expression);
      const token = this._line[start];
      if (!token || !isAssignmentDelimiter(token)) {
        break;
      }
      if (!isDelimiterEqual(token) || isAugmented) {
        if (expressions.length === 1) {
          isAugmented = true;
          augmentedOperator = token;
        } else {
          this._compilerContext.addError(PyErrorType.MixingAugmentedOperators, token);
          return false;
        }
      }
      start++;
      if (start >= this._line.length) {
        this._compilerContext.addError(PyErrorType.ExpectedExpressionValue, this._line[this._line.length - 1]);
        return false;
      }
    }

    // TODO: check if we want to throw error when expression output is unused
    // if (expressions.length === 1) {
    //   const current = this._line[start >= this._line.length ? start - 1 : start];
    //   this._compilerContext.addError(PyErrorType.Error_Compiler_ExpressionExpectedAssignmentOperator, current);
    //   return false;
    // }

    let result: GeneratedCode = expressions[expressions.length - 1];

    for (let i = expressions.length - 2; i >= 0; i--) {
      const assignment = expressions[i];
      CodeGenerator.appendTo(assignment, result, 1);
      if (isAugmented) {
        assignment.add(InstructionType.AugmentedCopy, assignment.position, 1, 0, 0, getAssignmentInstruction(augmentedOperator));
      } else {
        assignment.add(InstructionType.CopyValue, assignment.position, 1, 0);
      }
      result = assignment;
    }

    CodeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, result);

    if (expressions.length > 1) {
      this._compilerContext.setRowType(RowType.AssignmentOperator);
    }

    if (result.code.findIndex(c => c.isArrayIndex()) >= 0) {
      this._compilerContext.updateRowDescriptor({
        isArrayAssignment: true,
      });
    }

    if (result.code.findIndex(c => c.isOperator()) >= 0) {
      this._compilerContext.updateRowDescriptor({
        hasOperators: true,
      });
    }

    return true;
  }

  private parseDelDefinition(): boolean {
    return this.parseKeywordAndExpression();
  }

  private declareFunction(functionDef: number, position: TokenPosition): boolean {
    const func = this._compiledModule.functions[functionDef];
    const createFunction = CodeGenerator.readFunctionDef(functionDef, position);
    const identifiers: string[] = [func.name];
    const code = CodeGenerator.createReference(identifiers, this._compilerContext, position);
    // It is important not to touch registers starting from index 2 because they are used for default values
    CodeGenerator.appendTo(code, createFunction, 1);
    code.add(InstructionType.CopyValue, position, 1, 0);
    CodeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, code);
    return true;
  }

  private parseLineAsExpression() {
    const expression = ExpressionCompiler.compile({
      tokens: this._line,
      compiledCode: this._compiledModule,
      compilerContext: this._compilerContext,
      lexicalContext: this._lexicalContext,
      start: 0,
    });
    if (!expression.success) {
      return;
    } else if (expression.finish !== this._line.length) {
      this._compilerContext.addError(PyErrorType.ExpectedEndOfExpression, this._line[expression.finish]);
    }
    const print = new GeneratedCode();
    const first = this._line[0];
    print.add(InstructionType.ReadObject, first.getPosition(), this._compilerContext.getIdentifier('print'), 0);
    CodeGenerator.appendFunctionCall(print, [expression], this._compilerContext, this._line[0].getPosition(), false);
    CodeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, print);
  }

  private parseScopeDefinition(): boolean {
    if (this._line.length !== 2 || !isIdentifier(this._line[1])) {
      this._compilerContext.addError(PyErrorType.ExpectedOnlyIdentifier, this._line[1] || this._line[0]);
      return false;
    }
    const block = this._compilerContext.getCurrentBlock();
    const id = this._line[1].identifier;
    if (this._line[0].keyword === KeywordType.Global) {
      block.scopeChange[id] = ReferenceScope.Global;
    } else {
      block.scopeChange[id] = ReferenceScope.NonLocal;
    }
  }
}
