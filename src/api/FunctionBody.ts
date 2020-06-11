import { FunctionArgument, FunctionType, PyFunction } from './Function';
import { PyModule } from './Module';
import { FullCode } from './FullCode';
import { CodeGenerator } from './CodeGenerator';

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
  public initialize(codeGenerator: CodeGenerator): void {
    if (!DEBUG) {
      return;
    }

    this.debug = codeGenerator.getFullDebugInformation(this.module, this);
  }
}
