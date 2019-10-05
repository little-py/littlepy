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
let InstructionMapping: { [key: string]: string } = {};

/* istanbul ignore next */
if (DEBUG) {
  InstructionMapping = {
    [InstructionType.ICreateFunc]: 'CreateFunc',
    [InstructionType.ILiteral]: 'Literal',
    [InstructionType.ICreateVarRef]: 'CreateVarRef',
    [InstructionType.ICreateArrayIndexRef]: 'CreateArrayIndexRef',
    [InstructionType.ICreatePropertyRef]: 'CreatePropertyRef',
    [InstructionType.ICopyValue]: 'CopyValue',
    [InstructionType.IAugmentedCopy]: 'AugmentedCopy',
    [InstructionType.IAdd]: 'Add',
    [InstructionType.ISub]: 'Sub',
    [InstructionType.IMul]: 'Mul',
    [InstructionType.IDiv]: 'Div',
    [InstructionType.IPow]: 'Pow',
    [InstructionType.IFloor]: 'Floor',
    [InstructionType.IMod]: 'Mod',
    [InstructionType.IAt]: 'At',
    [InstructionType.IShl]: 'Shl',
    [InstructionType.IShr]: 'Shr',
    [InstructionType.IBinAnd]: 'BinAnd',
    [InstructionType.IBinOr]: 'BinOr',
    [InstructionType.IBinXor]: 'BinXor',
    [InstructionType.IBinInv]: 'BinInv',
    [InstructionType.ILabel]: 'Label',
    [InstructionType.ICondition]: 'Condition',
    [InstructionType.ILess]: 'Less',
    [InstructionType.IGreater]: 'Greater',
    [InstructionType.ILessEq]: 'LessEq',
    [InstructionType.IGreaterEq]: 'GreaterEq',
    [InstructionType.IEqual]: 'Equal',
    [InstructionType.INotEq]: 'NotEq',
    [InstructionType.IRegArg]: 'RegArg',
    [InstructionType.IRegArgName]: 'RegArgName',
    [InstructionType.ICallFunc]: 'CallFunc',
    [InstructionType.IRet]: 'Ret',
    [InstructionType.IRaise]: 'Raise',
    [InstructionType.ILogicalNot]: 'LogicalNot',
    [InstructionType.ILogicalAnd]: 'LogicalAnd',
    [InstructionType.ILogicalOr]: 'LogicalOr',
    [InstructionType.IGetBool]: 'GetBool',
    [InstructionType.IPass]: 'Pass',
    [InstructionType.IInvert]: 'Invert',
    [InstructionType.IList]: 'List',
    [InstructionType.IListAdd]: 'ListAdd',
    [InstructionType.ITuple]: 'Tuple',
    [InstructionType.ITupleAdd]: 'TupleAdd',
    [InstructionType.ISet]: 'Set',
    [InstructionType.ISetAdd]: 'SetAdd',
    [InstructionType.IDictionary]: 'Dictionary',
    [InstructionType.IDictionaryAdd]: 'DictionaryAdd',
    [InstructionType.IForCycle]: 'ForCycle',
    [InstructionType.IWhileCycle]: 'WhileCycle',
    [InstructionType.IGoTo]: 'GoTo',
    [InstructionType.IImport]: 'Import',
    [InstructionType.IImportAs]: 'ImportAs',
    [InstructionType.IImportFrom]: 'ImportFrom',
    [InstructionType.IEnterTry]: 'EnterTry',
    [InstructionType.IEnterFinally]: 'EnterFinally',
    [InstructionType.IEnterExcept]: 'EnterExcept',
    [InstructionType.IGotoExcept]: 'GotoExcept',
    [InstructionType.IGotoFinally]: 'GotoFinally',
    [InstructionType.ILeaveTry]: 'LeaveTry',
    [InstructionType.ILeaveFinally]: 'LeaveFinally',
    [InstructionType.ILeaveCycle]: 'LeaveCycle',
    [InstructionType.IContinue]: 'Continue',
    [InstructionType.IBreak]: 'Break',
    [InstructionType.IReadObject]: 'ReadObject',
    [InstructionType.IReadProperty]: 'ReadProperty',
    [InstructionType.IIdentifier]: 'Identifier',
    [InstructionType.IBool]: 'Bool',
    [InstructionType.INone]: 'None',
    [InstructionType.IIs]: 'Is',
    [InstructionType.IIsNot]: 'IsNot',
    [InstructionType.IIn]: 'In',
    [InstructionType.INotIn]: 'NotIn',
    [InstructionType.IDel]: 'Del',
    [InstructionType.IReadArrayIndex]: 'ReadArrayIndex',
    [InstructionType.ICallMethod]: 'CallMethod',
  };
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
    i.typeText = InstructionMapping[i.iType];

    switch (i.iType) {
      case InstructionType.ICreateFunc:
        i.debug = `reg${i.arg2} = function ${functionToText(i.arg1)}(...)`;
        break;
      case InstructionType.ILiteral:
        i.debug = `reg${i.arg1} = ${literalToText(i.arg2)}`;
        break;
      case InstructionType.ICreateVarRef:
        i.debug = `reg${i.arg2} = reference(${idToText(i.arg1)})${
          i.arg3 === ReferenceScope.Default ? '' : i.arg3 === ReferenceScope.Global ? '// global scope' : '// nonlocal scope'
        }`;
        break;
      case InstructionType.ICreateArrayIndexRef:
        i.debug = `reg${i.arg3} = reference(reg${i.arg1}[${i.arg2}])`;
        break;
      case InstructionType.ICreatePropertyRef:
        i.debug = `reg${i.arg3} = reference(reg${i.arg1}[reg${i.arg2}])`;
        break;
      case InstructionType.ICopyValue:
        i.debug = `*reg${i.arg2} = *reg${i.arg1}`;
        break;
      case InstructionType.IAugmentedCopy:
        i.debug = `reg${i.arg1} = reg${i.arg1} ${InstructionMapping[i.arg3]} reg${i.arg2}`;
        break;
      case InstructionType.IAdd:
        i.debug = `reg${i.arg3} = reg${i.arg1} + reg${i.arg2}`;
        break;
      case InstructionType.ISub:
        i.debug = `reg${i.arg3} = reg${i.arg1} - reg${i.arg2}`;
        break;
      case InstructionType.IMul:
        i.debug = `reg${i.arg3} = reg${i.arg1} * reg${i.arg2}`;
        break;
      case InstructionType.IDiv:
        i.debug = `reg${i.arg3} = reg${i.arg1} / reg${i.arg2}`;
        break;
      case InstructionType.IPow:
        i.debug = `reg${i.arg3} = reg${i.arg1} ** reg${i.arg2}`;
        break;
      case InstructionType.IFloor:
        i.debug = `reg${i.arg3} = reg${i.arg1} // reg${i.arg2}`;
        break;
      case InstructionType.IMod:
        i.debug = `reg${i.arg3} = reg${i.arg1} % reg${i.arg2}`;
        break;
      case InstructionType.IAt:
        i.debug = `reg${i.arg3} = reg${i.arg1} @ reg${i.arg2}`;
        break;
      case InstructionType.IShl:
        i.debug = `reg${i.arg3} = reg${i.arg1} << reg${i.arg2}`;
        break;
      case InstructionType.IShr:
        i.debug = `reg${i.arg3} = reg${i.arg1} >> reg${i.arg2}`;
        break;
      case InstructionType.IBinAnd:
        i.debug = `reg${i.arg3} = reg${i.arg1} & reg${i.arg2}`;
        break;
      case InstructionType.IBinOr:
        i.debug = `reg${i.arg3} = reg${i.arg1} | reg${i.arg2}`;
        break;
      case InstructionType.IBinXor:
        i.debug = `reg${i.arg3} = reg${i.arg1} ^ reg${i.arg2}`;
        break;
      case InstructionType.IBinInv:
        i.debug = `reg${i.arg2} = ~reg${i.arg1}`;
        break;
      case InstructionType.ILabel:
        i.debug = `:label${i.arg1}`;
        break;
      case InstructionType.ICondition:
        i.debug = `if reg${i.arg1} is False jump to label${i.arg2}`;
        break;
      case InstructionType.ILess:
        i.debug = `reg${i.arg3} = reg${i.arg1} < reg${i.arg2}`;
        break;
      case InstructionType.IGreater:
        i.debug = `reg${i.arg3} = reg${i.arg1} > reg${i.arg2}`;
        break;
      case InstructionType.ILessEq:
        i.debug = `reg${i.arg3} = reg${i.arg1} <= reg${i.arg2}`;
        break;
      case InstructionType.IGreaterEq:
        i.debug = `reg${i.arg3} = reg${i.arg1} >= reg${i.arg2}`;
        break;
      case InstructionType.IEqual:
        i.debug = `reg${i.arg3} = reg${i.arg1} == reg${i.arg2}`;
        break;
      case InstructionType.INotEq:
        i.debug = `reg${i.arg3} = reg${i.arg1} != reg${i.arg2}`;
        break;
      case InstructionType.IRegArg:
        i.debug = `argument${i.arg2} = reg${i.arg1}`;
        break;
      case InstructionType.IRegArgName:
        i.debug = `argument '${idToText(i.arg2)}' = reg${i.arg1}`;
        break;
      case InstructionType.ICallFunc:
        i.debug = `reg${i.arg2} = reg${i.arg1}(...)`;
        break;
      case InstructionType.IRet:
        i.debug = `i.debug = reg${i.arg1}`;
        break;
      case InstructionType.IRaise:
        if (i.arg1 === -1) {
          i.debug = 're-raise current exception';
        } else {
          i.debug = `raise reg${i.arg1}`;
        }
        break;
      case InstructionType.IGetBool:
        i.debug = `reg${i.arg2} = bool(reg${i.arg1})`;
        break;
      case InstructionType.ILogicalNot:
        i.debug = `reg${i.arg2} = not reg${i.arg1}`;
        break;
      case InstructionType.ILogicalAnd:
        i.debug = `if reg${i.arg1} == False: reg${i.arg2} = False else: skip next instruction`;
        break;
      case InstructionType.ILogicalOr:
        i.debug = `if reg${i.arg1} == True reg${i.arg2} = True else: skip next instruction`;
        break;
      case InstructionType.IInvert:
        i.debug = `reg${i.arg2} = -reg${i.arg1}`;
        break;
      case InstructionType.IList:
        i.debug = `reg${i.arg1} = new list()`;
        break;
      case InstructionType.IListAdd:
        i.debug = `list reg${i.arg1}.add(reg${i.arg2})`;
        break;
      case InstructionType.ITuple:
        i.debug = `reg${i.arg1} = new tuple()`;
        break;
      case InstructionType.ITupleAdd:
        i.debug = `tuple reg${i.arg2}.add(reg${i.arg1})`;
        break;
      case InstructionType.ISet:
        i.debug = `reg${i.arg1} = new set()`;
        break;
      case InstructionType.ISetAdd:
        i.debug = `set reg${i.arg2}.add(reg${i.arg1})`;
        break;
      case InstructionType.IDictionary:
        i.debug = `reg${i.arg1} = new dictionary()`;
        break;
      case InstructionType.IDictionaryAdd:
        i.debug = `put value reg${i.arg1} and key '${idToText(i.arg2)}' into dictionary in reg${i.arg3}`;
        break;
      case InstructionType.IForCycle:
        if (i.arg2 === -1) {
          i.debug = `start for cycle, exit on label${i.arg1}`;
        } else {
          i.debug = `start for cycle, exit on label${i.arg1}; nobreak: label${i.arg2}`;
        }
        break;
      case InstructionType.IWhileCycle:
        i.debug = `start while cycle, exit on label${i.arg1}`;
        break;
      case InstructionType.IGoTo:
        i.debug = `jump to label${i.arg1}`;
        break;
      case InstructionType.IImport:
        i.debug = `import ${idToText(i.arg1)}`;
        break;
      case InstructionType.IImportAs:
        i.debug = `import ${idToText(i.arg1)} as ${idToText(i.arg2)}`;
        break;
      case InstructionType.IImportFrom:
        i.debug = `import function ${idToText(i.arg1)} from module ${idToText(i.arg2)}`;
        break;
      case InstructionType.IEnterTry:
        i.debug = `start try section, handlers table is ${i.arg1} instructions forward`;
        break;
      case InstructionType.IEnterFinally:
        i.debug = `enter finally section`;
        break;
      case InstructionType.IEnterExcept:
        if (i.arg1 !== -1) {
          i.debug = `enter except section; ${idToText(i.arg1)} = exception`;
        } else {
          i.debug = `enter except section`;
        }
        break;
      case InstructionType.IGotoExcept:
        if (i.arg1 === -1) {
          i.debug = `start except block for all exceptions from label${i.arg2}`;
        } else {
          i.debug = `start except block for class ${idToText(i.arg1)} from label${i.arg2}`;
        }
        break;
      case InstructionType.IGotoFinally:
        i.debug = `indicate finally block to start on label${i.arg1}`;
        break;
      case InstructionType.ILeaveTry:
        i.debug = `end try section`;
        break;
      case InstructionType.ILeaveFinally:
        i.debug = `end finally section`;
        break;
      case InstructionType.ILeaveCycle:
        i.debug = `end cycle (while/for)`;
        break;
      case InstructionType.IContinue:
        i.debug = `continue to next cycle iteration`;
        break;
      case InstructionType.IBreak:
        i.debug = `break current cycle`;
        break;
      case InstructionType.IReadObject:
        i.debug = `reg${i.arg2} = ${idToText(i.arg1)}`;
        break;
      case InstructionType.IReadProperty:
        i.debug = `reg${i.arg3} = reg${i.arg2}.${idToText(i.arg1)}`;
        break;
      case InstructionType.IIdentifier:
        i.debug = `reg${i.arg1} = '${idToText(i.arg2)}'`;
        break;
      case InstructionType.IBool:
        i.debug = `reg${i.arg2} = Boolean(${i.arg1 !== 0 ? 'True' : 'False'})`;
        break;
      case InstructionType.INone:
        i.debug = `reg${i.arg1} = None`;
        break;
      case InstructionType.IIs:
        i.debug = `reg${i.arg3} = reg${i.arg1} is reg${i.arg2}`;
        break;
      case InstructionType.IIsNot:
        i.debug = `reg${i.arg3} = reg${i.arg1} is not reg${i.arg2}`;
        break;
      case InstructionType.IIn:
        i.debug = `reg${i.arg3} = reg${i.arg1} in reg${i.arg2}`;
        break;
      case InstructionType.INotIn:
        i.debug = `reg${i.arg3} = reg${i.arg1} not in reg${i.arg2}`;
        break;
      case InstructionType.IPass:
        i.debug = 'pass';
        break;
      case InstructionType.IDel:
        i.debug = `delete reg${i.arg1}.${idToText(i.arg2)}`;
        break;
      case InstructionType.IReadArrayIndex:
        i.debug = `reg${i.arg3} = reg${i.arg1}[reg${i.arg2}]`;
        break;
      case InstructionType.ICallMethod:
        i.debug = `reg${i.arg3} = reg${i.arg1}.reg${i.arg2}(arg1, arg2, arg3, ...)`;
        break;
      default:
        i.debug = `unknown instruction ${i.iType}`;
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

    this.debug = this.code.map((c, row) => (c.iType === InstructionType.ILabel ? `${c.debug}` : `    ${row}: ${c.debug}`)).join('\n');
  }
}
