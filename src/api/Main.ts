/* eslint-disable @typescript-eslint/no-explicit-any */
import { Compiler } from '../compiler/Compiler';
import { FullCodeInst } from '../generator/FullCodeInst';
import { Instruction } from '../generator/Instructions';
import { CompiledModule } from './CompiledModule';
import { RunContext } from '../machine/RunContext';
import { PyFunction } from './Function';
import { RowDescriptor } from './RowDescriptor';
import { PyModule } from './Module';
import { PyBreakpoint } from './Breakpoint';
import { PyMachine } from './Machine';
import { PyObject } from './Object';
import { getObjectUtils } from './ObjectUtils';
import { CompileOptions } from './CompileOptions';
import { MachineConfig } from './MachineConfig';

export class LittlePy {
  public static compileModule(text: string, name = 'main', options?: CompileOptions): { module: PyModule; rows: RowDescriptor[] } {
    const { code, rows } = Compiler.compileModule(name, name, text, options);
    return {
      module: code,
      rows,
    };
  }

  public static createMachine(
    modules: { [key: string]: PyModule } = {},
    breakpoints: PyBreakpoint[] = [],
    config: MachineConfig = undefined,
  ): PyMachine {
    return new RunContext(modules as { [key: string]: CompiledModule }, breakpoints, config);
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  public static toPythonObject(object: any): PyObject {
    return getObjectUtils().toPyObject(object, true);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static toJsObject(object: PyObject): any {
    return getObjectUtils().fromPyObject(object);
  }

  public static getFunctionInstructions(func: PyFunction): Instruction[] {
    return (func.code as FullCodeInst).instructions;
  }
}

export * from './RowType';
export * from './Decorators';
export * from './Object';
export * from './Scope';
export * from './StackEntry';
export * from './Token';
export * from './Keyword';
export * from './ErrorType';
export * from './Error';
export * from './Module';
export * from './Machine';
export * from './RowDescriptor';
export * from './MachinePosition';
export * from './Exception';
export * from './Breakpoint';
export * from './Native';
export * from './CallContext';
