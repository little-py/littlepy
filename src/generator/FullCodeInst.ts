import { FullCode } from '../api/FullCode';
import { Instruction } from './Instructions';

export interface FullCodeInst extends FullCode {
  instructions: Instruction[];
}
