import { Token, TokenPosition } from './Token';
import { RowType } from './RowType';
import { RowDescriptor } from './RowDescriptor';
import { PyErrorType } from './ErrorType';
import { PyError, PyErrorContext } from './Error';
import { CompilerBlockContext } from './CompilerBlockContext';
import { Literal, LiteralType } from './Literal';
import { PyModule } from './Module';
import { CodeFragment } from './CodeFragment';

function getRowTypePriority(rowType: RowType): number {
  switch (rowType) {
    case RowType.Unknown:
    case RowType.Pass:
      return 0;
    case RowType.Comment:
      return 1;
    case RowType.Expression:
      return 2;
    case RowType.AssignmentOperator:
      return 3;
    case RowType.FunctionCall:
      return 4;
    case RowType.IfBlock:
    case RowType.ElseBlock:
    case RowType.ElifBlock:
      return 5;
    case RowType.TryBlock:
    case RowType.ExceptBlock:
    case RowType.FinallyBlock:
      return 6;
    case RowType.Return:
    case RowType.Continue:
    case RowType.Break:
    case RowType.Yield:
    case RowType.Raise:
      return 7;
    case RowType.ForCycle:
    case RowType.WhileCycle:
      return 8;
    case RowType.FunctionDefinition:
      return 9;
    case RowType.Import:
    case RowType.ImportAs:
    case RowType.ImportFrom:
      return 10;
  }
}

// it is for external usage
/* istanbul ignore next */
export function getRowTypeDescription(rowType: RowType): string {
  switch (rowType) {
    case RowType.AssignmentOperator:
      return 'rowtype.assignment-operator';
    case RowType.FunctionCall:
      return 'rowtype.function-call';
    case RowType.ForCycle:
      return 'rowtype.for-cycle';
    case RowType.WhileCycle:
      return 'rowtype.while-cycle';
    case RowType.TryBlock:
      return 'rowtype.try-block';
    case RowType.ExceptBlock:
      return 'rowtype.except-block';
    case RowType.FinallyBlock:
      return 'rowtype.finally-block';
    case RowType.Raise:
      return 'rowtype.raise';
    case RowType.FunctionDefinition:
      return 'rowtype.function-definition';
    case RowType.Comment:
      return 'rowtype.comment';
    case RowType.IfBlock:
      return 'rowtype.if-block';
    case RowType.ElseBlock:
      return 'rowtype.else-block';
    case RowType.ElifBlock:
      return 'rowtype.elif-block';
    case RowType.Import:
      return 'rowtype.import';
    case RowType.Pass:
      return 'rowtype.pass';
    case RowType.Return:
      return 'rowtype.return';
    case RowType.Expression:
      return 'rowtype.expression';
    case RowType.Continue:
      return 'rowtype.continue';
    case RowType.Break:
      return 'rowtype.break';
    case RowType.Yield:
      return 'rowtype.yield';
    case RowType.ImportAs:
      return 'rowtype.import.as';
    case RowType.ImportFrom:
      return 'rowtype.import.from';
    case RowType.Unknown:
      return '-';
  }
}

export class CompilerContext {
  private readonly compiledCode: PyModule;
  private readonly blocks: CompilerBlockContext[] = [];
  private readonly identifierMap: { [key: string]: number } = {};
  private usedLabels = 0;
  private readonly stringLiterals: { [key: string]: number } = {};
  private readonly realLiterals: { [key: string]: number } = {};
  private readonly intLiterals: { [key: string]: number } = {};
  public readonly rowDescriptors: RowDescriptor[] = [];
  public row: number;
  private lambdaFunctionIndex = 1;
  private parsedLiterals = 0;
  private parsedIdentifiers = 0;

  public constructor(code: PyModule) {
    this.compiledCode = code;
    this.update();
  }

  public update() {
    for (; this.parsedLiterals < this.compiledCode.literals.length; this.parsedLiterals++) {
      const literal = this.compiledCode.literals[this.parsedLiterals];
      switch (literal.type & LiteralType.LiteralMask) {
        case LiteralType.String:
        case LiteralType.FormattedString:
        case LiteralType.Bytes:
        case LiteralType.Unicode:
          this.stringLiterals[literal.string] = this.parsedLiterals;
          break;
        default:
          const array = literal.type === LiteralType.Integer ? this.intLiterals : this.realLiterals;
          array[literal.integer.toString()] = this.parsedLiterals;
          break;
      }
    }
    for (; this.parsedIdentifiers < this.compiledCode.identifiers.length; this.parsedIdentifiers++) {
      this.identifierMap[this.compiledCode.identifiers[this.parsedIdentifiers]] = this.parsedIdentifiers;
    }
  }

  private createRowDescriptor() {
    if (!this.rowDescriptors[this.row]) {
      this.rowDescriptors[this.row] = {
        type: RowType.Unknown,
      };
    }
  }

  public setRowType(type: RowType) {
    this.createRowDescriptor();
    const descriptor = this.rowDescriptors[this.row];
    if (descriptor.type === type) {
      return;
    }
    if (descriptor.type === RowType.Unknown) {
      descriptor.type = type;
    } else {
      descriptor.subTypes = descriptor.subTypes || [];
      if (getRowTypePriority(descriptor.type) < getRowTypePriority(type)) {
        descriptor.subTypes.push(descriptor.type);
        descriptor.type = type;
      } else {
        descriptor.subTypes.push(type);
      }
    }
  }

  public updateRowDescriptor(type: Partial<Omit<RowDescriptor, 'type'>>) {
    this.createRowDescriptor();
    for (const key of Object.keys(type)) {
      const value = type[key];
      const currentValue = this.rowDescriptors[this.row][key];
      if (Array.isArray(value) && currentValue) {
        this.rowDescriptors[this.row][key] = [...currentValue, ...value];
      } else {
        this.rowDescriptors[this.row][key] = value;
      }
    }
  }

  public addError(type: PyErrorType, token: Token, context?: PyErrorContext) {
    this.compiledCode.errors.push(new PyError(type, token.row, token.col, token.length, token.offset, context));
  }

  public getLiteral(literal: Literal): number {
    const type = literal.type & LiteralType.LiteralMask;
    switch (type) {
      case LiteralType.String:
      case LiteralType.FormattedString:
      case LiteralType.Bytes:
      case LiteralType.Unicode: {
        const it = this.stringLiterals[literal.string];
        if (it !== undefined) {
          this.updateRowDescriptor({
            literals: [literal.string],
          });
          return it;
        }

        // safety check
        /* istanbul ignore next */
        return -1;
      }
      default: {
        const array = type === LiteralType.Integer ? this.intLiterals : this.realLiterals;
        const it = array[literal.integer.toString()];
        if (it !== undefined) {
          this.updateRowDescriptor({
            literals: [literal.integer.toString()],
          });
          return it;
        }

        // safety check
        /* istanbul ignore next */
        return -1;
      }
    }
  }

  public getNewLabel(): number {
    return this.usedLabels++;
  }

  public getIdentifierCode(name: string): number {
    let it = this.identifierMap[name];
    if (it !== undefined) {
      return it;
    }
    it = this.compiledCode.identifiers.length;
    this.compiledCode.identifiers.push(name);
    this.identifierMap[name] = it;
    return it;
  }

  public getIdentifierName(id: number): string {
    for (const key of Object.keys(this.identifierMap)) {
      if (this.identifierMap[key] === id) {
        return key;
      }
    }
    return undefined;
  }

  public getCurrentBlock(): CompilerBlockContext {
    return this.blocks[this.blocks.length - 1];
  }

  public enterBlock(position: TokenPosition, newFragment: CodeFragment): CompilerBlockContext {
    const newContext = new CompilerBlockContext(newFragment);
    newContext.position = position;
    if (this.blocks.length) {
      newContext.parent = this.blocks[this.blocks.length - 1];
    } else {
      newContext.parent = undefined;
    }
    this.blocks.push(newContext);
    return newContext;
  }

  public leaveBlock() {
    this.blocks.pop();
  }

  public getBlockCount(): number {
    return this.blocks.length;
  }

  public getLambdaFunctionName() {
    return `<lambda>.${this.lambdaFunctionIndex++}`;
  }
}
