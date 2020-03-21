import { TokenPosition } from '../api/Token';
import { Instruction } from './Instructions';
import { InstructionType } from './InstructionType';
import { CodeFragment } from '../api/CodeFragment';

export class CodeFragmentInst implements CodeFragment {
  public code: Instruction[] = [];
  public finish: number;
  public success: boolean;
  public nameLiteral: string;
  public position: TokenPosition;
  public comprehension: boolean;

  public add(t: InstructionType, position: TokenPosition, a1 = 0, a2 = 0, a3 = 0, a4 = InstructionType.None, a5 = 0, a6 = 0) {
    this.code.push(new Instruction(t, position, a1, a2, a3, a4, a5, a6));
  }
}
