import { PyBreakpoint } from './Breakpoint';
import { PyMachinePosition } from './MachinePosition';
import { PyScope } from './Scope';
import { PyObject } from './Object';

export type FinishCallback = (returnValue: PyObject, error: PyObject) => void;

export interface PyMachine {
  updateBreakpoints(breakpoints: PyBreakpoint[]);
  getPosition(): PyMachinePosition;
  getGlobalScope(): PyScope;
  getCurrentScope(): PyScope;
  getUnhandledException(): PyObject;
  run(): void;
  stop(): void;
  debug(): void;
  debugIn(): void;
  debugOut(): void;
  debugOver(): void;
  isFinished(): boolean;
  startCallModule(name: string, finishCallback: FinishCallback);
  startCallFunction(moduleName: string, funcName: string, args: PyObject[], finishCallback: FinishCallback);
  getOutput(): string[];
  getOutputText(): string;

  onWriteLine: (line: string) => void;
}
