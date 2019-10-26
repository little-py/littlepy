import { RowType } from './RowType';

export class RowDescriptor {
  type: RowType;
  usesVariables?: boolean;
  isInline?: boolean;
  isArrayAssignment?: boolean;
  hasOperators?: boolean;
  hasTupleUnpack?: boolean;
  hasRangeAccessor?: boolean;
  hasIfExpression?: boolean;
  hasComprehension?: boolean;
  introducesVariable?: boolean;
  hasLambda?: boolean;
  functionName?: string;
  literals?: string[];
}
