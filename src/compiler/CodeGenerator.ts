import { GeneratedCode, Instruction } from '../common/Instructions';
import { CompilerContext } from './CompilerContext';
import { OperatorDelimiterType, Token, TokenPosition, TokenType } from './Token';
import { KeywordType } from './Keyword';
import { Literal } from './Literal';
import { CompilerBlockContext, CompilerBlockType } from './CompilerBlockContext';
import { InstructionType } from '../common/InstructionType';
import { ReferenceScope } from '../machine/objects/ReferenceObject';
import { PyErrorType } from '../api/ErrorType';

export class Comprehension {
  public code: GeneratedCode;
  public forArgument: Token;
}

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

  // public static forCycle(variable: string, position: TokenPosition, expression: GeneratedCode, body: GeneratedCode, context: CompilerContext): GeneratedCode {
  public static forCycle(parts: CompilerBlockContext[], context: CompilerContext): GeneratedCode {
    const forPart = parts[0];
    const varId = forPart.arg1;
    const noBreakPart = parts[1];
    const ret = new GeneratedCode();
    CodeGenerator.appendTo(ret, forPart.arg2);
    ret.add(InstructionType.IReadProperty, forPart.position, context.getIdentifier('__iter__'), 0, 1);
    ret.add(InstructionType.ICallMethod, forPart.position, 0, 1, 0);
    const endLabel = context.getNewLabel();
    const startLabel = context.getNewLabel();
    const noBreakLabel = noBreakPart ? context.getNewLabel() : -1;
    ret.add(InstructionType.IForCycle, forPart.position, endLabel, noBreakLabel);
    ret.add(InstructionType.ICreateVarRef, forPart.position, varId, 1, ReferenceScope.Default);
    ret.add(InstructionType.ILabel, forPart.position, startLabel);
    ret.add(InstructionType.IReadProperty, forPart.position, context.getIdentifier('__next__'), 0, 3);
    ret.add(InstructionType.ICallMethod, forPart.position, 0, 3, 2);
    ret.add(InstructionType.ICopyValue, forPart.position, 2, 1);
    CodeGenerator.appendTo(ret, forPart.blockCode, 2);
    ret.add(InstructionType.IGoTo, null, startLabel);

    if (noBreakPart) {
      ret.add(InstructionType.ILabel, noBreakPart.position, noBreakLabel);
      CodeGenerator.appendTo(ret, noBreakPart.blockCode);
    }

    ret.add(InstructionType.ILabel, null, endLabel);
    ret.success = true;
    return ret;
  }

  public static whileCycle(condition: GeneratedCode, body: GeneratedCode, context: CompilerContext, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    const startLabel = context.getNewLabel();
    const endLabel = context.getNewLabel();
    ret.add(InstructionType.IWhileCycle, position, endLabel);
    ret.add(InstructionType.ILabel, position, startLabel);
    CodeGenerator.appendTo(ret, condition);
    ret.add(InstructionType.IGetBool, null, 0, 0);
    ret.add(InstructionType.ICondition, null, 0, endLabel);
    CodeGenerator.appendTo(ret, body);
    ret.add(InstructionType.IGoTo, null, startLabel);
    ret.add(InstructionType.ILabel, null, endLabel);
    ret.add(InstructionType.ILeaveCycle, null);
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
          ret.add(InstructionType.IGetBool, part.position, 0, 0);
          ret.add(InstructionType.ICondition, part.position, 0, nextLabel);
          CodeGenerator.appendTo(ret, part.blockCode);
          ret.add(InstructionType.IGoTo, part.position, endLabel);
          ret.add(InstructionType.ILabel, null, nextLabel);
          break;
        }
        case CompilerBlockType.Else: {
          CodeGenerator.appendTo(ret, part.blockCode);
          break;
        }
      }
    }
    ret.add(InstructionType.ILabel, null, endLabel);
    ret.success = true;
    return ret;
  }

  public static tryExcept(parts: CompilerBlockContext[], context: CompilerContext): GeneratedCode {
    const ret = new GeneratedCode();
    const finishTry = context.getNewLabel();

    let finallyPart: CompilerBlockContext;
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
      }
    }

    ret.add(InstructionType.IEnterTry, tryPart.position, tryPart.blockCode.code.length + 2);
    CodeGenerator.appendTo(ret, tryPart.blockCode);
    ret.add(InstructionType.IGoTo, null, finallyPart ? finallyPart.arg1 : finishTry);
    if (finallyPart) {
      ret.add(InstructionType.IGotoFinally, null, finallyPart.arg1);
    }
    for (const part of exceptParts) {
      if (!part.arg4 || !part.arg4.length) {
        ret.add(InstructionType.IGotoExcept, part.position, -1, part.label);
      } else {
        for (const type of part.arg4) {
          ret.add(InstructionType.IGotoExcept, part.position, type, part.label);
        }
      }
    }

    if (finallyPart) {
      ret.add(InstructionType.ILabel, finallyPart.position, finallyPart.label);
      ret.add(InstructionType.IEnterFinally, finallyPart.position);
      CodeGenerator.appendTo(ret, finallyPart.blockCode);
      ret.add(InstructionType.ILeaveFinally, null);
      if (exceptParts.length) {
        ret.add(InstructionType.IGoTo, null, finishTry);
      }
    }

    for (const part of exceptParts) {
      ret.add(InstructionType.ILabel, part.position, part.label);
      ret.add(InstructionType.IEnterExcept, part.position, part.arg1);
      CodeGenerator.appendTo(ret, part.blockCode);
      if (finallyPart) {
        ret.add(InstructionType.IGoTo, null, finallyPart.label);
      } else if (part !== exceptParts[exceptParts.length - 1]) {
        ret.add(InstructionType.IGoTo, null, finishTry);
      }
    }

    ret.add(InstructionType.ILabel, null, finishTry);
    ret.add(InstructionType.ILeaveTry, null);
    ret.success = true;
    return ret;
  }

  public static importDirective(path: string, context: CompilerContext, position: TokenPosition): GeneratedCode {
    const id = context.getIdentifier(path);
    const ret = new GeneratedCode();
    ret.add(InstructionType.IImport, position, id);
    ret.success = true;
    return ret;
  }

  public static importAsDirective(path: string, rename: string, context: CompilerContext, position: TokenPosition): GeneratedCode {
    const id = context.getIdentifier(path);
    const as = context.getIdentifier(rename);
    const ret = new GeneratedCode();
    ret.add(InstructionType.IImportAs, position, id, as);
    ret.success = true;
    return ret;
  }

  public static importFromDirective(func: string, module: string, context: CompilerContext, position: TokenPosition): GeneratedCode {
    const funcId = context.getIdentifier(func);
    const moduleId = context.getIdentifier(module);
    const ret = new GeneratedCode();
    ret.add(InstructionType.IImportFrom, position, funcId, moduleId);
    ret.success = true;
    return ret;
  }

  public static pass(position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.IPass, position);
    ret.success = true;
    return ret;
  }

  public static breakCode(position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.IBreak, position);
    ret.success = true;
    return ret;
  }

  public static continueCode(position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.IContinue, position);
    ret.success = true;
    return ret;
  }

  public static raise(expression: GeneratedCode, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    CodeGenerator.appendTo(ret, expression);
    ret.add(InstructionType.IRaise, position, 0);
    ret.success = true;
    return ret;
  }

  public static returnEmpty(position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.IRet, position, -1);
    ret.success = true;
    return ret;
  }

  public static returnValue(expression: GeneratedCode, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    CodeGenerator.appendTo(ret, expression);
    ret.add(InstructionType.IRet, position, 0);
    ret.success = true;
    return ret;
  }

  public static yield(expression: GeneratedCode, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    CodeGenerator.appendTo(ret, expression);
    ret.add(InstructionType.IYield, position, 0);
    ret.success = true;
    return ret;
  }

  public static appendFunctionCall(code: GeneratedCode, args: GeneratedCode[], compilerContext: CompilerContext, position: TokenPosition, parentAt0: boolean): boolean {
    let argIndex = 0;
    const argReg = 1 + (parentAt0 ? 1 : 0);
    for (const arg of args) {
      CodeGenerator.appendTo(code, arg, argReg);
      if (!arg.nameLiteral) {
        code.add(InstructionType.IRegArg, position, argReg, argIndex);
        argIndex++;
      } else {
        const nameId = compilerContext.getIdentifier(arg.nameLiteral);
        code.add(InstructionType.IRegArgName, position, argReg, nameId);
      }
    }
    if (parentAt0) {
      code.add(InstructionType.ICallMethod, position, 0, 1, 0);
    } else {
      code.add(InstructionType.ICallFunc, position, 0, 0);
    }
    return true;
  }

  public static readFunctionDef(defIndex: number, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.ICreateFunc, position, defIndex, 0);
    ret.success = true;
    return ret;
  }

  public static unaryOperators(unaryOperators: Token[], source: GeneratedCode, compilerContext: CompilerContext): GeneratedCode {
    const ret = new GeneratedCode();
    CodeGenerator.appendTo(ret, source);
    for (const token of unaryOperators) {
      if (token.type === TokenType.Operator && token.arg1 === OperatorDelimiterType.Invert) {
        ret.add(InstructionType.IBinInv, token.getPosition(), 0, 0);
      } else if (token.type === TokenType.Keyword && token.arg1 === KeywordType.KeywordNot) {
        ret.add(InstructionType.IGetBool, token.getPosition(), 0, 0);
        ret.add(InstructionType.ILogicalNot, token.getPosition(), 0, 0);
      } else if (token.type === TokenType.Operator && token.arg1 === OperatorDelimiterType.Plus) {
        // do nothing
      } else if (token.type === TokenType.Operator && token.arg1 === OperatorDelimiterType.Minus) {
        ret.add(InstructionType.IInvert, token.getPosition(), 0, 0);
      } else {
        ret.success = false;
        compilerContext.addError(PyErrorType.ErrorUnexpectedScenario_CodeGenerator_UnknownUnaryOperator, token);
        return ret;
      }
    }
    ret.success = true;
    return ret;
  }

  public static binaryOperator(left: GeneratedCode, op: Token, right: GeneratedCode, compilerContext: CompilerContext): GeneratedCode {
    const ret = new GeneratedCode();
    CodeGenerator.appendTo(ret, left);
    let opType = InstructionType.IPass;
    if (op.type === TokenType.Keyword) {
      switch (op.arg1) {
        case KeywordType.KeywordAnd:
          opType = InstructionType.ILogicalAnd;
          break;
        case KeywordType.KeywordOr:
          opType = InstructionType.ILogicalOr;
          break;
      }
      if (opType !== InstructionType.IPass) {
        ret.add(InstructionType.IGetBool, op.getPosition(), 0, 0);
        ret.add(opType, op.getPosition(), 0, 0, right.code.length + 1);
        CodeGenerator.appendTo(ret, right);
        ret.add(InstructionType.IGetBool, op.getPosition(), 0, 0);
      }
    }
    CodeGenerator.appendTo(ret, right, 1);
    if (op.type === TokenType.Operator) {
      switch (op.arg1) {
        case OperatorDelimiterType.Plus:
          opType = InstructionType.IAdd;
          break;
        case OperatorDelimiterType.Minus:
          opType = InstructionType.ISub;
          break;
        case OperatorDelimiterType.Multiply:
          opType = InstructionType.IMul;
          break;
        case OperatorDelimiterType.Power:
          opType = InstructionType.IPow;
          break;
        case OperatorDelimiterType.Divide:
          opType = InstructionType.IDiv;
          break;
        case OperatorDelimiterType.FloorDivide:
          opType = InstructionType.IFloor;
          break;
        case OperatorDelimiterType.Modulus:
          opType = InstructionType.IMod;
          break;
        case OperatorDelimiterType.At:
          opType = InstructionType.IAt;
          break;
        case OperatorDelimiterType.ShiftLeft:
          opType = InstructionType.IShl;
          break;
        case OperatorDelimiterType.ShiftRight:
          opType = InstructionType.IShr;
          break;
        case OperatorDelimiterType.And:
          opType = InstructionType.IBinAnd;
          break;
        case OperatorDelimiterType.Or:
          opType = InstructionType.IBinOr;
          break;
        case OperatorDelimiterType.Xor:
          opType = InstructionType.IBinXor;
          break;
        case OperatorDelimiterType.Less:
          opType = InstructionType.ILess;
          break;
        case OperatorDelimiterType.Greater:
          opType = InstructionType.IGreater;
          break;
        case OperatorDelimiterType.LessEqual:
          opType = InstructionType.ILessEq;
          break;
        case OperatorDelimiterType.GreaterEqual:
          opType = InstructionType.IGreaterEq;
          break;
        case OperatorDelimiterType.Equal:
          opType = InstructionType.IEqual;
          break;
        case OperatorDelimiterType.NotEqual:
          opType = InstructionType.INotEq;
          break;
      }
    } else if (op.type === TokenType.Keyword) {
      switch (op.arg1) {
        case KeywordType.KeywordIs:
          opType = InstructionType.IIs;
          break;
        case KeywordType.KeywordIsNot:
          opType = InstructionType.IIsNot;
          break;
        case KeywordType.KeywordIn:
          opType = InstructionType.IIn;
          break;
        case KeywordType.KeywordNotIn:
          opType = InstructionType.INotIn;
          break;
      }
    }
    if (opType === InstructionType.IPass) {
      ret.success = false;
      compilerContext.addError(PyErrorType.ErrorUnexpectedScenario_CodeGenerator_UnknownBinaryOperator, op);
      return ret;
    }
    ret.add(opType, op.getPosition(), 0, 1, 0);
    ret.success = true;
    return ret;
  }

  private static prepareReference(code: GeneratedCode, identifiers: string[], length: number, compilerContext: CompilerContext, position: TokenPosition) {
    code.add(InstructionType.IReadObject, position, compilerContext.getIdentifier(identifiers[0]), 0);
    for (let i = 1; i < length; i++) {
      code.add(InstructionType.IReadProperty, position, compilerContext.getIdentifier(identifiers[i]), 0, 0);
    }
  }

  public static createReference(identifiers: string[], compilerContext: CompilerContext, position: TokenPosition) {
    const ret = new GeneratedCode();
    if (identifiers.length > 1) {
      CodeGenerator.prepareReference(ret, identifiers, identifiers.length - 1, compilerContext, position);
      ret.add(InstructionType.IIdentifier, position, 1, compilerContext.getIdentifier(identifiers[identifiers.length - 1]));
      ret.add(InstructionType.ICreatePropertyRef, position, 0, 1, 0);
    } else {
      ret.add(InstructionType.ICreateVarRef, position, compilerContext.getIdentifier(identifiers[0]), 0, ReferenceScope.Default);
    }
    ret.success = true;
    return ret;
  }

  public static appendPropertyReference(code: GeneratedCode, objectReg: number, identifier: number, position: TokenPosition) {
    code.add(InstructionType.IIdentifier, position, objectReg + 1, identifier);
    code.add(InstructionType.ICreatePropertyRef, position, objectReg, objectReg + 1, objectReg);
  }

  public static appendArrayIndexerReference(code: GeneratedCode, objectReg: number, indexExpression: GeneratedCode, position: TokenPosition) {
    CodeGenerator.appendTo(code, indexExpression, objectReg + 1);
    code.add(InstructionType.ICreateArrayIndexRef, position, objectReg, objectReg + 1, objectReg);
  }

  public static createVarReference(identifier: number, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.ICreateVarRef, position, identifier, 0, ReferenceScope.Default);
    ret.success = true;
    return ret;
  }

  public static deleteProperty(identifiers: string[], compilerContext: CompilerContext, position: TokenPosition) {
    const ret = new GeneratedCode();
    CodeGenerator.prepareReference(ret, identifiers, identifiers.length - 1, compilerContext, position);
    ret.add(InstructionType.IDel, position, 0, compilerContext.getIdentifier(identifiers[identifiers.length - 1]));
    ret.success = true;
    return ret;
  }

  public static list(records: GeneratedCode[], position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.IList, position, 0);
    for (const record of records) {
      CodeGenerator.appendTo(ret, record, 1);
      ret.add(InstructionType.IListAdd, null, 1, 0);
    }
    ret.success = true;
    return ret;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static comprehension(expression: GeneratedCode, parts: Comprehension[], position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.success = false;
    // TODO: implement comprehension
    return ret;
  }

  public static tuple(records: GeneratedCode[], position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.ITuple, position, 0);
    for (const record of records) {
      CodeGenerator.appendTo(ret, record, 1);
      ret.add(InstructionType.ITupleAdd, null, 1, 0);
    }
    ret.success = true;
    return ret;
  }

  public static dictionary(literals: string[], values: GeneratedCode[], compilerContext: CompilerContext, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.IDictionary, position, 0);
    for (let i = 0; i < literals.length; i++) {
      const identifier = compilerContext.getIdentifier(literals[i]);
      CodeGenerator.appendTo(ret, values[i], 1);
      ret.add(InstructionType.IDictionaryAdd, null, 1, identifier, 0);
    }
    ret.success = true;
    return ret;
  }

  public static set(records: GeneratedCode[], position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.ISet, position, 0);
    for (const record of records) {
      CodeGenerator.appendTo(ret, record, 1);
      ret.add(InstructionType.ISetAdd, null, 1, 0);
    }
    ret.success = true;
    return ret;
  }

  public static conditionalExpression(condition: GeneratedCode, ifPart: GeneratedCode, elsePart: GeneratedCode, compilerContext: CompilerContext, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    CodeGenerator.appendTo(ret, condition);
    const elseLabel = compilerContext.getNewLabel();
    ret.add(InstructionType.IGetBool, position, 0, 0);
    ret.add(InstructionType.ICondition, position, 0, elseLabel);
    const endLabel = compilerContext.getNewLabel();
    CodeGenerator.appendTo(ret, ifPart);
    ret.add(InstructionType.IGoTo, null, endLabel);
    ret.add(InstructionType.ILabel, null, elseLabel);
    CodeGenerator.appendTo(ret, elsePart);
    ret.add(InstructionType.ILabel, null, endLabel);
    ret.success = true;
    return ret;
  }

  public static literal(literal: Literal, compilerContext: CompilerContext, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    const litId = compilerContext.getLiteral(literal);
    ret.add(InstructionType.ILiteral, position, 0, litId);
    ret.success = true;
    return ret;
  }

  public static bool(value: number, position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.IBool, position, value, 0);
    ret.success = true;
    return ret;
  }

  public static none(position: TokenPosition): GeneratedCode {
    const ret = new GeneratedCode();
    ret.add(InstructionType.INone, position, 0);
    ret.success = true;
    return ret;
  }
}
