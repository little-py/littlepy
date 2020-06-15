import { InstructionType } from './InstructionType';
import { TokenPosition } from '../api/Token';

export class Instruction {
  public debug?: string;
  public row: number;
  public column: number;
  public position: number;

  public constructor(
    public readonly type: InstructionType, //
    position: TokenPosition,
    public arg1: number,
    public arg2: number,
    public arg3 = 0,
    public arg4 = InstructionType.None,
    public arg5 = 0,
    public arg6 = 0,
  ) {
    if (position) {
      this.position = position.position;
      this.column = position.column;
      this.row = position.row;
    } else {
      this.position = -1;
      this.row = -1;
      this.column = -1;
    }
    this.arg1 = arg1;
    this.arg2 = arg2;
    this.arg3 = arg3;
    this.arg4 = arg4;
    this.arg5 = arg5;
    this.arg6 = arg6;
  }

  public copy(): Instruction {
    return new Instruction(
      this.type,
      {
        position: this.position,
        column: this.column,
        row: this.row,
      },
      this.arg1,
      this.arg2,
      this.arg3,
      this.arg4,
      this.arg5,
      this.arg6,
    );
  }

  public isOperator(): boolean {
    switch (this.type) {
      case InstructionType.Add:
      case InstructionType.Sub:
      case InstructionType.Mul:
      case InstructionType.Div:
      case InstructionType.Pow:
      case InstructionType.Floor:
      case InstructionType.Mod:
      case InstructionType.Shl:
      case InstructionType.Shr:
      case InstructionType.At:
      case InstructionType.BinAnd:
      case InstructionType.BinOr:
      case InstructionType.BinXor:
      case InstructionType.BinInv:
        return true;
      default:
        return false;
    }
  }

  public isArrayIndex(): boolean {
    return this.type === InstructionType.CreateArrayIndexRef;
  }

  public shiftRight(countReg: number): boolean {
    switch (this.type) {
      case InstructionType.Literal:
      case InstructionType.Condition:
      case InstructionType.RegArg:
      case InstructionType.RegArgName:
      case InstructionType.List:
      case InstructionType.Tuple:
      case InstructionType.Set:
      case InstructionType.Dictionary:
      case InstructionType.Identifier:
      case InstructionType.None:
      case InstructionType.Del:
      case InstructionType.Yield:
        this.arg1 += countReg;
        break;
      case InstructionType.Raise:
      case InstructionType.Ret:
        if (this.arg1 !== -1) {
          this.arg1 += countReg;
        }
        break;
      case InstructionType.DictionaryAdd:
        this.arg1 += countReg;
        this.arg3 += countReg;
        break;
      case InstructionType.Label:
      case InstructionType.Pass:
      case InstructionType.GoTo:
      case InstructionType.Import:
      case InstructionType.ImportFrom:
      case InstructionType.ImportAs:
      case InstructionType.EnterTry:
      case InstructionType.LeaveTry:
      case InstructionType.EnterFinally:
      case InstructionType.LeaveFinally:
      case InstructionType.WhileCycle:
      case InstructionType.GotoExcept:
      case InstructionType.GotoFinally:
      case InstructionType.LeaveCycle:
      case InstructionType.Continue:
      case InstructionType.Break:
      case InstructionType.ForCycle:
      case InstructionType.EnterExcept:
        break;
      case InstructionType.Add:
      case InstructionType.Sub:
      case InstructionType.Mul:
      case InstructionType.Div:
      case InstructionType.Pow:
      case InstructionType.Floor:
      case InstructionType.Mod:
      case InstructionType.Shl:
      case InstructionType.Shr:
      case InstructionType.At:
      case InstructionType.BinAnd:
      case InstructionType.BinOr:
      case InstructionType.BinXor:
      case InstructionType.BinInv:
      case InstructionType.Less:
      case InstructionType.Greater:
      case InstructionType.LessEq:
      case InstructionType.GreaterEq:
      case InstructionType.Equal:
      case InstructionType.NotEq:
      // case InstructionType.ISeqNext:
      case InstructionType.CreateArrayIndexRef:
      case InstructionType.CreatePropertyRef:
      case InstructionType.ReadArrayIndex:
      case InstructionType.CallMethod:
      case InstructionType.In:
      case InstructionType.Is:
      case InstructionType.IsNot:
      case InstructionType.NotIn:
        this.arg1 += countReg;
        this.arg2 += countReg;
        this.arg3 += countReg;
        break;
      case InstructionType.LogicalNot:
      case InstructionType.Invert:
      case InstructionType.ListAdd:
      case InstructionType.TupleAdd:
      case InstructionType.SetAdd:
      case InstructionType.CopyValue:
      case InstructionType.AugmentedCopy:
      case InstructionType.GetBool:
      case InstructionType.LogicalOr:
      case InstructionType.LogicalAnd:
      case InstructionType.CallFunc:
        this.arg1 += countReg;
        this.arg2 += countReg;
        break;
      case InstructionType.CreateFunc:
      case InstructionType.ReadObject:
      case InstructionType.CreateVarRef:
      case InstructionType.Bool:
        this.arg2 += countReg;
        break;
      case InstructionType.ReadProperty:
        this.arg2 += countReg;
        this.arg3 += countReg;
        break;
      case InstructionType.CreateArrayRangeRef:
      case InstructionType.ReadArrayRange:
        this.arg1 += countReg;
        this.arg2 += countReg;
        this.arg3 += countReg;
        if (this.arg5 !== -1) {
          this.arg5 += countReg;
        }
        this.arg6 += countReg;
        break;
      default:
        return false;
    }
    return true;
  }
}
