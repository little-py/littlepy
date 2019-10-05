import { InstructionType } from './InstructionType';
import { TokenPosition } from '../compiler/Token';

export class Instruction {
  public debug?: string;
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
      case InstructionType.IIdentifier:
      case InstructionType.INone:
      case InstructionType.IDel:
      case InstructionType.IRaise:
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
      case InstructionType.IForCycle:
      case InstructionType.IEnterExcept:
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
