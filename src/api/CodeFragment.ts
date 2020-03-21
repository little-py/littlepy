import { TokenPosition } from './Token';

export interface CodeFragment {
  success: boolean;
  finish: number;
  nameLiteral: string;
  comprehension: boolean;
  position: TokenPosition;
}
