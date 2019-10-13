import { Compiler } from '../compiler/Compiler';
import { CompiledModule } from '../compiler/CompiledModule';
import { RunContext } from '../machine/RunContext';
import { RowDescriptor } from './RowDescriptor';
import { PyModule } from './Module';
import { PyBreakpoint } from './Breakpoint';
import { PyMachine } from './Machine';
import { PyObject } from './Object';
import { getObjectUtils } from './ObjectUtils';
import { CompileOptions } from './CompileOptions';

export class LittlePy {
  public static compileModule(text: string, name = 'main', options?: CompileOptions): { module: PyModule; rows: RowDescriptor[] } {
    const { code, rows } = Compiler.compileModule(name, name, text, options);
    return {
      module: code,
      rows,
    };
  }

  public static createMachine(modules: { [key: string]: PyModule } = {}, breakpoints: PyBreakpoint[] = []): PyMachine {
    return new RunContext(modules as { [key: string]: CompiledModule }, breakpoints);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static toPythonObject(object: any): PyObject {
    return getObjectUtils().toPyObject(object, true);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static toJsObject(object: PyObject): any {
    return getObjectUtils().fromPyObject(object, true);
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
