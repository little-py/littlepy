import { PyBreakpoint } from './Breakpoint';
import { PyMachinePosition } from './MachinePosition';
import { PyScope } from './Scope';
import { PyObject } from './Object';
import { PyException } from './Exception';
import { PyStackEntry } from './StackEntry';

export type FinishCallback = (returnValue: PyObject, error: PyException) => void;

export abstract class PyMachine {
  abstract updateBreakpoints(breakpoints: PyBreakpoint[]): void;
  abstract getPosition(): PyMachinePosition;
  abstract getGlobalScope(): PyScope;
  abstract getCurrentScope(): PyScope;
  abstract getUnhandledException(): PyException;
  abstract run(): void;
  abstract stop(): void;
  abstract debug(): void;
  abstract debugContinue(): void;
  abstract debugIn(): void;
  abstract debugOut(): void;
  abstract debugOver(): void;
  abstract isFinished(): boolean;
  abstract startCallModule(name: string, finishCallback?: FinishCallback): void;
  abstract startCallFunction(moduleName: string, funcName: string, args: PyObject[], finishCallback?: FinishCallback): void;
  abstract getOutput(): string[];
  abstract getOutputText(): string;
  abstract getStackEntries(): PyStackEntry[];
  abstract pause(): void;
  abstract resume(): void;
  abstract isPaused(): boolean;

  onWriteLine: (line: string) => void;
  onLeaveFunction: (name: string, scope: PyScope) => void;
  onReadLine: (prompt: string, callback: (result: string) => void) => void;
}
