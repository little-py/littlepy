import { Token, TokenPosition } from '../api/Token';
import { CompiledModule } from './CompiledModule';
import { Literal, LiteralType } from './Literal';
import { CompilerBlockContext } from './CompilerBlockContext';
import { RowType } from '../api/RowType';
import { RowDescriptor } from '../api/RowDescriptor';
import { PyErrorType } from '../api/ErrorType';
import { PyError, PyErrorContext } from '../api/Error';

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
  private readonly compiledCode: CompiledModule;
  private readonly blocks: CompilerBlockContext[] = [];
  private readonly identifierMap: { [key: string]: number } = {};
  private usedLabels = 0;
  private readonly stringLiterals: { [key: string]: number } = {};
  private readonly realLiterals: { [key: string]: number } = {};
  private readonly intLiterals: { [key: string]: number } = {};
  public readonly rowDescriptors: RowDescriptor[] = [];
  public row: number;
  private lambdaFunctionIndex = 1;

  public constructor(code: CompiledModule) {
    this.compiledCode = code;
    for (let i = 0; i < code.literals.length; i++) {
      const literal = code.literals[i];
      switch (literal.type & LiteralType.LiteralMask) {
        case LiteralType.String:
        case LiteralType.FormattedString:
        case LiteralType.Bytes:
        case LiteralType.Unicode:
          this.stringLiterals[literal.string] = i;
          break;
        default:
          const array = literal.type === LiteralType.Integer ? this.intLiterals : this.realLiterals;
          array[literal.integer.toString()] = i;
          break;
      }
    }
    for (let i = 0; i < code.identifiers.length; i++) {
      this.identifierMap[code.identifiers[i]] = i;
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
    this.rowDescriptors[this.row].type = type;
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
        return -1;
      }
    }
  }

  public getNewLabel(): number {
    return this.usedLabels++;
  }

  public getIdentifier(name: string): number {
    let it = this.identifierMap[name];
    if (it !== undefined) {
      return it;
    }
    it = this.compiledCode.identifiers.length;
    this.compiledCode.identifiers.push(name);
    this.identifierMap[name] = it;
    return it;
  }

  public getCurrentBlock(): CompilerBlockContext {
    return this.blocks[this.blocks.length - 1];
  }

  public enterBlock(position: TokenPosition): CompilerBlockContext {
    const newContext = new CompilerBlockContext();
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
