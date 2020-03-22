import { RowType } from './RowType';

export class RowDescriptor {
  type: RowType;
  subTypes?: RowType[];
  usesVariables?: boolean;
  isInline?: boolean;
  isArrayAssignment?: boolean;
  hasOperators?: boolean;
  hasTupleUnpack?: boolean;
  hasRangeAccessor?: boolean;
  hasIfExpression?: boolean;
  hasComprehension?: boolean;
  introducedVariable?: string;
  hasLambda?: boolean;
  functionName?: string[];
  className?: string;
  literals?: string[];
}
