import { Instruction } from './Instructions';
import { CompiledModule } from '../compiler/CompiledModule';
import { PyFunction } from '../api/Function';
import { InstructionType } from './InstructionType';
import { LiteralType } from '../compiler/Literal';
import { ReferenceScope } from './ReferenceScope';

export enum ArgumentType {
  Normal,
  KeywordArguments, // ie **arg, will be wrapped as dictionary
  ArbitraryArguments, // ie *arg, will be wrapped as tuple
}

export class FunctionArgument {
  public id: number;
  public initReg: number;
  public type: ArgumentType;
}

export enum FunctionType {
  Regular = 'Regular',
  Class = 'Class',
  ClassMember = 'ClassMember',
  Module = 'Module',
}

/* istanbul ignore next */
export function createDebugInformation(module: CompiledModule, instructions: Instruction[]) {
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
        i.debug = `reg${i.arg3} = reference(reg${i.arg1}[${i.arg2}])`;
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
        i.debug = `if reg${i.arg1} == False: reg${i.arg2} = False else: skip next instruction`;
        break;
      case InstructionType.LogicalOr:
        i.debug = `if reg${i.arg1} == True reg${i.arg2} = True else: skip next instruction`;
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

export class FunctionBody implements PyFunction {
  public name: string;
  public documentation: string;
  public code: Instruction[];
  public arguments: FunctionArgument[] = [];
  public parent: number;
  public type: FunctionType;
  public id: string;
  public module: CompiledModule;
  public inheritsFrom: string[] = [];
  public debug?: string;

  /* istanbul ignore next */
  public initialize() {
    if (!DEBUG) {
      return;
    }

    createDebugInformation(this.module, this.code);

    this.debug = this.code.map((c, row) => (c.type === InstructionType.Label ? `${c.debug}` : `    ${row}: ${c.debug}`)).join('\n');
  }
}
