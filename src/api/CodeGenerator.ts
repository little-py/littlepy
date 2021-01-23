import { CodeFragment } from './CodeFragment';
import { Token, TokenPosition } from './Token';
import { FullCode } from './FullCode';
import { CompilerBlockContext } from './CompilerBlockContext';
import { ReferenceScope } from './ReferenceScope';
import { Literal } from './Literal';
import { PyModule } from './Module';
import { CompilerContext } from './CompilerContext';
import { PyFunction } from './Function';

export interface CodeGenerator {
  getFullCode(code: CodeFragment): FullCode;
  appendTo(tgt: CodeFragment, src: CodeFragment, shiftRight: number);
  comprehension(expression: CodeFragment, parts: CompilerBlockContext[], context: CompilerContext): CodeFragment;
  forCycle(parts: CompilerBlockContext[], context: CompilerContext): CodeFragment;
  whileCycle(condition: CodeFragment, body: CodeFragment, context: CompilerContext, position: TokenPosition): CodeFragment;
  condition(parts: CompilerBlockContext[], context: CompilerContext): CodeFragment;
  tryExcept(parts: CompilerBlockContext[], context: CompilerContext): CodeFragment;
  with(identifier: number, expression: CodeFragment, block: CodeFragment, context: CompilerContext, position: TokenPosition): CodeFragment;
  importDirective(path: string, context: CompilerContext, position: TokenPosition): CodeFragment;
  importAsDirective(path: string, rename: string, context: CompilerContext, position: TokenPosition): CodeFragment;
  importFromDirective(func: string, module: string, context: CompilerContext, position: TokenPosition): CodeFragment;
  pass(position: TokenPosition): CodeFragment;
  breakCode(position: TokenPosition): CodeFragment;
  continueCode(position: TokenPosition): CodeFragment;
  raise(expression: CodeFragment, position: TokenPosition): CodeFragment;
  raiseEmpty(position: TokenPosition): CodeFragment;
  returnEmpty(position: TokenPosition): CodeFragment;
  returnValue(expression: CodeFragment, position: TokenPosition): CodeFragment;
  yield(expression: CodeFragment, position: TokenPosition): CodeFragment;
  delete(expression: CodeFragment, position: TokenPosition): CodeFragment;
  appendFunctionCall(
    code: CodeFragment,
    args: CodeFragment[],
    compilerContext: CompilerContext,
    position: TokenPosition,
    parentAt0: boolean,
  ): boolean;
  readFunctionDef(defIndex: number, position: TokenPosition): CodeFragment;
  unaryOperators(unaryOperators: Token[], source: CodeFragment): CodeFragment;
  binaryOperator(left: CodeFragment, op: Token, right: CodeFragment, compilerContext: CompilerContext): CodeFragment;
  createReference(identifiers: string[], compilerContext: CompilerContext, position: TokenPosition): CodeFragment;
  appendPropertyReference(code: CodeFragment, objectReg: number, identifier: number, position: TokenPosition, compilerContext: CompilerContext);
  appendArrayIndexerReference(code: CodeFragment, objectReg: number, indexExpression: CodeFragment, position: TokenPosition): void;
  appendArrayRange(
    code: CodeFragment,
    objectReg: number,
    indexFrom: CodeFragment,
    indexTo: CodeFragment,
    indexInterval: CodeFragment,
    position: TokenPosition,
    isReference: boolean,
  ): void;
  createVarReference(identifier: number, scope: ReferenceScope, position: TokenPosition, compilerContext: CompilerContext): CodeFragment;
  list(records: CodeFragment[], position: TokenPosition): CodeFragment;
  tuple(records: CodeFragment[], position: TokenPosition): CodeFragment;
  dictionary(literals: string[], values: CodeFragment[], compilerContext: CompilerContext, position: TokenPosition): CodeFragment;
  set(records: CodeFragment[], position: TokenPosition): CodeFragment;
  conditionalExpression(
    condition: CodeFragment,
    ifPart: CodeFragment,
    elsePart: CodeFragment,
    compilerContext: CompilerContext,
    position: TokenPosition,
  ): CodeFragment;
  literal(literal: Literal, compilerContext: CompilerContext, position: TokenPosition): CodeFragment;
  formattedLiteral(literal: Literal, values: CodeFragment[], compilerContext: CompilerContext, position: TokenPosition): CodeFragment;
  bool(value: number, position: TokenPosition): CodeFragment;
  none(position: TokenPosition): CodeFragment;
  createFragment(): CodeFragment;
  setFragmentDebugInformation(module: PyModule, fragment: CodeFragment): void;
  getFullDebugInformation(module: PyModule, func: PyFunction): string;
  isEmptyFragment(fragment: CodeFragment): boolean;
  appendAugmentedCopy(fragment: CodeFragment, operator: Token): void;
  appendCopyValue(fragment: CodeFragment): void;
  hasArrayIndex(fragment: CodeFragment): boolean;
  hasOperator(fragment: CodeFragment): boolean;
  appendReadObject(fragment: CodeFragment, position: TokenPosition, identifier: number, compilerContext: CompilerContext, isFunctionName?: boolean): void;
  appendReadProperty(
    fragment: CodeFragment,
    position: TokenPosition,
    identifier: number,
    from: number,
    to: number,
    compilerContext: CompilerContext,
  ): void;
  appendReadArrayIndex(fragment: CodeFragment, position: TokenPosition, from: number, index: number, to: number): void;
  appendReturnValue(fragment: CodeFragment, position: TokenPosition, from: number);
  appendTestReference(fragment: CodeFragment);
}
