import { Compiler } from '../compiler/Compiler';
import { CompiledModule } from '../compiler/CompiledModule';
import { RunContext } from '../machine/RunContext';
import { RowDescriptor } from './RowDescriptor';
import { PyModule } from './Module';
import { PyBreakpoint } from './Breakpoint';
import { PyMachine } from './Machine';

export class LittlePy {
  public static compileModule(text: string, name = 'main', wrapWithPrint = false): { module: PyModule; rows: RowDescriptor[] } {
    const { code, rows } = Compiler.compileModule(name, name, text, wrapWithPrint);
    return {
      module: code,
      rows,
    };
  }

  public static createMachine(modules: { [key: string]: PyModule } = {}, breakpoints: PyBreakpoint[] = []): PyMachine {
    return new RunContext(modules as { [key: string]: CompiledModule }, breakpoints);
  }
}
