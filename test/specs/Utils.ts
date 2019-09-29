import { CompiledModule } from '../../../src/compiler/CompiledModule';
import { Compiler } from '../../../src/compiler/Compiler';
import { RunContext } from '../../../src/machine/RunContext';
import { Breakpoint } from '../../../src/machine/Breakpoint';

export function compileModule(source: string, name: string, wrapWithPrint?: boolean) {
  const pos = source.indexOf('\n');
  if (pos >= 0 && !source.substr(0, pos).trim()) {
    source = source.substr(pos + 1);
  }
  const { code } = Compiler.compileModule(name, name, source, wrapWithPrint);
  return code;
}

export function runModules(modules: { [key: string]: CompiledModule }, main: string): RunContext {
  const runContext = new RunContext(modules);
  runContext.startCallModule(main);
  runContext.run();
  return runContext;
}

export function compileAndStartModule(source: string, breakpoints: Breakpoint[] = []): RunContext {
  const code = compileModule(source, 'main');
  breakpoints = breakpoints.map(({ row, condition }) => ({ row, condition, moduleId: 'main' }));
  const runContext = new RunContext({ main: code }, breakpoints);
  runContext.startCallModule('main');
  return runContext;
}
