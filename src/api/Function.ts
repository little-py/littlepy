import { FullCode } from './FullCode';

export enum ArgumentType {
  Normal,
  KeywordArguments, // ie **arg, will be wrapped as dictionary
  ArbitraryArguments, // ie *arg, will be wrapped as tuple
}

export class FunctionArgument {
  public id: number;
  public initReg: number;
  public type: ArgumentType;
}

export enum FunctionType {
  Regular = 'Regular',
  Class = 'Class',
  ClassMember = 'ClassMember',
  Module = 'Module',
}

export interface PyFunction {
  readonly name: string;
  readonly documentation: string;
  code: FullCode;
  arguments: FunctionArgument[];
  type: FunctionType;
}
