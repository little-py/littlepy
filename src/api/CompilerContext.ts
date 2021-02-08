import { TokenPosition } from './Token';
import { RowType } from './RowType';
import { RowDescriptor } from './RowDescriptor';
import { PyErrorType } from './ErrorType';
import { PyError, PyErrorContext } from './Error';
import { CompilerBlockContext, CompilerBlockType } from './CompilerBlockContext';
import { Literal, LiteralType } from './Literal';
import { PyModule } from './Module';
import { CodeFragment } from './CodeFragment';

function getRowTypePriority(rowType: RowType): number {
  switch (rowType) {
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

  public update(): void {
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
        types: [],
      };
    }
  }

  public getSortedRowDescriptors(): RowDescriptor[] {
    for (const row of this.rowDescriptors) {
      if (row && row.types) {
        row.types = row.types.sort((a, b) => getRowTypePriority(a) - getRowTypePriority(b));
      }
    }
    return this.rowDescriptors;
  }

  public setRowType(type: RowType): void {
    this.createRowDescriptor();
    const descriptor = this.rowDescriptors[this.row];
    if (descriptor.types.indexOf(type) >= 0) {
      return;
    }
    descriptor.types.push(type);
  }

  public updateRowDescriptor(type: Partial<Omit<RowDescriptor, 'type'>>): void {
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

  public addError(type: PyErrorType, position: TokenPosition, context?: PyErrorContext): void {
    this.compiledCode.errors.push(new PyError(type, position.row, position.column, position.length, position.position, context));
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

  public enterBlock(position: TokenPosition, newFragment: CodeFragment, type: CompilerBlockType): CompilerBlockContext {
    let parent: CompilerBlockContext;
    if (this.blocks.length) {
      parent = this.blocks[this.blocks.length - 1];
    } else {
      parent = undefined;
    }
    const newContext = new CompilerBlockContext(newFragment, type, parent);
    newContext.position = position;
    this.blocks.push(newContext);
    return newContext;
  }

  public leaveBlock(): void {
    this.blocks.pop();
  }

  public getBlockCount(): number {
    return this.blocks.length;
  }

  public getLambdaFunctionName(): string {
    return `<lambda>.${this.lambdaFunctionIndex++}`;
  }
}
