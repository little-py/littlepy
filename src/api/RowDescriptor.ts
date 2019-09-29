import { RowType } from './RowType';

export interface RowDescriptor {
  type: RowType;
  usesVariables?: boolean;
  isInline?: boolean;
  isArrayAssignment?: boolean;
  hasOperators?: boolean;
  introducesVariable?: boolean;
  functionName?: string;
  literals?: string[];
}
