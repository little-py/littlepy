import { LexicalContext } from './LexicalContext';
import { CompilerContext } from '../api/CompilerContext';
import { DelimiterType, OperatorType, Token, TokenPosition, TokenType } from '../api/Token';
import { KeywordType } from '../api/Keyword';
import { ExpressionCompiler } from './ExpressionCompiler';
import { CompiledModule } from '../api/CompiledModule';
import { LexicalAnalyzer } from './LexicalAnalyzer';
import { RowDescriptor } from '../api/RowDescriptor';
import { RowType } from '../api/RowType';
import { PyErrorType } from '../api/ErrorType';
import {
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
} from './TokenUtils';
import { CompileOptions } from '../api/CompileOptions';
import { CodeGenerator } from '../api/CodeGenerator';
import { CodeGeneratorInst } from '../generator/CodeGeneratorInst';
import { CompilerBlockContext, CompilerBlockType } from '../api/CompilerBlockContext';
import { LiteralType } from '../api/Literal';
import { CodeFragment } from '../api/CodeFragment';
import { ReferenceScope } from '../api/ReferenceScope';
import { FunctionBody } from '../api/FunctionBody';
import { ArgumentType, FunctionArgument, FunctionType } from '../api/Function';

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
  private _expectIndent = false;
  private readonly _codeGenerator: CodeGenerator;

  private constructor(code: CompiledModule, lexicalContext: LexicalContext, options?: CompileOptions) {
    this._compiledModule = code;
    this._codeGenerator = (options && options.codeGenerator) || new CodeGeneratorInst();
    this._calculateExpression = options && options.wrapWithPrint;
    this._compilerContext = new CompilerContext(code);
    this._lexicalContext = lexicalContext;
    this._offset = 0;
    this._indent = 0;
  }

  public static compileModule(
    name: string,
    id: string,
    text: string,
    options?: CompileOptions,
  ): {
    code: CompiledModule;
    rows: RowDescriptor[];
  } {
    const compiledCode = new CompiledModule();
    const lexicalAnalyzer = new LexicalAnalyzer(compiledCode);
    const lexicalContext = new LexicalContext(compiledCode);
    lexicalAnalyzer.parse(text, lexicalContext);
    const compiler = new Compiler(compiledCode, lexicalContext, options);
    compiler.compileModuleWithContext(name);
    compiledCode.name = name;
    compiledCode.id = id;
    if (!options || !options.preserveTokens) {
      delete compiledCode.tokens;
    }
    return { code: compiledCode, rows: compiler._compilerContext.rowDescriptors };
  }

  private compileModuleWithContext(name: string): boolean {
    const block = this._compilerContext.enterBlock(this._compiledModule.tokens[0].getPosition(), this._codeGenerator.createFragment());
    block.type = CompilerBlockType.Module;
    block.indent = -1;
    block.path = name;
    block.index = 0;
    block.arg1 = this._compiledModule.functions.length;

    this._offset = 0;
    this._indent = 0;

    while (this._offset < this._compiledModule.tokens.length) {
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
          // safety check -- should never happen
          /* istanbul ignore next */
          return false;
        }
      }
      const lastIndent = this._indent;
      if (!this.scanLine()) {
        // safety check -- should never happen
        /* istanbul ignore next */
        return false;
      }
      if (this._expectIndent) {
        this._expectIndent = false;
        if (this._indent <= lastIndent) {
          const tokens = this._compiledModule.tokens;
          this._compilerContext.addError(PyErrorType.ExpectedIndent, this._line[0] || tokens[this._offset] || tokens[tokens.length - 1]);
        }
      }
      if (!this._line.length) {
        continue;
      }
      if (this._calculateExpression) {
        this.parseLineAsExpression();
      } else {
        this.parseCombinedLine();
      }
    }

    if (this._pendingFinishedBlocks.length) {
      this.parseFinishedBlocks(this._line[this._line.length - 1]);
    }

    // safety check -- should never happen
    /* istanbul ignore next */
    while (this._compilerContext.getBlockCount() > 1) {
      this.finishBlock(this._line[this._line.length - 1]);
    }

    const func = new FunctionBody();
    this._compiledModule.functions.push(func);
    func.module = this._compiledModule;
    func.name = name;
    func.type = FunctionType.Module;
    func.code = this._codeGenerator.getFullCode(block.blockCode);
    func.initialize(this._codeGenerator);

    for (const func of this._compiledModule.functions) {
      this.adjustFunctionCodePositions(func);
    }

    return true;
  }

  private adjustFunctionCodePositions(func: FunctionBody) {
    const endRow = this._compiledModule.tokens.length > 0 ? this._compiledModule.tokens[this._compiledModule.tokens.length - 1].row : 0;
    this._codeGenerator.adjustFunctionCodePositions(func, endRow);
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
          // safety check -- should never happen
          /* istanbul ignore next */
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

    this._codeGenerator.setFragmentDebugInformation(this._compiledModule, block.blockCode);

    if (!parentBlock) {
      return block.type === CompilerBlockType.Module;
    }

    switch (block.type) {
      case CompilerBlockType.For:
        this._pendingFinishedBlocks.push(block);
        break;
      case CompilerBlockType.While:
        const whileCode = this._codeGenerator.whileCycle(block.arg2, block.blockCode, this._compilerContext, block.position);
        this._codeGenerator.appendTo(parentBlock.blockCode, whileCode, 0);
        break;
      case CompilerBlockType.Module:
      case CompilerBlockType.Class:
      case CompilerBlockType.Function: {
        const func = this._compiledModule.functions[block.arg1];
        func.code = this._codeGenerator.getFullCode(block.blockCode);
        func.documentation = block.documentation;
        func.initialize(this._codeGenerator);
        this._compilerContext.leaveBlock();
        if (block.type !== CompilerBlockType.Module) {
          this.declareFunction(block.arg1, block.position);
        }
        return true;
      }
      case CompilerBlockType.With: {
        const withCode = this._codeGenerator.with(block.arg1, block.arg2, block.blockCode, this._compilerContext, block.position);
        this._codeGenerator.appendTo(parentBlock.blockCode, withCode, 0);
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
    const ifCode = this._codeGenerator.condition(this._pendingFinishedBlocks, this._compilerContext);
    this._codeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, ifCode, 0);
    return true;
  }

  private finishTryBlock() {
    const tryCode = this._codeGenerator.tryExcept(this._pendingFinishedBlocks, this._compilerContext);
    this._codeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, tryCode, 0);
    return true;
  }

  private finishForBlock() {
    const forCode = this._codeGenerator.forCycle(this._pendingFinishedBlocks, this._compilerContext);
    this._codeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, forCode, 0);
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
    if (isBlockKeyword(this._line[0]) || this._line.findIndex((t) => isSemicolon(t)) < 0) {
      return this.parseLine(false);
    }
    let originalLine = this._line;
    while (originalLine.length) {
      const semi = originalLine.findIndex((t) => isSemicolon(t));
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
          return this.parseKeywordAndExpression();
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
        if (
          (block.type === CompilerBlockType.Function || block.type === CompilerBlockType.Class) &&
          this._codeGenerator.isEmptyFragment(block.blockCode)
        ) {
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
    } else {
      this._expectIndent = true;
    }
    return true;
  }

  private parseForDefinition(): boolean {
    this._compilerContext.setRowType(RowType.ForCycle);

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
      codeGenerator: this._codeGenerator,
    });
    if (!expression.success) {
      return false;
    }

    const block = this._compilerContext.enterBlock(first.getPosition(), this._codeGenerator.createFragment());
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
    this._compilerContext.setRowType(RowType.WhileCycle);

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
      codeGenerator: this._codeGenerator,
    });
    if (!expression.success) {
      return false;
    }

    const block = this._compilerContext.enterBlock(this._line[0].getPosition(), this._codeGenerator.createFragment());
    block.type = CompilerBlockType.While;
    block.arg2 = expression;
    block.indent = this._indent;

    const parent = block.parent;
    parent.index++;
    block.path = parent.path + '.' + parent.index.toString();

    return this.parseEndOfBlockDefinition(expression.finish);
  }

  private parseFunctionDefinition(): boolean {
    this._compilerContext.setRowType(RowType.FunctionDefinition);

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
        if (from >= this._line.length) {
          this._compilerContext.addError(PyErrorType.ExpectedEndOfFunctionDef, this._line[this._line.length - 1]);
          return false;
        }
        current = this._line[from];
      } else if (current && current.type === TokenType.Operator && current.operator === OperatorType.Power) {
        starCount = 2;
        from++;
        if (from >= this._line.length) {
          this._compilerContext.addError(PyErrorType.ExpectedEndOfFunctionDef, this._line[this._line.length - 1]);
          return false;
        }
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
      if (from >= this._line.length) {
        this._compilerContext.addError(PyErrorType.ExpectedEndOfFunctionDef, this._line[this._line.length - 1]);
        return false;
      }
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
        codeGenerator: this._codeGenerator,
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
      this._codeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, defaultValue, initializeIndex);
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

    const block = this._compilerContext.enterBlock(this._line[0].getPosition(), this._codeGenerator.createFragment());
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
    this._compilerContext.setRowType(RowType.Class);
    this._compilerContext.updateRowDescriptor({
      className: func.name,
    });

    const block = this._compilerContext.enterBlock(first.getPosition(), this._codeGenerator.createFragment());
    block.type = CompilerBlockType.Class;
    block.arg1 = this._compiledModule.functions.length - 1;
    block.indent = this._indent;
    func.type = FunctionType.Class;

    return this.parseEndOfBlockDefinition(position);
  }

  private parseIfElifDefinition(): boolean {
    const first = this._line[0];
    const isIf = first.keyword === KeywordType.If;
    this._compilerContext.setRowType(isIf ? RowType.IfBlock : RowType.ElifBlock);

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
      codeGenerator: this._codeGenerator,
    });
    if (!expression.success) {
      return false;
    }
    const block = this._compilerContext.enterBlock(first.getPosition(), this._codeGenerator.createFragment());
    block.type = isIf ? CompilerBlockType.If : CompilerBlockType.ElseIf;
    block.arg2 = expression;
    block.indent = this._indent;

    return this.parseEndOfBlockDefinition(expression.finish);
  }

  private parseElseDefinition(): boolean {
    this._compilerContext.setRowType(RowType.ElseBlock);

    const first = this._line[0];
    const firstBlock = this._pendingFinishedBlocks[0];
    if (
      !firstBlock ||
      (firstBlock.type !== CompilerBlockType.If && firstBlock.type !== CompilerBlockType.For && firstBlock.type !== CompilerBlockType.Try)
    ) {
      this._compilerContext.addError(PyErrorType.CannotFindIfOrElifForElse, first);
      return false;
    }

    const block = this._compilerContext.enterBlock(first.getPosition(), this._codeGenerator.createFragment());
    block.type = CompilerBlockType.Else;
    block.indent = this._indent;

    return this.parseEndOfBlockDefinition(1);
  }

  private parseImportDefinition(): boolean {
    this._compilerContext.setRowType(RowType.Import);
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
      ? this._codeGenerator.importAsDirective(
          this._compiledModule.identifiers[name.identifier],
          this._compiledModule.identifiers[rename.identifier],
          this._compilerContext,
          first.getPosition(),
        )
      : this._codeGenerator.importDirective(this._compiledModule.identifiers[name.identifier], this._compilerContext, first.getPosition());
    this._compilerContext.setRowType(rename ? RowType.ImportAs : RowType.Import);
    this._codeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, imp, 0);
    return true;
  }

  private parseImportFromDefinition(): boolean {
    this._compilerContext.setRowType(RowType.ImportFrom);

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
    const imp = this._codeGenerator.importFromDirective(
      this._compiledModule.identifiers[func.identifier],
      this._compiledModule.identifiers[module.identifier],
      this._compilerContext,
      first.getPosition(),
    );
    this._codeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, imp, 0);
    return true;
  }

  private parseBreakDefinition(): boolean {
    this._compilerContext.setRowType(RowType.Break);
    const first = this._line[0];
    if (this._line.length !== 1) {
      this._compilerContext.addError(PyErrorType.BreakHasNoArguments, first);
      return false;
    }
    const breakCode = this._codeGenerator.breakCode(first.getPosition());
    this._codeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, breakCode, 0);
    return true;
  }

  private parseContinueDefinition(): boolean {
    this._compilerContext.setRowType(RowType.Continue);
    const first = this._line[0];
    if (this._line.length !== 1) {
      this._compilerContext.addError(PyErrorType.ContinueHasNoArguments, first);
      return false;
    }
    const continueCode = this._codeGenerator.continueCode(first.getPosition());
    this._codeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, continueCode, 0);
    return true;
  }

  private parsePassDefinition(): boolean {
    this._compilerContext.setRowType(RowType.Pass);
    const first = this._line[0];
    if (this._line.length !== 1) {
      this._compilerContext.addError(PyErrorType.PassHasNoArguments, first);
      return false;
    }
    const pass = this._codeGenerator.pass(first.getPosition());
    this._codeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, pass, 0);
    return true;
  }

  // Yield, return, del and raise
  private parseKeywordAndExpression(): boolean {
    const first = this._line[0];
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
      case KeywordType.Raise:
        this._compilerContext.setRowType(RowType.Raise);
        break;
    }
    let returnCode: CodeFragment;
    if (this._line.length === 1) {
      switch (first.keyword) {
        case KeywordType.Return:
          returnCode = this._codeGenerator.returnEmpty(first.getPosition());
          break;
        case KeywordType.Raise:
          returnCode = this._codeGenerator.raiseEmpty(first.getPosition());
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
        codeGenerator: this._codeGenerator,
      });
      if (!expression.success) {
        return false;
      }
      const from = expression.finish;
      switch (first.keyword) {
        case KeywordType.Return:
          if (from !== this._line.length) {
            this._compilerContext.addError(PyErrorType.ReturnExpectedEndOfLine, first);
            return false;
          } else {
            returnCode = this._codeGenerator.returnValue(expression, first.getPosition());
          }
          break;
        case KeywordType.Yield:
          if (from !== this._line.length) {
            this._compilerContext.addError(PyErrorType.YieldExpectedEndOfLine, first);
            return false;
          } else {
            returnCode = this._codeGenerator.yield(expression, first.getPosition());
          }
          break;
        case KeywordType.Del:
          if (from !== this._line.length) {
            this._compilerContext.addError(PyErrorType.DelExpectedEndOfLine, first);
            return false;
          } else {
            returnCode = this._codeGenerator.delete(expression, first.getPosition());
          }
          break;
        case KeywordType.Raise:
          if (from !== this._line.length) {
            this._compilerContext.addError(PyErrorType.RaiseExpectedEndOfLine, first);
            return false;
          } else {
            returnCode = this._codeGenerator.raise(expression, first.getPosition());
          }
          break;
      }
    }
    this._codeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, returnCode, 0);
    return true;
  }

  private parseYieldDefinition(): boolean {
    return this.parseKeywordAndExpression();
  }

  private parseReturnDefinition(): boolean {
    return this.parseKeywordAndExpression();
  }

  private parseTryDefinition(): boolean {
    this._compilerContext.setRowType(RowType.TryBlock);

    const block = this._compilerContext.enterBlock(this._line[0].getPosition(), this._codeGenerator.createFragment());
    block.type = CompilerBlockType.Try;
    block.indent = this._indent;

    return this.parseEndOfBlockDefinition(1);
  }

  private parseWithDefinition(): boolean {
    this._compilerContext.setRowType(RowType.With);

    const expression = ExpressionCompiler.compile({
      tokens: this._line,
      compiledCode: this._compiledModule,
      compilerContext: this._compilerContext,
      lexicalContext: this._lexicalContext,
      start: 1,
      codeGenerator: this._codeGenerator,
    });
    if (!expression.success) {
      return false;
    }
    const from = expression.finish;
    if (!isKeywordAs(this._line[from]) || !isIdentifier(this._line[from + 1])) {
      this._compilerContext.addError(PyErrorType.WithExpectedAs, this._line[from] || this._line[this._line.length - 1]);
      return false;
    }
    const block = this._compilerContext.enterBlock(this._line[0].getPosition(), this._codeGenerator.createFragment());
    block.type = CompilerBlockType.With;
    block.indent = this._indent;
    block.arg1 = this._line[from + 1].identifier;
    block.arg2 = expression;

    this._compilerContext.updateRowDescriptor({
      introducedVariable: this._compiledModule.identifiers[block.arg1],
    });

    return this.parseEndOfBlockDefinition(from + 2);
  }

  private parseExceptDefinition(): boolean {
    this._compilerContext.setRowType(RowType.ExceptBlock);

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
      identifiers.push(this._compilerContext.getIdentifierCode(id));
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
      this._compilerContext.addError(PyErrorType.ExceptExpectedRightBracket, this._line[next]);
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

    const block = this._compilerContext.enterBlock(first.getPosition(), this._codeGenerator.createFragment());
    block.type = CompilerBlockType.Except;
    block.indent = this._indent;
    block.arg1 = exceptionIdentifier;
    block.arg4 = identifiers;

    return this.parseEndOfBlockDefinition(next);
  }

  private parseFinallyDefinition(): boolean {
    this._compilerContext.setRowType(RowType.FinallyBlock);

    const first = this._line[0];
    const firstBlock = this._pendingFinishedBlocks[0];
    if (!firstBlock || firstBlock.type !== CompilerBlockType.Try) {
      this._compilerContext.addError(PyErrorType.FinallyCannotFindTry, first);
      return false;
    }
    const block = this._compilerContext.enterBlock(first.getPosition(), this._codeGenerator.createFragment());
    block.type = CompilerBlockType.Finally;
    block.indent = this._indent;

    return this.parseEndOfBlockDefinition(1);
  }

  private parseAssignmentOrCallOperator(): boolean {
    let start = 0;
    const expressions: CodeFragment[] = [];
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
        codeGenerator: this._codeGenerator,
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

    let result: CodeFragment = expressions[expressions.length - 1];

    for (let i = expressions.length - 2; i >= 0; i--) {
      const assignment = expressions[i];
      this._codeGenerator.appendTo(assignment, result, 1);
      if (isAugmented) {
        this._codeGenerator.appendAugmentedCopy(assignment, augmentedOperator);
      } else {
        this._codeGenerator.appendCopyValue(assignment);
      }
      result = assignment;
    }

    this._codeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, result, 0);

    if (expressions.length > 1) {
      this._compilerContext.setRowType(RowType.AssignmentOperator);
    }

    if (this._codeGenerator.hasArrayIndex(result)) {
      this._compilerContext.updateRowDescriptor({
        isArrayAssignment: true,
      });
    }

    if (this._codeGenerator.hasArrayIndex(result)) {
      this._compilerContext.updateRowDescriptor({
        hasOperators: true,
      });
    }

    return true;
  }

  private parseDelDefinition(): boolean {
    return this.parseKeywordAndExpression();
  }

  private declareFunction(functionDef: number, position: TokenPosition) {
    const func = this._compiledModule.functions[functionDef];
    const createFunction = this._codeGenerator.readFunctionDef(functionDef, position);
    const identifiers: string[] = [func.name];
    const code = this._codeGenerator.createReference(identifiers, this._compilerContext, position);
    // It is important not to touch registers starting from index 2 because they are used for default values
    this._codeGenerator.appendTo(code, createFunction, 1);
    this._codeGenerator.appendCopyValue(code);
    this._codeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, code, 0);
  }

  private parseLineAsExpression() {
    const expression = ExpressionCompiler.compile({
      tokens: this._line,
      compiledCode: this._compiledModule,
      compilerContext: this._compilerContext,
      lexicalContext: this._lexicalContext,
      start: 0,
      codeGenerator: this._codeGenerator,
    });
    if (!expression.success) {
      return;
    } else if (expression.finish !== this._line.length) {
      this._compilerContext.addError(PyErrorType.ExpectedEndOfExpression, this._line[expression.finish]);
    }
    const print = this._codeGenerator.createFragment();
    const first = this._line[0];
    this._codeGenerator.appendReadObject(print, first.getPosition(), this._compilerContext.getIdentifierCode('print'), this._compilerContext);
    this._codeGenerator.appendFunctionCall(print, [expression], this._compilerContext, this._line[0].getPosition(), false);
    this._codeGenerator.appendTo(this._compilerContext.getCurrentBlock().blockCode, print, 0);
  }

  private parseScopeDefinition(): boolean {
    const isGlobal = this._line[0].keyword === KeywordType.Global;
    this._compilerContext.setRowType(isGlobal ? RowType.ScopeGlobal : RowType.ScopeNonlocal);
    const block = this._compilerContext.getCurrentBlock();
    let pos = 1;
    let last = this._line[0];
    for (;;) {
      const current = this._line[pos];
      if (current) {
        last = current;
      }
      const next = this._line[pos + 1];
      if (!isIdentifier(current) || (next && !isComma(next))) {
        this._compilerContext.addError(PyErrorType.ExpectedOnlyIdentifier, last);
        return false;
      }
      const id = current.identifier;
      if (isGlobal) {
        block.scopeChange[id] = ReferenceScope.Global;
      } else {
        block.scopeChange[id] = ReferenceScope.NonLocal;
      }
      pos++;
      if (!isComma(next)) {
        break;
      }
      pos++;
    }
  }
}
