import { Instruction } from './Instructions';
import { CompiledModule } from '../compiler/CompiledModule';
import { PyFunction } from '../api/Function';

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
  FunctionTypeRegular,
  FunctionTypeClass,
  FunctionTypeClassMember,
  FunctionTypeModule,
}

export class FunctionBody implements PyFunction {
  public name: string;
  public code: Instruction[];
  public arguments: FunctionArgument[] = [];
  public parent: number;
  public type: FunctionType;
  public id: string;
  public module: CompiledModule;
  public inheritsFrom: string[] = [];
  /* istanbul ignore next */
  public get dump() {
    if (!DEBUG) {
      return;
    }
    return this.code.map(i => ({
      info: this.module && i.getDescription(this.module),
      row: i.row,
      column: i.column,
      type: i.typeText,
    }));
  }
}
