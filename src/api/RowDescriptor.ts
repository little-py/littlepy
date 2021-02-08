import { RowType } from './RowType';
import { OperatorType } from './Token';

export class RowDescriptor {
  types: RowType[];
  isInline?: boolean;
  isArrayAssignment?: boolean;
  usedOperators?: OperatorType[];
  hasTupleUnpack?: boolean;
  hasRangeAccessor?: boolean;
  hasIfExpression?: boolean;
  hasComprehension?: boolean;
  referencedVariables?: string[];
  modifiedVariables?: string[];
  hasLambda?: boolean;
  functionName?: string[];
  className?: string;
  literals?: string[];
}
