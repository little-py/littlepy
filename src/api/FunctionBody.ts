import { PyFunction } from './Function';
import { PyModule } from './Module';
import { FullCode } from './FullCode';
import { CodeGenerator } from './CodeGenerator';

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

export class FunctionBody implements PyFunction {
  public name: string;
  public documentation: string;
  public code: FullCode;
  public arguments: FunctionArgument[] = [];
  public parent: number;
  public type: FunctionType;
  public id: string;
  public module: PyModule;
  public inheritsFrom: string[] = [];
  public debug?: string;

  /* istanbul ignore next */
  public initialize(codeGenerator: CodeGenerator) {
    if (!DEBUG) {
      return;
    }

    this.debug = codeGenerator.getFullDebugInformation(this.module, this);
  }
}
