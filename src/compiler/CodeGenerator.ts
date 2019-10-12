import { GeneratedCode, Instruction } from '../common/Instructions';
import { CompilerContext } from './CompilerContext';
import { OperatorType, Token, TokenPosition, TokenType } from '../api/Token';
import { KeywordType } from '../api/Keyword';
import { Literal } from './Literal';
import { CompilerBlockContext, CompilerBlockType } from './CompilerBlockContext';
import { InstructionType } from '../common/InstructionType';
import { PyErrorType } from '../api/ErrorType';
import { ReferenceScope } from '../common/ReferenceScope';

export class CodeGenerator {
  public static copyCode(code: GeneratedCode): Instruction[] {
    return code.code.map(i => i.copy());
  }

  public static appendTo(tgt: GeneratedCode, src: GeneratedCode, shiftRight = 0) {
    for (const sc of src.code) {
      const tc = sc.copy();
      if (shiftRight) {
        tc.shiftRight(shiftRight);
      }
      tgt.code.push(tc);
    }
  }

  public static comprehension(expression: GeneratedCode, parts: CompilerBlockContext[], context: CompilerContext): GeneratedCode {
    let intermediate = new GeneratedCode();
    CodeGenerator.appendTo(intermediate, expression);
    intermediate.add(InstructionType.Literal, parts[0].position, 0, -1);
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      const code = new GeneratedCode();
      if (part.type === CompilerBlockType.For) {
        part.blockCode = intermediate;
        CodeGenerator.forCycleInternal(code, part, null, context);
      } else {
        CodeGenerator.appendTo(code, part.arg2);
        const nextLabel = context.getNewLabel();
        code.add(InstructionType.GetBool, part.position, 0, 0);
        code.add(InstructionType.Condition, part.position, 0, nextLabel);
        CodeGenerator.appendTo(code, intermediate);
        code.add(InstructionType.Label, null, nextLabel);
      }
      intermediate = code;
    }
    const ret = new GeneratedCode();
    ret.add(InstructionType.List, parts[0].position, 0);
    CodeGenerator.appendTo(ret, intermediate, 1);
    const pos = ret.code.findIndex(c => c.type === InstructionType.Literal && c.arg2 === -1);
    const reg = ret.code[pos].arg1;
    ret.code[pos] = new Instruction(InstructionType.ListAdd, parts[parts.length - 1].position, reg, 0);
    ret.success = true;
    return ret;
  }

  private static forCycleInternal(ret: GeneratedCode, forPart: CompilerBlockContext, noBreakPart: CompilerBlockContext, context: CompilerContext) {
    CodeGenerator.appendTo(ret, forPart.arg2);
    ret.add(InstructionType.ReadProperty, forPart.position, context.getIdentifier('__iter__'), 0, 1);
    ret.add(InstructionType.CallMethod, forPart.position, 0, 1, 0);
    const endLabel = context.getNewLabel();
    const startLabel = context.getNewLabel();
    const noBreakLabel = noBreakPart ? context.getNewLabel() : -1;
    ret.add(InstructionType.ForCycle, forPart.position, endLabel, noBreakLabel);
    ret.add(InstructionType.CreateVarRef, forPart.position, forPart.arg1, 1, ReferenceScope.Default);
    ret.add(InstructionType.Label, forPart.position, startLabel);
    ret.add(InstructionType.ReadProperty, forPart.position, context.getIdentifier('__next__'), 0, 3);
    ret.add(InstructionType.CallMethod, forPart.position, 0, 3, 2);
    ret.add(InstructionType.CopyValue, forPart.position, 2, 1);
    CodeGenerator.appendTo(ret, forPart.blockCode, 2);
    ret.add(InstructionType.GoTo, null, startLabel);

    if (noBreakPart) {
      ret.add(InstructionType.Label, noBreakPart.position, noBreakLabel);
      CodeGenerator.appendTo(ret, noBreakPart.blockCode);
    }

    ret.add(InstructionType.Label, null, endLabel);
  }

  // public static forCycle(variable: string, position: TokenPosition, expression: GeneratedCode, body: GeneratedCode, context: CompilerContext): GeneratedCode {
  public static forCycle(parts: CompilerBlockContext[], context: CompilerContext): GeneratedCode {
    const forPart = parts[0];
    const noBreakPart = parts[1];
    const ret = new GeneratedCode();
    CodeGenerator.forCycleInternal(ret, forPart, noBreakPart, context);
    ret.success = true;
    return ret;
  }

  public static whileCycle(condition: GeneratedCode, body: GeneratedCode, context: CompilerContext, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    const startLabel = context.getNewLabel();
    const endLabel = context.getNewLabel();
    ret.add(InstructionType.WhileCycle, position, endLabel);
    ret.add(InstructionType.Label, position, startLabel);
    CodeGenerator.appendTo(ret, condition);
    ret.add(InstructionType.GetBool, null, 0, 0);
    ret.add(InstructionType.Condition, null, 0, endLabel);
    CodeGenerator.appendTo(ret, body);
    ret.add(InstructionType.GoTo, null, startLabel);
    ret.add(InstructionType.Label, null, endLabel);
    ret.add(InstructionType.LeaveCycle, null);
    ret.success = true;
    return ret;
  }

  public static condition(parts: CompilerBlockContext[], context: CompilerContext): GeneratedCode {
    const ret = new GeneratedCode();
    const endLabel = context.getNewLabel();
    for (const part of parts) {
      switch (part.type) {
        case CompilerBlockType.If:
        case CompilerBlockType.ElseIf: {
          CodeGenerator.appendTo(ret, part.arg2);
          const nextLabel = context.getNewLabel();
          ret.add(InstructionType.GetBool, part.position, 0, 0);
          ret.add(InstructionType.Condition, part.position, 0, nextLabel);
          CodeGenerator.appendTo(ret, part.blockCode);
          ret.add(InstructionType.GoTo, part.position, endLabel);
          ret.add(InstructionType.Label, null, nextLabel);
          break;
        }
        case CompilerBlockType.Else: {
          CodeGenerator.appendTo(ret, part.blockCode);
          break;
        }
      }
    }
    ret.add(InstructionType.Label, null, endLabel);
    ret.success = true;
    return ret;
  }

  public static tryExcept(parts: CompilerBlockContext[], context: CompilerContext): GeneratedCode {
    const ret = new GeneratedCode();
    const finishTry = context.getNewLabel();

    let finallyPart: CompilerBlockContext;
    let elsePart: CompilerBlockContext;
    let tryPart: CompilerBlockContext;
    const exceptParts: CompilerBlockContext[] = [];

    for (const part of parts) {
      if (part.type === CompilerBlockType.Finally) {
        finallyPart = part;
        finallyPart.label = context.getNewLabel();
      } else if (part.type === CompilerBlockType.Try) {
        tryPart = part;
      } else if (part.type === CompilerBlockType.Except) {
        exceptParts.push(part);
        part.label = context.getNewLabel();
      } else if (part.type === CompilerBlockType.Else) {
        elsePart = part;
        part.label = context.getNewLabel();
      }
    }

    ret.add(InstructionType.EnterTry, tryPart.position, tryPart.blockCode.code.length + 2);
    CodeGenerator.appendTo(ret, tryPart.blockCode);
    ret.add(InstructionType.GoTo, null, finallyPart ? finallyPart.arg1 : finishTry);
    if (finallyPart) {
      ret.add(InstructionType.GotoFinally, null, finallyPart.arg1);
    }
    for (const part of exceptParts) {
      if (!part.arg4 || !part.arg4.length) {
        ret.add(InstructionType.GotoExcept, part.position, -1, part.label);
      } else {
        for (const type of part.arg4) {
          ret.add(InstructionType.GotoExcept, part.position, type, part.label);
        }
      }
    }

    if (finallyPart) {
      ret.add(InstructionType.Label, finallyPart.position, finallyPart.label);
      ret.add(InstructionType.EnterFinally, finallyPart.position);
      CodeGenerator.appendTo(ret, finallyPart.blockCode);
      ret.add(InstructionType.LeaveFinally, null);
      if (exceptParts.length) {
        ret.add(InstructionType.GoTo, null, finishTry);
      }
    }

    for (const part of exceptParts) {
      ret.add(InstructionType.Label, part.position, part.label);
      ret.add(InstructionType.EnterExcept, part.position, part.arg1);
      CodeGenerator.appendTo(ret, part.blockCode);
      if (finallyPart) {
        ret.add(InstructionType.GoTo, null, finallyPart.label);
      } else if (part !== exceptParts[exceptParts.length - 1]) {
        ret.add(InstructionType.GoTo, null, finishTry);
      }
    }

    ret.add(InstructionType.Label, null, finishTry);
    ret.add(InstructionType.LeaveTry, null);
    if (elsePart) {
      CodeGenerator.appendTo(ret, elsePart.blockCode);
    }
    ret.success = true;
    return ret;
  }

  public static with(
    identifier: number,
    expression: GeneratedCode,
    block: GeneratedCode,
    context: CompilerContext,
    position: TokenPosition,
  ): GeneratedCode {
    const finishLabel = context.getNewLabel();
    const exceptLabel = context.getNewLabel();
    const exitLabel = context.getNewLabel();
    const ret = new GeneratedCode();
    ret.add(InstructionType.CreateVarRef, position, identifier, 0, ReferenceScope.Default);
    CodeGenerator.appendTo(ret, expression, 1);
    ret.add(InstructionType.ReadProperty, position, context.getIdentifier('__enter__'), 1, 2);
    ret.add(InstructionType.CallMethod, position, 1, 2, 2);
    ret.add(InstructionType.CopyValue, position, 2, 0);
    ret.add(InstructionType.EnterTry, position, block.code.length + 2);
    CodeGenerator.appendTo(ret, block);
    ret.add(InstructionType.GoTo, position, finishLabel);
    ret.add(InstructionType.GotoExcept, position, -1, exceptLabel);
    ret.add(InstructionType.Label, position, exceptLabel);
    ret.add(InstructionType.EnterExcept, position, -1);

    // call __exit__ with exception
    ret.add(InstructionType.ReadObject, position, identifier, 0);
    ret.add(InstructionType.ReadProperty, position, context.getIdentifier('__exit__'), 0, 1);
    ret.add(InstructionType.ReadObject, position, context.getIdentifier('__sys__'), 2);
    ret.add(InstructionType.ReadProperty, position, context.getIdentifier('exc_info'), 2, 3);
    ret.add(InstructionType.CallMethod, position, 2, 3, 2);
    ret.add(InstructionType.RegArg, position, 2, 0, 1);
    ret.add(InstructionType.CallMethod, position, 0, 1, 0);
    ret.add(InstructionType.GetBool, position, 0, 0);
    ret.add(InstructionType.LogicalNot, position, 0, 0);
    const noRaiseLabel = context.getNewLabel();
    ret.add(InstructionType.Condition, position, 0, noRaiseLabel);
    ret.add(InstructionType.Raise, position, -1);
    ret.add(InstructionType.Label, position, noRaiseLabel);

    ret.add(InstructionType.LeaveTry, position);
    ret.add(InstructionType.GoTo, position, exitLabel);
    ret.add(InstructionType.Label, position, finishLabel);
    ret.add(InstructionType.LeaveTry, position);

    // call __exit__ without exception
    ret.add(InstructionType.ReadObject, position, identifier, 0);
    ret.add(InstructionType.ReadProperty, position, context.getIdentifier('__exit__'), 0, 1);
    ret.add(InstructionType.None, position, 2);
    ret.add(InstructionType.RegArg, position, 2, 0, 0);
    ret.add(InstructionType.RegArg, position, 2, 1, 0);
    ret.add(InstructionType.RegArg, position, 2, 2, 0);
    ret.add(InstructionType.CallMethod, position, 0, 1, 0);

    ret.add(InstructionType.Label, position, exitLabel);

    return ret;
  }

  public static importDirective(path: string, context: CompilerContext, position: TokenPosition): GeneratedCode {
    const id = context.getIdentifier(path);
    const ret = new GeneratedCode();
    ret.add(InstructionType.Import, position, id);
    ret.success = true;
    return ret;
  }

  public static importAsDirective(path: string, rename: string, context: CompilerContext, position: TokenPosition): GeneratedCode {
    const id = context.getIdentifier(path);
    const as = context.getIdentifier(rename);
    const ret = new GeneratedCode();
    ret.add(InstructionType.ImportAs, position, id, as);
    ret.success = true;
    return ret;
  }

  public static importFromDirective(func: string, module: string, context: CompilerContext, position: TokenPosition): GeneratedCode {
    const funcId = context.getIdentifier(func);
    const moduleId = context.getIdentifier(module);
    const ret = new GeneratedCode();
    ret.add(InstructionType.ImportFrom, position, funcId, moduleId);
    ret.success = true;
    return ret;
  }

  public static pass(position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.Pass, position);
    ret.success = true;
    return ret;
  }

  public static breakCode(position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.Break, position);
    ret.success = true;
    return ret;
  }

  public static continueCode(position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.Continue, position);
    ret.success = true;
    return ret;
  }

  public static raise(expression: GeneratedCode, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    CodeGenerator.appendTo(ret, expression);
    ret.add(InstructionType.Raise, position, 0);
    ret.success = true;
    return ret;
  }

  public static returnEmpty(position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.Ret, position, -1);
    ret.success = true;
    return ret;
  }

  public static returnValue(expression: GeneratedCode, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    CodeGenerator.appendTo(ret, expression);
    ret.add(InstructionType.Ret, position, 0);
    ret.success = true;
    return ret;
  }

  public static yield(expression: GeneratedCode, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    CodeGenerator.appendTo(ret, expression);
    ret.add(InstructionType.Yield, position, 0);
    ret.success = true;
    return ret;
  }

  public static delete(expression: GeneratedCode, position: TokenPosition) {
    const ret = new GeneratedCode();
    CodeGenerator.appendTo(ret, expression);
    ret.add(InstructionType.Del, position, 0);
    ret.success = true;
    return ret;
  }

  public static appendFunctionCall(
    code: GeneratedCode,
    args: GeneratedCode[],
    compilerContext: CompilerContext,
    position: TokenPosition,
    parentAt0: boolean,
  ): boolean {
    const argStartReg = 1 + (parentAt0 ? 1 : 0);
    let argReg = argStartReg;
    for (const arg of args) {
      CodeGenerator.appendTo(code, arg, argReg++);
    }
    let argIndex = 0;
    argReg = argStartReg;
    for (const arg of args) {
      if (!arg.nameLiteral) {
        code.add(InstructionType.RegArg, position, argReg++, argIndex);
        argIndex++;
      } else {
        const nameId = compilerContext.getIdentifier(arg.nameLiteral);
        code.add(InstructionType.RegArgName, position, argReg++, nameId);
      }
    }
    if (parentAt0) {
      code.add(InstructionType.CallMethod, position, 0, 1, 0);
    } else {
      code.add(InstructionType.CallFunc, position, 0, 0);
    }
    return true;
  }

  public static readFunctionDef(defIndex: number, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.CreateFunc, position, defIndex, 0);
    ret.success = true;
    return ret;
  }

  public static unaryOperators(unaryOperators: Token[], source: GeneratedCode): GeneratedCode {
    const ret = new GeneratedCode();
    CodeGenerator.appendTo(ret, source);
    for (const token of unaryOperators) {
      if (token.type === TokenType.Operator && token.operator === OperatorType.Invert) {
        ret.add(InstructionType.BinInv, token.getPosition(), 0, 0);
      } else if (token.type === TokenType.Keyword && token.keyword === KeywordType.Not) {
        ret.add(InstructionType.GetBool, token.getPosition(), 0, 0);
        ret.add(InstructionType.LogicalNot, token.getPosition(), 0, 0);
      } else if (token.type === TokenType.Operator && token.operator === OperatorType.Plus) {
        // do nothing
      } else if (token.type === TokenType.Operator && token.operator === OperatorType.Minus) {
        ret.add(InstructionType.Invert, token.getPosition(), 0, 0);
      }
    }
    ret.success = true;
    return ret;
  }

  public static binaryOperator(left: GeneratedCode, op: Token, right: GeneratedCode, compilerContext: CompilerContext): GeneratedCode {
    const ret = new GeneratedCode();
    CodeGenerator.appendTo(ret, left);
    let opType = InstructionType.Pass;
    if (op.type === TokenType.Keyword) {
      switch (op.keyword) {
        case KeywordType.And:
          opType = InstructionType.LogicalAnd;
          break;
        case KeywordType.Or:
          opType = InstructionType.LogicalOr;
          break;
      }
      if (opType !== InstructionType.Pass) {
        ret.add(InstructionType.GetBool, op.getPosition(), 0, 0);
        ret.add(opType, op.getPosition(), 0, 0, right.code.length + 1);
        CodeGenerator.appendTo(ret, right);
        ret.add(InstructionType.GetBool, op.getPosition(), 0, 0);
      }
    }
    CodeGenerator.appendTo(ret, right, 1);
    if (op.type === TokenType.Operator) {
      switch (op.operator) {
        case OperatorType.Plus:
          opType = InstructionType.Add;
          break;
        case OperatorType.Minus:
          opType = InstructionType.Sub;
          break;
        case OperatorType.Multiply:
          opType = InstructionType.Mul;
          break;
        case OperatorType.Power:
          opType = InstructionType.Pow;
          break;
        case OperatorType.Divide:
          opType = InstructionType.Div;
          break;
        case OperatorType.FloorDivide:
          opType = InstructionType.Floor;
          break;
        case OperatorType.Modulus:
          opType = InstructionType.Mod;
          break;
        // not implemented yet
        /* istanbul ignore next */
        case OperatorType.At:
          opType = InstructionType.At;
          break;
        case OperatorType.ShiftLeft:
          opType = InstructionType.Shl;
          break;
        case OperatorType.ShiftRight:
          opType = InstructionType.Shr;
          break;
        case OperatorType.And:
          opType = InstructionType.BinAnd;
          break;
        case OperatorType.Or:
          opType = InstructionType.BinOr;
          break;
        case OperatorType.Xor:
          opType = InstructionType.BinXor;
          break;
        case OperatorType.Less:
          opType = InstructionType.Less;
          break;
        case OperatorType.Greater:
          opType = InstructionType.Greater;
          break;
        case OperatorType.LessEqual:
          opType = InstructionType.LessEq;
          break;
        case OperatorType.GreaterEqual:
          opType = InstructionType.GreaterEq;
          break;
        case OperatorType.Equal:
          opType = InstructionType.Equal;
          break;
        case OperatorType.NotEqual:
          opType = InstructionType.NotEq;
          break;
      }
    } else if (op.type === TokenType.Keyword) {
      switch (op.keyword) {
        case KeywordType.Is:
          opType = InstructionType.Is;
          break;
        case KeywordType.IsNot:
          opType = InstructionType.IsNot;
          break;
        case KeywordType.In:
          opType = InstructionType.In;
          break;
        case KeywordType.NotIn:
          opType = InstructionType.NotIn;
          break;
      }
    }
    // safety check
    /* istanbul ignore next */
    if (opType === InstructionType.Pass) {
      ret.success = false;
      compilerContext.addError(PyErrorType.UnknownBinaryOperator, op);
      return ret;
    }
    ret.add(opType, op.getPosition(), 0, 1, 0);
    ret.success = true;
    return ret;
  }

  public static createReference(identifiers: string[], compilerContext: CompilerContext, position: TokenPosition) {
    const ret = new GeneratedCode();
    ret.add(InstructionType.CreateVarRef, position, compilerContext.getIdentifier(identifiers[0]), 0, ReferenceScope.Default);
    ret.success = true;
    return ret;
  }

  public static appendPropertyReference(code: GeneratedCode, objectReg: number, identifier: number, position: TokenPosition) {
    code.add(InstructionType.Identifier, position, objectReg + 1, identifier);
    code.add(InstructionType.CreatePropertyRef, position, objectReg, objectReg + 1, objectReg);
  }

  public static appendArrayIndexerReference(code: GeneratedCode, objectReg: number, indexExpression: GeneratedCode, position: TokenPosition) {
    CodeGenerator.appendTo(code, indexExpression, objectReg + 1);
    code.add(InstructionType.CreateArrayIndexRef, position, objectReg, objectReg + 1, objectReg);
  }

  public static appendArrayRange(
    code: GeneratedCode,
    objectReg: number,
    indexFrom: GeneratedCode,
    indexTo: GeneratedCode,
    indexInterval: GeneratedCode,
    position: TokenPosition,
    isReference: boolean,
  ) {
    CodeGenerator.appendTo(code, indexFrom, objectReg + 1);
    CodeGenerator.appendTo(code, indexTo, objectReg + 2);
    if (indexInterval) {
      CodeGenerator.appendTo(code, indexInterval, objectReg + 3);
    }
    code.add(
      isReference ? InstructionType.CreateArrayRangeRef : InstructionType.ReadArrayRange,
      position,
      objectReg,
      objectReg + 1,
      objectReg + 2,
      InstructionType.None,
      indexInterval ? objectReg + 3 : -1,
      objectReg,
    );
  }

  public static createVarReference(identifier: number, scope: ReferenceScope, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.CreateVarRef, position, identifier, 0, scope);
    ret.success = true;
    return ret;
  }

  public static list(records: GeneratedCode[], position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.List, position, 0);
    for (const record of records) {
      CodeGenerator.appendTo(ret, record, 1);
      ret.add(InstructionType.ListAdd, null, 1, 0);
    }
    ret.success = true;
    return ret;
  }

  public static tuple(records: GeneratedCode[], position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.Tuple, position, 0);
    for (const record of records) {
      CodeGenerator.appendTo(ret, record, 1);
      ret.add(InstructionType.TupleAdd, null, 1, 0);
    }
    ret.success = true;
    return ret;
  }

  public static dictionary(literals: string[], values: GeneratedCode[], compilerContext: CompilerContext, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.Dictionary, position, 0);
    for (let i = 0; i < literals.length; i++) {
      const identifier = compilerContext.getIdentifier(literals[i]);
      CodeGenerator.appendTo(ret, values[i], 1);
      ret.add(InstructionType.DictionaryAdd, null, 1, identifier, 0);
    }
    ret.success = true;
    return ret;
  }

  public static set(records: GeneratedCode[], position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.Set, position, 0);
    for (const record of records) {
      CodeGenerator.appendTo(ret, record, 1);
      ret.add(InstructionType.SetAdd, null, 1, 0);
    }
    ret.success = true;
    return ret;
  }

  public static conditionalExpression(
    condition: GeneratedCode,
    ifPart: GeneratedCode,
    elsePart: GeneratedCode,
    compilerContext: CompilerContext,
    position: TokenPosition,
  ): GeneratedCode {
    const ret = new GeneratedCode();
    CodeGenerator.appendTo(ret, condition);
    const elseLabel = compilerContext.getNewLabel();
    ret.add(InstructionType.GetBool, position, 0, 0);
    ret.add(InstructionType.Condition, position, 0, elseLabel);
    const endLabel = compilerContext.getNewLabel();
    CodeGenerator.appendTo(ret, ifPart);
    ret.add(InstructionType.GoTo, null, endLabel);
    ret.add(InstructionType.Label, null, elseLabel);
    CodeGenerator.appendTo(ret, elsePart);
    ret.add(InstructionType.Label, null, endLabel);
    ret.success = true;
    return ret;
  }

  public static literal(literal: Literal, compilerContext: CompilerContext, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    const litId = compilerContext.getLiteral(literal);
    ret.add(InstructionType.Literal, position, 0, litId);
    ret.success = true;
    return ret;
  }

  public static bool(value: number, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.Bool, position, value, 0);
    ret.success = true;
    return ret;
  }

  public static none(position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.None, position, 0);
    ret.success = true;
    return ret;
  }
}
