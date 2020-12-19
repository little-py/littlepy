import { Instruction } from './Instructions';
import { DelimiterType, OperatorType, Token, TokenPosition, TokenType } from '../api/Token';
import { KeywordType } from '../api/Keyword';
import { InstructionType } from './InstructionType';
import { PyErrorType } from '../api/ErrorType';
import { CodeFragmentInst } from './CodeFragmentInst';
import { CodeGenerator } from '../api/CodeGenerator';
import { CompilerBlockContext, CompilerBlockType } from '../api/CompilerBlockContext';
import { CompilerContext } from '../api/CompilerContext';
import { ReferenceScope } from '../api/ReferenceScope';
import { Literal, LiteralType } from '../api/Literal';
import { FullCodeInst } from './FullCodeInst';
import { PyModule } from '../api/Module';
import { FunctionBody } from '../api/FunctionBody';

/* istanbul ignore next */
export function createDebugInformation(module: PyModule, instructions: Instruction[]): void {
  /* istanbul ignore next */
  const functionToText = (arg: number): string => {
    const func = module.functions[arg];
    if (!func) {
      return `unknown!function#${arg}`;
    }
    return func.name;
  };

  /* istanbul ignore next */
  const literalToText = (arg: number): string => {
    const literal = module.literals[arg];
    if (!literal) {
      return `unknown!literal#${arg}`;
    }
    const type = literal.type & LiteralType.LiteralMask;
    switch (type) {
      case LiteralType.FloatingPoint:
      case LiteralType.Integer:
        return literal.integer.toString();
      default:
        return `'${literal.string}'`;
    }
  };

  /* istanbul ignore next */
  const idToText = (arg: number): string => {
    const identifier = module.identifiers[arg];
    if (identifier === undefined) {
      return `unknown!identifier#${arg}`;
    }
    return identifier;
  };

  for (const i of instructions) {
    switch (i.type) {
      case InstructionType.CreateFunc:
        i.debug = `reg${i.arg2} = function ${functionToText(i.arg1)}(...)`;
        break;
      case InstructionType.Literal:
        i.debug = `reg${i.arg1} = ${literalToText(i.arg2)}`;
        break;
      case InstructionType.CreateVarRef:
        i.debug = `reg${i.arg2} = reference(${idToText(i.arg1)})${
          i.arg3 === ReferenceScope.Default ? '' : i.arg3 === ReferenceScope.Global ? '// global scope' : '// nonlocal scope'
        }`;
        break;
      case InstructionType.CreateArrayIndexRef:
        i.debug = `reg${i.arg3} = reference(reg${i.arg1}[reg${i.arg2}])`;
        break;
      case InstructionType.CreatePropertyRef:
        i.debug = `reg${i.arg3} = reference(reg${i.arg1}[reg${i.arg2}])`;
        break;
      case InstructionType.CopyValue:
        i.debug = `*reg${i.arg2} = *reg${i.arg1}`;
        break;
      case InstructionType.AugmentedCopy:
        i.debug = `reg${i.arg1} = reg${i.arg1} ${i.arg4} reg${i.arg2}`;
        break;
      case InstructionType.Add:
        i.debug = `reg${i.arg3} = reg${i.arg1} + reg${i.arg2}`;
        break;
      case InstructionType.Sub:
        i.debug = `reg${i.arg3} = reg${i.arg1} - reg${i.arg2}`;
        break;
      case InstructionType.Mul:
        i.debug = `reg${i.arg3} = reg${i.arg1} * reg${i.arg2}`;
        break;
      case InstructionType.Div:
        i.debug = `reg${i.arg3} = reg${i.arg1} / reg${i.arg2}`;
        break;
      case InstructionType.Pow:
        i.debug = `reg${i.arg3} = reg${i.arg1} ** reg${i.arg2}`;
        break;
      case InstructionType.Floor:
        i.debug = `reg${i.arg3} = reg${i.arg1} // reg${i.arg2}`;
        break;
      case InstructionType.Mod:
        i.debug = `reg${i.arg3} = reg${i.arg1} % reg${i.arg2}`;
        break;
      case InstructionType.At:
        i.debug = `reg${i.arg3} = reg${i.arg1} @ reg${i.arg2}`;
        break;
      case InstructionType.Shl:
        i.debug = `reg${i.arg3} = reg${i.arg1} << reg${i.arg2}`;
        break;
      case InstructionType.Shr:
        i.debug = `reg${i.arg3} = reg${i.arg1} >> reg${i.arg2}`;
        break;
      case InstructionType.BinAnd:
        i.debug = `reg${i.arg3} = reg${i.arg1} & reg${i.arg2}`;
        break;
      case InstructionType.BinOr:
        i.debug = `reg${i.arg3} = reg${i.arg1} | reg${i.arg2}`;
        break;
      case InstructionType.BinXor:
        i.debug = `reg${i.arg3} = reg${i.arg1} ^ reg${i.arg2}`;
        break;
      case InstructionType.BinInv:
        i.debug = `reg${i.arg2} = ~reg${i.arg1}`;
        break;
      case InstructionType.Label:
        i.debug = `:label${i.arg1}`;
        break;
      case InstructionType.Condition:
        i.debug = `if reg${i.arg1} is False jump to label${i.arg2}`;
        break;
      case InstructionType.Less:
        i.debug = `reg${i.arg3} = reg${i.arg1} < reg${i.arg2}`;
        break;
      case InstructionType.Greater:
        i.debug = `reg${i.arg3} = reg${i.arg1} > reg${i.arg2}`;
        break;
      case InstructionType.LessEq:
        i.debug = `reg${i.arg3} = reg${i.arg1} <= reg${i.arg2}`;
        break;
      case InstructionType.GreaterEq:
        i.debug = `reg${i.arg3} = reg${i.arg1} >= reg${i.arg2}`;
        break;
      case InstructionType.Equal:
        i.debug = `reg${i.arg3} = reg${i.arg1} == reg${i.arg2}`;
        break;
      case InstructionType.NotEq:
        i.debug = `reg${i.arg3} = reg${i.arg1} != reg${i.arg2}`;
        break;
      case InstructionType.RegArg:
        i.debug = `argument${i.arg2} = reg${i.arg1}`;
        break;
      case InstructionType.RegArgName:
        i.debug = `argument '${idToText(i.arg2)}' = reg${i.arg1}`;
        break;
      case InstructionType.CallFunc:
        i.debug = `reg${i.arg2} = reg${i.arg1}(...)`;
        break;
      case InstructionType.Ret:
        i.debug = `i.debug = reg${i.arg1}`;
        break;
      case InstructionType.Raise:
        if (i.arg1 === -1) {
          i.debug = 're-raise current exception';
        } else {
          i.debug = `raise reg${i.arg1}`;
        }
        break;
      case InstructionType.GetBool:
        i.debug = `reg${i.arg2} = bool(reg${i.arg1})`;
        break;
      case InstructionType.LogicalNot:
        i.debug = `reg${i.arg2} = not reg${i.arg1}`;
        break;
      case InstructionType.LogicalAnd:
        i.debug = `if reg${i.arg1} == False: reg${i.arg2} = False else: skip next ${i.arg3} instructions`;
        break;
      case InstructionType.LogicalOr:
        i.debug = `if reg${i.arg1} == True reg${i.arg2} = True else: skip next ${i.arg3} instructions`;
        break;
      case InstructionType.Invert:
        i.debug = `reg${i.arg2} = -reg${i.arg1}`;
        break;
      case InstructionType.List:
        i.debug = `reg${i.arg1} = new list()`;
        break;
      case InstructionType.ListAdd:
        i.debug = `list reg${i.arg1}.add(reg${i.arg2})`;
        break;
      case InstructionType.Tuple:
        i.debug = `reg${i.arg1} = new tuple()`;
        break;
      case InstructionType.TupleAdd:
        i.debug = `tuple reg${i.arg2}.add(reg${i.arg1})`;
        break;
      case InstructionType.Set:
        i.debug = `reg${i.arg1} = new set()`;
        break;
      case InstructionType.SetAdd:
        i.debug = `set reg${i.arg2}.add(reg${i.arg1})`;
        break;
      case InstructionType.Dictionary:
        i.debug = `reg${i.arg1} = new dictionary()`;
        break;
      case InstructionType.DictionaryAdd:
        i.debug = `put value reg${i.arg1} and key '${idToText(i.arg2)}' into dictionary in reg${i.arg3}`;
        break;
      case InstructionType.ForCycle:
        if (i.arg2 === -1) {
          i.debug = `start for cycle, exit on label${i.arg1}`;
        } else {
          i.debug = `start for cycle, exit on label${i.arg1}; nobreak: label${i.arg2}`;
        }
        break;
      case InstructionType.WhileCycle:
        i.debug = `start while cycle, exit on label${i.arg1}`;
        break;
      case InstructionType.GoTo:
        i.debug = `jump to label${i.arg1}`;
        break;
      case InstructionType.Import:
        i.debug = `import ${idToText(i.arg1)}`;
        break;
      case InstructionType.ImportAs:
        i.debug = `import ${idToText(i.arg1)} as ${idToText(i.arg2)}`;
        break;
      case InstructionType.ImportFrom:
        i.debug = `import function ${idToText(i.arg1)} from module ${idToText(i.arg2)}`;
        break;
      case InstructionType.EnterTry:
        i.debug = `start try section, handlers table is ${i.arg1} instructions forward`;
        break;
      case InstructionType.EnterFinally:
        i.debug = `enter finally section`;
        break;
      case InstructionType.EnterExcept:
        if (i.arg1 !== -1) {
          i.debug = `enter except section; ${idToText(i.arg1)} = exception`;
        } else {
          i.debug = `enter except section`;
        }
        break;
      case InstructionType.GotoExcept:
        if (i.arg1 === -1) {
          i.debug = `start except block for all exceptions from label${i.arg2}`;
        } else {
          i.debug = `start except block for class ${idToText(i.arg1)} from label${i.arg2}`;
        }
        break;
      case InstructionType.GotoFinally:
        i.debug = `indicate finally block to start on label${i.arg1}`;
        break;
      case InstructionType.LeaveTry:
        i.debug = `end try section`;
        break;
      case InstructionType.LeaveFinally:
        i.debug = `end finally section`;
        break;
      case InstructionType.LeaveCycle:
        i.debug = `end cycle (while/for)`;
        break;
      case InstructionType.Continue:
        i.debug = `continue to next cycle iteration`;
        break;
      case InstructionType.Break:
        i.debug = `break current cycle`;
        break;
      case InstructionType.ReadObject:
        i.debug = `reg${i.arg2} = ${idToText(i.arg1)}`;
        break;
      case InstructionType.ReadProperty:
        i.debug = `reg${i.arg3} = reg${i.arg2}.${idToText(i.arg1)}`;
        break;
      case InstructionType.Identifier:
        i.debug = `reg${i.arg1} = '${idToText(i.arg2)}'`;
        break;
      case InstructionType.Bool:
        i.debug = `reg${i.arg2} = Boolean(${i.arg1 !== 0 ? 'True' : 'False'})`;
        break;
      case InstructionType.None:
        i.debug = `reg${i.arg1} = None`;
        break;
      case InstructionType.Is:
        i.debug = `reg${i.arg3} = reg${i.arg1} is reg${i.arg2}`;
        break;
      case InstructionType.IsNot:
        i.debug = `reg${i.arg3} = reg${i.arg1} is not reg${i.arg2}`;
        break;
      case InstructionType.In:
        i.debug = `reg${i.arg3} = reg${i.arg1} in reg${i.arg2}`;
        break;
      case InstructionType.NotIn:
        i.debug = `reg${i.arg3} = reg${i.arg1} not in reg${i.arg2}`;
        break;
      case InstructionType.Pass:
        i.debug = 'pass';
        break;
      case InstructionType.Del:
        i.debug = `delete reg${i.arg1}.${idToText(i.arg2)}`;
        break;
      case InstructionType.ReadArrayIndex:
        i.debug = `reg${i.arg3} = reg${i.arg1}[reg${i.arg2}]`;
        break;
      case InstructionType.CallMethod:
        i.debug = `reg${i.arg3} = reg${i.arg1}.reg${i.arg2}(arg1, arg2, arg3, ...)`;
        break;
      case InstructionType.Yield:
        i.debug = `yield reg${i.arg1}`;
        break;
      case InstructionType.CreateArrayRangeRef:
        if (i.arg5 !== -1) {
          i.debug = `reg${i.arg6} = *reg${i.arg1}[reg${i.arg2}:reg${i.arg3}:reg${i.arg5}]`;
        } else {
          i.debug = `reg${i.arg6} = *reg${i.arg1}[reg${i.arg2}:reg${i.arg3}]`;
        }
        break;
      case InstructionType.ReadArrayRange:
        if (i.arg5 !== -1) {
          i.debug = `reg${i.arg6} = reg${i.arg1}[reg${i.arg2}:reg${i.arg3}:reg${i.arg5}]`;
        } else {
          i.debug = `reg${i.arg6} = reg${i.arg1}[reg${i.arg2}:reg${i.arg3}]`;
        }
        break;
      default:
        i.debug = `unknown instruction ${i.type}`;
        break;
    }
  }
}

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
      // not implemented yet
      /* istanbul ignore next */
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

export class CodeGeneratorInst implements CodeGenerator {
  createFragment(): CodeFragmentInst {
    return new CodeFragmentInst();
  }

  getFullCode(code: CodeFragmentInst): FullCodeInst {
    return {
      instructions: code.code.map((i) => i.copy()),
    };
  }

  appendTo(tgt: CodeFragmentInst, src: CodeFragmentInst, shiftRight = 0): void {
    for (const sc of src.code) {
      const tc = sc.copy();
      if (shiftRight) {
        tc.shiftRight(shiftRight);
      }
      tgt.code.push(tc);
    }
  }

  comprehension(expression: CodeFragmentInst, parts: CompilerBlockContext[], context: CompilerContext): CodeFragmentInst {
    let intermediate = new CodeFragmentInst();
    this.appendTo(intermediate, expression);
    intermediate.add(InstructionType.Literal, parts[0].position, 0, -1);
    for (let i = parts.length - 1; i >= 0; i--) {
      const part = parts[i];
      const code = new CodeFragmentInst();
      if (part.type === CompilerBlockType.For) {
        part.blockCode = intermediate;
        this.forCycleInternal(code, part, null, context);
      } else {
        this.appendTo(code, part.arg2 as CodeFragmentInst);
        const nextLabel = context.getNewLabel();
        code.add(InstructionType.GetBool, part.position, 0, 0);
        code.add(InstructionType.Condition, part.position, 0, nextLabel);
        this.appendTo(code, intermediate);
        code.add(InstructionType.Label, null, nextLabel);
      }
      intermediate = code;
    }
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.List, parts[0].position, 0);
    this.appendTo(ret, intermediate, 1);
    const pos = ret.code.findIndex((c) => c.type === InstructionType.Literal && c.arg2 === -1);
    // noinspection UnnecessaryLocalVariableJS
    const reg = ret.code[pos].arg1;
    ret.code[pos] = new Instruction(InstructionType.ListAdd, parts[parts.length - 1].position, reg, 0);
    ret.success = true;
    return ret;
  }

  forCycleInternal(ret: CodeFragmentInst, forPart: CompilerBlockContext, noBreakPart: CompilerBlockContext, context: CompilerContext): void {
    this.appendTo(ret, forPart.arg2 as CodeFragmentInst);
    ret.add(InstructionType.ReadProperty, forPart.position, context.getIdentifierCode('__iter__'), 0, 1);
    ret.add(InstructionType.CallMethod, forPart.position, 0, 1, 0);
    const endLabel = context.getNewLabel();
    const startLabel = context.getNewLabel();
    const noBreakLabel = noBreakPart ? context.getNewLabel() : -1;
    ret.add(InstructionType.ForCycle, forPart.position, endLabel, noBreakLabel);
    ret.add(InstructionType.CreateVarRef, forPart.position, forPart.arg1, 1, ReferenceScope.Default);
    ret.add(InstructionType.Label, forPart.position, startLabel);
    ret.add(InstructionType.ReadProperty, forPart.position, context.getIdentifierCode('__next__'), 0, 3);
    ret.add(InstructionType.CallMethod, forPart.position, 0, 3, 2);
    ret.add(InstructionType.CopyValue, forPart.position, 2, 1);
    this.appendTo(ret, forPart.blockCode as CodeFragmentInst, 2);
    ret.add(InstructionType.GoTo, null, startLabel);

    if (noBreakPart) {
      ret.add(InstructionType.Label, noBreakPart.position, noBreakLabel);
      this.appendTo(ret, noBreakPart.blockCode as CodeFragmentInst);
    }

    ret.add(InstructionType.Label, null, endLabel);
    ret.add(InstructionType.LeaveCycle, null);
  }

  // public static forCycle(variable: string, position: TokenPosition, expression: GeneratedCode, body: GeneratedCode, context: CompilerContext): GeneratedCode {
  forCycle(parts: CompilerBlockContext[], context: CompilerContext): CodeFragmentInst {
    const forPart = parts[0];
    const noBreakPart = parts[1];
    const ret = new CodeFragmentInst();
    this.forCycleInternal(ret, forPart, noBreakPart, context);
    ret.success = true;
    return ret;
  }

  whileCycle(condition: CodeFragmentInst, body: CodeFragmentInst, context: CompilerContext, position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    const startLabel = context.getNewLabel();
    const endLabel = context.getNewLabel();
    ret.add(InstructionType.WhileCycle, position, endLabel);
    ret.add(InstructionType.Label, position, startLabel);
    this.appendTo(ret, condition);
    ret.add(InstructionType.GetBool, null, 0, 0);
    ret.add(InstructionType.Condition, null, 0, endLabel);
    this.appendTo(ret, body);
    ret.add(InstructionType.GoTo, null, startLabel);
    ret.add(InstructionType.Label, null, endLabel);
    ret.add(InstructionType.LeaveCycle, null);
    ret.success = true;
    return ret;
  }

  condition(parts: CompilerBlockContext[], context: CompilerContext): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    const endLabel = context.getNewLabel();
    for (const part of parts) {
      switch (part.type) {
        case CompilerBlockType.If:
        case CompilerBlockType.ElseIf: {
          this.appendTo(ret, part.arg2 as CodeFragmentInst);
          const nextLabel = context.getNewLabel();
          ret.add(InstructionType.GetBool, part.position, 0, 0);
          ret.add(InstructionType.Condition, part.position, 0, nextLabel);
          this.appendTo(ret, part.blockCode as CodeFragmentInst);
          ret.add(InstructionType.GoTo, null, endLabel);
          ret.add(InstructionType.Label, null, nextLabel);
          break;
        }
        case CompilerBlockType.Else: {
          this.appendTo(ret, part.blockCode as CodeFragmentInst);
          break;
        }
      }
    }
    ret.add(InstructionType.Label, null, endLabel);
    ret.success = true;
    return ret;
  }

  tryExcept(parts: CompilerBlockContext[], context: CompilerContext): CodeFragmentInst {
    const ret = new CodeFragmentInst();
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
      } else {
        //if (part.type === CompilerBlockType.Else) {
        elsePart = part;
        part.label = context.getNewLabel();
      }
    }

    ret.add(InstructionType.EnterTry, tryPart.position, (tryPart.blockCode as CodeFragmentInst).code.length + 2);
    this.appendTo(ret, tryPart.blockCode as CodeFragmentInst);
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
      this.appendTo(ret, finallyPart.blockCode as CodeFragmentInst);
      ret.add(InstructionType.LeaveFinally, null);
      if (exceptParts.length) {
        ret.add(InstructionType.GoTo, null, finishTry);
      }
    }

    for (const part of exceptParts) {
      ret.add(InstructionType.Label, part.position, part.label);
      ret.add(InstructionType.EnterExcept, part.position, part.arg1);
      this.appendTo(ret, part.blockCode as CodeFragmentInst);
      if (finallyPart) {
        ret.add(InstructionType.GoTo, null, finallyPart.label);
      } else if (part !== exceptParts[exceptParts.length - 1]) {
        ret.add(InstructionType.GoTo, null, finishTry);
      }
    }

    ret.add(InstructionType.Label, null, finishTry);
    ret.add(InstructionType.LeaveTry, null);
    if (elsePart) {
      this.appendTo(ret, elsePart.blockCode as CodeFragmentInst);
    }
    ret.success = true;
    return ret;
  }

  with(
    identifier: number,
    expression: CodeFragmentInst,
    block: CodeFragmentInst,
    context: CompilerContext,
    position: TokenPosition,
  ): CodeFragmentInst {
    const finishLabel = context.getNewLabel();
    const exceptLabel = context.getNewLabel();
    const exitLabel = context.getNewLabel();
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.CreateVarRef, position, identifier, 0, ReferenceScope.Default);
    this.appendTo(ret, expression, 1);
    ret.add(InstructionType.ReadProperty, position, context.getIdentifierCode('__enter__'), 1, 2);
    ret.add(InstructionType.CallMethod, position, 1, 2, 2);
    ret.add(InstructionType.CopyValue, position, 2, 0);
    ret.add(InstructionType.EnterTry, position, block.code.length + 2);
    this.appendTo(ret, block);
    ret.add(InstructionType.GoTo, position, finishLabel);
    ret.add(InstructionType.GotoExcept, position, -1, exceptLabel);
    ret.add(InstructionType.Label, position, exceptLabel);
    ret.add(InstructionType.EnterExcept, position, -1);

    // call __exit__ with exception
    ret.add(InstructionType.ReadObject, position, identifier, 0);
    ret.add(InstructionType.ReadProperty, position, context.getIdentifierCode('__exit__'), 0, 1);
    ret.add(InstructionType.ReadObject, position, context.getIdentifierCode('__sys__'), 2);
    ret.add(InstructionType.ReadProperty, position, context.getIdentifierCode('exc_info'), 2, 3);
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
    ret.add(InstructionType.ReadProperty, position, context.getIdentifierCode('__exit__'), 0, 1);
    ret.add(InstructionType.None, position, 2);
    ret.add(InstructionType.RegArg, position, 2, 0, 0);
    ret.add(InstructionType.RegArg, position, 2, 1, 0);
    ret.add(InstructionType.RegArg, position, 2, 2, 0);
    ret.add(InstructionType.CallMethod, position, 0, 1, 0);

    ret.add(InstructionType.Label, position, exitLabel);

    return ret;
  }

  importDirective(path: string, context: CompilerContext, position: TokenPosition): CodeFragmentInst {
    const id = context.getIdentifierCode(path);
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.Import, position, id);
    ret.success = true;
    return ret;
  }

  importAsDirective(path: string, rename: string, context: CompilerContext, position: TokenPosition): CodeFragmentInst {
    const id = context.getIdentifierCode(path);
    const as = context.getIdentifierCode(rename);
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.ImportAs, position, id, as);
    ret.success = true;
    return ret;
  }

  importFromDirective(func: string, module: string, context: CompilerContext, position: TokenPosition): CodeFragmentInst {
    const funcId = context.getIdentifierCode(func);
    const moduleId = context.getIdentifierCode(module);
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.ImportFrom, position, funcId, moduleId);
    ret.success = true;
    return ret;
  }

  pass(position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.Pass, position);
    ret.success = true;
    return ret;
  }

  breakCode(position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.Break, position);
    ret.success = true;
    return ret;
  }

  continueCode(position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.Continue, position);
    ret.success = true;
    return ret;
  }

  raise(expression: CodeFragmentInst, position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    this.appendTo(ret, expression);
    ret.add(InstructionType.Raise, position, 0);
    ret.success = true;
    return ret;
  }

  raiseEmpty(position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.Raise, position, -1);
    ret.success = true;
    return ret;
  }

  returnEmpty(position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.Ret, position, -1);
    ret.success = true;
    return ret;
  }

  returnValue(expression: CodeFragmentInst, position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    this.appendTo(ret, expression);
    ret.add(InstructionType.Ret, position, 0);
    ret.success = true;
    return ret;
  }

  yield(expression: CodeFragmentInst, position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    this.appendTo(ret, expression);
    ret.add(InstructionType.Yield, position, 0);
    ret.success = true;
    return ret;
  }

  delete(expression: CodeFragmentInst, position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    this.appendTo(ret, expression);
    ret.add(InstructionType.Del, position, 0);
    ret.success = true;
    return ret;
  }

  appendFunctionCall(
    code: CodeFragmentInst,
    args: CodeFragmentInst[],
    compilerContext: CompilerContext,
    position: TokenPosition,
    parentAt0: boolean,
  ): boolean {
    const argStartReg = 1 + (parentAt0 ? 1 : 0);
    let argReg = argStartReg;
    for (const arg of args) {
      this.appendTo(code, arg, argReg++);
    }
    let argIndex = 0;
    argReg = argStartReg;
    for (const arg of args) {
      if (!arg.nameLiteral) {
        code.add(InstructionType.RegArg, position, argReg++, argIndex);
        argIndex++;
      } else {
        const nameId = compilerContext.getIdentifierCode(arg.nameLiteral);
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

  readFunctionDef(defIndex: number, position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.CreateFunc, position, defIndex, 0);
    ret.success = true;
    return ret;
  }

  unaryOperators(unaryOperators: Token[], source: CodeFragmentInst): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    this.appendTo(ret, source);
    for (const token of unaryOperators) {
      if (token.type === TokenType.Operator) {
        switch (token.operator) {
          case OperatorType.Invert:
            ret.add(InstructionType.BinInv, token.getPosition(), 0, 0);
            break;
          case OperatorType.Minus:
            ret.add(InstructionType.Invert, token.getPosition(), 0, 0);
            break;
        }
      } else {
        switch (token.keyword) {
          case KeywordType.Not:
            ret.add(InstructionType.GetBool, token.getPosition(), 0, 0);
            ret.add(InstructionType.LogicalNot, token.getPosition(), 0, 0);
            break;
        }
      }
    }
    ret.success = true;
    return ret;
  }

  binaryOperator(left: CodeFragmentInst, op: Token, right: CodeFragmentInst, compilerContext: CompilerContext): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    this.appendTo(ret, left);
    let opType = InstructionType.Pass;
    let addOp = true;
    if (op.type === TokenType.Keyword) {
      switch (op.keyword) {
        case KeywordType.And:
          opType = InstructionType.LogicalAnd;
          addOp = false;
          break;
        case KeywordType.Or:
          opType = InstructionType.LogicalOr;
          addOp = false;
          break;
      }
      if (opType !== InstructionType.Pass) {
        ret.add(InstructionType.GetBool, op.getPosition(), 0, 0);
        ret.add(opType, op.getPosition(), 0, 0, right.code.length + 1);
        this.appendTo(ret, right);
        ret.add(InstructionType.GetBool, op.getPosition(), 0, 0);
      }
    }
    this.appendTo(ret, right, 1);
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
    } else {
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
      compilerContext.addError(PyErrorType.ErrorUnexpectedScenario05, op);
      return ret;
    }
    if (addOp) {
      ret.add(opType, op.getPosition(), 0, 1, 0);
    }
    ret.success = true;
    return ret;
  }

  createReference(identifiers: string[], compilerContext: CompilerContext, position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.CreateVarRef, position, compilerContext.getIdentifierCode(identifiers[0]), 0, ReferenceScope.Default);
    ret.success = true;
    ret.position = position;
    return ret;
  }

  appendPropertyReference(code: CodeFragmentInst, objectReg: number, identifier: number, position: TokenPosition): void {
    code.add(InstructionType.Identifier, position, objectReg + 1, identifier);
    code.add(InstructionType.CreatePropertyRef, position, objectReg, objectReg + 1, objectReg);
  }

  appendArrayIndexerReference(code: CodeFragmentInst, objectReg: number, indexExpression: CodeFragmentInst, position: TokenPosition): void {
    this.appendTo(code, indexExpression, objectReg + 1);
    code.add(InstructionType.CreateArrayIndexRef, position, objectReg, objectReg + 1, objectReg);
  }

  appendArrayRange(
    code: CodeFragmentInst,
    objectReg: number,
    indexFrom: CodeFragmentInst,
    indexTo: CodeFragmentInst,
    indexInterval: CodeFragmentInst,
    position: TokenPosition,
    isReference: boolean,
  ): void {
    this.appendTo(code, indexFrom, objectReg + 1);
    this.appendTo(code, indexTo, objectReg + 2);
    if (indexInterval) {
      this.appendTo(code, indexInterval, objectReg + 3);
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

  createVarReference(identifier: number, scope: ReferenceScope, position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.CreateVarRef, position, identifier, 0, scope);
    ret.success = true;
    return ret;
  }

  list(records: CodeFragmentInst[], position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.List, position, 0);
    for (const record of records) {
      this.appendTo(ret, record, 1);
      ret.add(InstructionType.ListAdd, null, 1, 0);
    }
    ret.success = true;
    return ret;
  }

  tuple(records: CodeFragmentInst[], position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.Tuple, position, 0);
    for (const record of records) {
      this.appendTo(ret, record, 1);
      ret.add(InstructionType.TupleAdd, null, 1, 0);
    }
    ret.success = true;
    return ret;
  }

  dictionary(literals: string[], values: CodeFragmentInst[], compilerContext: CompilerContext, position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.Dictionary, position, 0);
    for (let i = 0; i < literals.length; i++) {
      const identifier = compilerContext.getIdentifierCode(literals[i]);
      this.appendTo(ret, values[i], 1);
      ret.add(InstructionType.DictionaryAdd, null, 1, identifier, 0);
    }
    ret.success = true;
    return ret;
  }

  set(records: CodeFragmentInst[], position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.Set, position, 0);
    for (const record of records) {
      this.appendTo(ret, record, 1);
      ret.add(InstructionType.SetAdd, null, 1, 0);
    }
    ret.success = true;
    return ret;
  }

  conditionalExpression(
    condition: CodeFragmentInst,
    ifPart: CodeFragmentInst,
    elsePart: CodeFragmentInst,
    compilerContext: CompilerContext,
    position: TokenPosition,
  ): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    this.appendTo(ret, condition);
    const elseLabel = compilerContext.getNewLabel();
    ret.add(InstructionType.GetBool, position, 0, 0);
    ret.add(InstructionType.Condition, position, 0, elseLabel);
    const endLabel = compilerContext.getNewLabel();
    this.appendTo(ret, ifPart);
    ret.add(InstructionType.GoTo, null, endLabel);
    ret.add(InstructionType.Label, null, elseLabel);
    this.appendTo(ret, elsePart);
    ret.add(InstructionType.Label, null, endLabel);
    ret.success = true;
    return ret;
  }

  literal(literal: Literal, compilerContext: CompilerContext, position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    const litId = compilerContext.getLiteral(literal);
    ret.add(InstructionType.Literal, position, 0, litId);
    ret.success = true;
    return ret;
  }

  formattedLiteral(literal: Literal, values: CodeFragmentInst[], compilerContext: CompilerContext, position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    const litId = compilerContext.getLiteral(literal);
    let reg = 0;
    for (const value of values) {
      this.appendTo(ret, value, reg++);
    }
    ret.add(InstructionType.Literal, position, 0, litId);
    ret.success = true;
    return ret;
  }

  bool(value: number, position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.Bool, position, value, 0);
    ret.success = true;
    return ret;
  }

  none(position: TokenPosition): CodeFragmentInst {
    const ret = new CodeFragmentInst();
    ret.add(InstructionType.None, position, 0);
    ret.success = true;
    return ret;
  }

  setFragmentDebugInformation(module: PyModule, fragment: CodeFragmentInst): void {
    if (DEBUG) {
      createDebugInformation(module, fragment.code);
    }
  }

  getFullDebugInformation(module: PyModule, func: FunctionBody): string {
    const instructions = (func.code as FullCodeInst).instructions;
    if (instructions) {
      createDebugInformation(module, instructions);
      return instructions.map((c, row) => (c.type === InstructionType.Label ? `${c.debug}` : `    ${row}: ${c.debug}`)).join('\n');
    }
  }

  isEmptyFragment(fragment: CodeFragmentInst): boolean {
    return !fragment.code.length;
  }

  appendAugmentedCopy(fragment: CodeFragmentInst, operator: Token): void {
    fragment.add(InstructionType.AugmentedCopy, fragment.position, 1, 0, 0, getAssignmentInstruction(operator));
  }

  appendCopyValue(fragment: CodeFragmentInst): void {
    fragment.add(InstructionType.CopyValue, fragment.position, 1, 0);
  }

  hasArrayIndex(fragment: CodeFragmentInst): boolean {
    return fragment.code.findIndex((c) => c.isArrayIndex()) >= 0;
  }

  hasOperator(fragment: CodeFragmentInst): boolean {
    return fragment.code.findIndex((c) => c.isOperator()) >= 0;
  }

  appendReadObject(fragment: CodeFragmentInst, position: TokenPosition, identifier: number): void {
    fragment.add(InstructionType.ReadObject, position, identifier, 0);
  }

  appendReadProperty(fragment: CodeFragmentInst, position: TokenPosition, identifier: number, from: number, to: number): void {
    fragment.add(InstructionType.ReadProperty, position, identifier, from, to);
  }

  appendReadArrayIndex(fragment: CodeFragmentInst, position: TokenPosition, from: number, index: number, to: number): void {
    fragment.add(InstructionType.ReadArrayIndex, position, from, index, to);
  }

  appendReturnValue(fragment: CodeFragmentInst, position: TokenPosition, from: number): void {
    fragment.add(InstructionType.Ret, position, from);
  }
}
