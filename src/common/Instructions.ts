import { InstructionType } from './InstructionType';
import { TokenPosition } from '../compiler/Token';
import { CompiledModule } from '../compiler/CompiledModule';
import { LiteralType } from '../compiler/Literal';

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
function getFuncDesc(module: CompiledModule, arg: number): string {
  const func = module.functions[arg];
  if (!func) {
    return `unknown!function#${arg}`;
  }
  return func.name;
}

/* istanbul ignore next */
function getLiteralDesc(module: CompiledModule, arg: number) {
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
}

/* istanbul ignore next */
function getIdDesc(module: CompiledModule, arg: number) {
  const identifier = module.identifiers[arg];
  if (identifier === undefined) {
    return `unknown!identifier#${arg}`;
  }
  return identifier;
}

export class Instruction {
  public readonly getDescription?: (module: CompiledModule) => string;
  public readonly iType: InstructionType;
  public arg1: number;
  public arg2: number;
  public arg3: number;
  public typeText?: string;
  public readonly row: number;
  public readonly column: number;
  public readonly position: number;

  public constructor(type: InstructionType = InstructionType.IPass, position: TokenPosition, arg1 = 0, arg2 = 0, arg3 = 0) {
    if (position) {
      this.position = position.position;
      this.column = position.column;
      this.row = position.row;
    } else {
      this.position = -1;
      this.row = -1;
      this.column = -1;
    }
    /* istanbul ignore next */
    if (DEBUG) {
      this.typeText = InstructionMapping[type];
      this.getDescription = (module: CompiledModule) => {
        switch (type) {
          case InstructionType.ICreateFunc:
            return `create function based on definition ${getFuncDesc(module, arg1)}(...) and put it in reg${arg2}`;
          case InstructionType.ILiteral:
            return `load reg${arg1} with ${getLiteralDesc(module, arg2)}`;
          case InstructionType.ICreateVarRef:
            return `create reference to variable with name ${getIdDesc(module, arg1)} and put it into reg${arg2} with scope scope${arg3}`;
          case InstructionType.ICreateArrayIndexRef:
            return `create reference to array item reg${arg1}[${arg2}] and put it in reg${arg3}`;
          case InstructionType.ICreatePropertyRef:
            return `create reference to object property reg${arg1}[reg${arg2}] and put it in reg${arg3}`;
          case InstructionType.ICopyValue:
            return `copy value of reg${arg1} into reg${arg2}; both regs can be references, then read/update reference value`;
          case InstructionType.IAugmentedCopy:
            return `calculate value of reg${arg1} ${InstructionMapping[arg3]} reg${arg2} and put result into reg${arg1}; this is for operations like a += 10`;
          case InstructionType.IAdd:
            return `reg${arg3} = reg${arg1} + reg${arg2}`;
          case InstructionType.ISub:
            return `reg${arg3} = reg${arg1} - reg${arg2}`;
          case InstructionType.IMul:
            return `reg${arg3} = reg${arg1} * reg${arg2}`;
          case InstructionType.IDiv:
            return `reg${arg3} = reg${arg1} / reg${arg2}`;
          case InstructionType.IPow:
            return `reg${arg3} = reg${arg1} ** reg${arg2}`;
          case InstructionType.IFloor:
            return `reg${arg3} = reg${arg1} // reg${arg2}`;
          case InstructionType.IMod:
            return `reg${arg3} = reg${arg1} % reg${arg2}`;
          case InstructionType.IAt:
            return `reg${arg3} = reg${arg1} @ reg${arg2}`;
          case InstructionType.IShl:
            return `reg${arg3} = reg${arg1} << reg${arg2}`;
          case InstructionType.IShr:
            return `reg${arg3} = reg${arg1} >> reg${arg2}`;
          case InstructionType.IBinAnd:
            return `reg${arg3} = reg${arg1} & reg${arg2}`;
          case InstructionType.IBinOr:
            return `reg${arg3} = reg${arg1} | reg${arg2}`;
          case InstructionType.IBinXor:
            return `reg${arg3} = reg${arg1} ^ reg${arg2}`;
          case InstructionType.IBinInv:
            return `reg${arg2} = ~reg${arg1}`;
          case InstructionType.ILabel:
            return `:label${arg1}`;
          case InstructionType.ICondition:
            return `if reg${arg1} is false jump to label${arg2}`;
          case InstructionType.ILess:
            return `reg${arg3} = reg${arg1} < reg${arg2}`;
          case InstructionType.IGreater:
            return `reg${arg3} = reg${arg1} > reg${arg2}`;
          case InstructionType.ILessEq:
            return `reg${arg3} = reg${arg1} <= reg${arg2}`;
          case InstructionType.IGreaterEq:
            return `reg${arg3} = reg${arg1} >= reg${arg2}`;
          case InstructionType.IEqual:
            return `reg${arg3} = reg${arg1} == reg${arg2}`;
          case InstructionType.INotEq:
            return `reg${arg3} = reg${arg1} != reg${arg2}`;
          case InstructionType.IRegArg:
            return `set reg${arg1} as argument${arg2}`;
          case InstructionType.IRegArgName:
            return `set reg${arg1} as argument '${getIdDesc(module, arg2)}'`;
          case InstructionType.ICallFunc:
            return `call function/method reg${arg1}(...) and place result into reg${arg2}`;
          case InstructionType.IRet:
            return `return from function call with value in reg${arg1}`;
          case InstructionType.IRaise:
            return `raise exception with value in reg${arg1}`;
          // case InstructionType.ISeqNext:
          //   return `take next sequence item from reg${arg1} and put result in reg${arg2}; put 1 into reg${arg3} if there is next value; put 0 otherwise`;
          case InstructionType.IGetBool:
            return `take reg${arg1}, calculates bool value based on it ant puts into reg${arg2}`;
          case InstructionType.ILogicalNot:
            return `apply logical not to reg${arg1} and put result in reg${arg2}`;
          case InstructionType.ILogicalAnd:
            return `if reg${arg1} is false put false in reg${arg2} otherwise skip next instruction`;
          case InstructionType.ILogicalOr:
            return `if reg${arg1} is true put true in reg${arg2} otherwise skip next instruction`;
          case InstructionType.IInvert:
            return `calculate (-reg${arg1}) and put into reg${arg2}`;
          case InstructionType.IList:
            return `create list and put it into reg${arg1}`;
          case InstructionType.IListAdd:
            return `put reg${arg1} into list in reg${arg2}`;
          case InstructionType.ITuple:
            return `create tuple and put it into reg${arg1}`;
          case InstructionType.ITupleAdd:
            return `put reg${arg1} into tuple in reg${arg2}; in case reg${arg1} is a reference put reference, not value, into the tuple`;
          case InstructionType.ISet:
            return `create set and put it into reg${arg1}`;
          case InstructionType.ISetAdd:
            return `put reg${arg1} into set in reg${arg2}`;
          case InstructionType.IDictionary:
            return `create dictionary and put it into reg${arg1}`;
          case InstructionType.IDictionaryAdd:
            return `put value reg${arg1} and key '${getIdDesc(module, arg2)}' into dictionary in reg${arg3}`;
          case InstructionType.IForCycle:
            return `iterate value, exit on label${arg1}`;
          case InstructionType.IWhileCycle:
            return `start while cycle; exit on label${arg1}; used for continue/break logic only`;
          case InstructionType.IGoTo:
            return `jump to label${arg1}`;
          case InstructionType.IImport:
            return `import ${getIdDesc(module, arg1)}`;
          case InstructionType.IImportAs:
            return `import ${getIdDesc(module, arg1)} as ${getIdDesc(module, arg2)}`;
          case InstructionType.IImportFrom:
            return `import function ${getIdDesc(module, arg1)} from module ${getIdDesc(module, arg2)}`;
          case InstructionType.IEnterTry:
            return `start try section, check list starting with ${arg1} instructions forward`;
          case InstructionType.IEnterFinally:
            return `enter finally section - means current finally section should not be taken into account when handling finally/raise cases`;
          case InstructionType.IEnterExcept:
            return `enter except section - means current except section should not be taken into account when handling finally/raise cases; if reg1 !== -1 declare local variable id1 with exception contents`;
          case InstructionType.IGotoExcept:
            return `start except block for class ${getIdDesc(module, arg1)} from label${arg2}`;
          case InstructionType.IGotoFinally:
            return `indicate finally block to start on label${arg1}`;
          case InstructionType.ILeaveTry:
            return `end try section`;
          case InstructionType.ILeaveFinally:
            return `end finally section`;
          case InstructionType.ILeaveCycle:
            return `end cycle (while/for)`;
          case InstructionType.IContinue:
            return `continue to next cycle iteration`;
          case InstructionType.IBreak:
            return `break current cycle`;
          case InstructionType.IReadObject:
            return `read variable '${getIdDesc(module, arg1)}' from scope into reg${arg2}`;
          case InstructionType.IReadProperty:
            return `read property '${getIdDesc(module, arg1)}' from value in reg${arg2} and put it into reg${arg3}`;
          case InstructionType.IIdentifier:
            return `load reg${arg1} with '${getIdDesc(module, arg2)}'`;
          case InstructionType.IBool:
            return `create boolean value${arg1} and put it into reg${arg2}`;
          case InstructionType.INone:
            return `create none value and put it into reg${arg1}`;
          case InstructionType.IIs:
            return `reg${arg3} = reg${arg1} is reg${arg2}`;
          case InstructionType.IIsNot:
            return `reg${arg3} = reg${arg1} is not reg${arg2}`;
          case InstructionType.IIn:
            return `reg${arg3} = reg${arg1} in reg${arg2}`;
          case InstructionType.INotIn:
            return `reg${arg3} = reg${arg1} not in reg${arg2}`;
          case InstructionType.IPass:
            return 'pass';
          case InstructionType.IDel:
            return `delete property '${getIdDesc(module, arg2)}' of reg${arg1}`;
          case InstructionType.IReadArrayIndex:
            return `read value from array in reg${arg1} by index reg${arg2} and put it into reg${arg3}`;
          case InstructionType.ICallMethod:
            return `call method reg${arg1}.reg${arg2}(arg1, rg2, arg3, ...) and place result into reg${arg3}`;
          default:
            return `unknown instruction ${this.iType}`;
        }
      };
    }
    this.iType = type;
    this.arg1 = arg1;
    this.arg2 = arg2;
    this.arg3 = arg3;
  }

  public copy(): Instruction {
    return new Instruction(
      this.iType,
      {
        position: this.position,
        column: this.column,
        row: this.row,
      },
      this.arg1,
      this.arg2,
      this.arg3,
    );
  }

  public isOperator(): boolean {
    switch (this.iType) {
      case InstructionType.IAdd:
      case InstructionType.ISub:
      case InstructionType.IMul:
      case InstructionType.IDiv:
      case InstructionType.IPow:
      case InstructionType.IFloor:
      case InstructionType.IMod:
      case InstructionType.IShl:
      case InstructionType.IShr:
      case InstructionType.IAt:
      case InstructionType.IBinAnd:
      case InstructionType.IBinOr:
      case InstructionType.IBinXor:
      case InstructionType.IBinInv:
        return true;
      default:
        return false;
    }
  }

  public isArrayIndex(): boolean {
    return this.iType === InstructionType.ICreateArrayIndexRef;
  }

  public shiftRight(countReg: number) {
    switch (this.iType) {
      case InstructionType.ILiteral:
      case InstructionType.ICondition:
      case InstructionType.IRegArg:
      case InstructionType.IRegArgName:
      case InstructionType.IRet:
      case InstructionType.IList:
      case InstructionType.ITuple:
      case InstructionType.ISet:
      case InstructionType.IDictionary:
      case InstructionType.IForCycle:
      case InstructionType.IIdentifier:
      case InstructionType.INone:
      case InstructionType.IDel:
      case InstructionType.IRaise:
      case InstructionType.IEnterExcept:
        this.arg1 += countReg;
        break;
      case InstructionType.IDictionaryAdd:
        this.arg1 += countReg;
        this.arg3 += countReg;
        break;
      case InstructionType.ILabel:
      case InstructionType.IPass:
      case InstructionType.IGoTo:
      case InstructionType.IImport:
      case InstructionType.IImportFrom:
      case InstructionType.IImportAs:
      case InstructionType.IEnterTry:
      case InstructionType.ILeaveTry:
      case InstructionType.IEnterFinally:
      case InstructionType.ILeaveFinally:
      case InstructionType.IWhileCycle:
      case InstructionType.IGotoExcept:
      case InstructionType.IGotoFinally:
      case InstructionType.ILeaveCycle:
      case InstructionType.IContinue:
      case InstructionType.IBreak:
        break;
      case InstructionType.IAdd:
      case InstructionType.ISub:
      case InstructionType.IMul:
      case InstructionType.IDiv:
      case InstructionType.IPow:
      case InstructionType.IFloor:
      case InstructionType.IMod:
      case InstructionType.IShl:
      case InstructionType.IShr:
      case InstructionType.IAt:
      case InstructionType.IBinAnd:
      case InstructionType.IBinOr:
      case InstructionType.IBinXor:
      case InstructionType.IBinInv:
      case InstructionType.ILess:
      case InstructionType.IGreater:
      case InstructionType.ILessEq:
      case InstructionType.IGreaterEq:
      case InstructionType.IEqual:
      case InstructionType.INotEq:
      // case InstructionType.ISeqNext:
      case InstructionType.ICreateArrayIndexRef:
      case InstructionType.ICreatePropertyRef:
      case InstructionType.IReadArrayIndex:
      case InstructionType.ICallMethod:
      case InstructionType.IIn:
      case InstructionType.IIs:
      case InstructionType.IIsNot:
      case InstructionType.INotIn:
        this.arg1 += countReg;
        this.arg2 += countReg;
        this.arg3 += countReg;
        break;
      case InstructionType.ILogicalNot:
      case InstructionType.IInvert:
      case InstructionType.IListAdd:
      case InstructionType.ITupleAdd:
      case InstructionType.ISetAdd:
      case InstructionType.ICopyValue:
      case InstructionType.IAugmentedCopy:
      case InstructionType.IGetBool:
      case InstructionType.ILogicalOr:
      case InstructionType.ILogicalAnd:
      case InstructionType.ICallFunc:
        this.arg1 += countReg;
        this.arg2 += countReg;
        break;
      case InstructionType.ICreateFunc:
      case InstructionType.IReadObject:
      case InstructionType.ICreateVarRef:
      case InstructionType.IBool:
        this.arg2 += countReg;
        break;
      case InstructionType.IReadProperty:
        this.arg2 += countReg;
        this.arg3 += countReg;
        break;
    }
  }
}

export class GeneratedCode {
  public code: Instruction[] = [];
  public finish: number;
  public success: boolean;
  public nameLiteral: string;
  public position: TokenPosition;

  public add(t: InstructionType, position: TokenPosition, a1 = 0, a2 = 0, a3 = 0) {
    this.code.push(new Instruction(t, position, a1, a2, a3));
  }
}
