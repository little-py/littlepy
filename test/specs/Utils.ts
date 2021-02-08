import { RowDescriptor } from '../../src/api/RowDescriptor';
import { Compiler } from '../../src/compiler/Compiler';
import { RunContext } from '../../src/machine/RunContext';
import { PyBreakpoint } from '../../src/api/Breakpoint';
import { CompileOptions } from '../../src/api/CompileOptions';
import { CompiledModule } from '../../src/api/CompiledModule';
import { MachineConfig } from '../../src/api/MachineConfig';

export function compileModuleAndRows(source: string, name: string, options?: CompileOptions, raw?: boolean): {
  code: CompiledModule;
  rows: RowDescriptor[];
} {
  if (!raw) {
    const pos = source.indexOf('\n');
    if (pos >= 0 && !source.substr(0, pos).trim()) {
      source = source.substr(pos + 1);
    }
  }
  return Compiler.compileModule(name, name, source, options);
}

export function compileModule(source: string, name: string, options?: CompileOptions, raw?: boolean): CompiledModule {
  if (!raw) {
    const pos = source.indexOf('\n');
    if (pos >= 0 && !source.substr(0, pos).trim()) {
      source = source.substr(pos + 1);
    }
  }
  const { code } = Compiler.compileModule(name, name, source, options);
  return code;
}

export function runModules(modules: { [key: string]: CompiledModule }, main: string): RunContext {
  const runContext = new RunContext(modules);
  runContext.startCallModule(main);
  runContext.run();
  return runContext;
}

export function compileAndStartModule(source: string, breakpoints: PyBreakpoint[] = [], config: MachineConfig = undefined): RunContext {
  const code = compileModule(source, 'main');
  breakpoints = breakpoints.map(({ row, condition }) => ({ row, condition, moduleId: 'main' }));
  const runContext = new RunContext({ main: code }, breakpoints, config);
  runContext.startCallModule('main');
  return runContext;
}
