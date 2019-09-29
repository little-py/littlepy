import { BaseObject } from '../objects/BaseObject';
import { print } from './print';
import { range } from './range';
import { exceptions } from './exceptions';
import { ExceptionType } from '../objects/ExceptionObject';

const GLOBAL_FUNCTIONS: { [key: string]: () => BaseObject } = {
  print: print,
  range: range,
  Exception: exceptions(ExceptionType.Base, 'Exception'),
  SystemExit: exceptions(ExceptionType.SystemExit, 'SystemExit'),
  KeyboardInterrupt: exceptions(ExceptionType.KeyboardInterrupt, 'KeyboardInterrupt'),
  StopIteration: exceptions(ExceptionType.StopIteration, 'StopIteration'),
  StopAsyncIteration: exceptions(ExceptionType.StopAsyncIteration, 'StopAsyncIteration'),
  ArithmeticError: exceptions(ExceptionType.ArithmeticError, 'ArithmeticError'),
  FloatingPointError: exceptions(ExceptionType.FloatingPointError, 'FloatingPointError'),
  OverflowError: exceptions(ExceptionType.OverflowError, 'OverflowError'),
  ZeroDivisionError: exceptions(ExceptionType.ZeroDivisionError, 'ZeroDivisionError'),
  AssertionError: exceptions(ExceptionType.AssertionError, 'AssertionError'),
  BufferError: exceptions(ExceptionType.BufferError, 'BufferError'),
  EOFError: exceptions(ExceptionType.EofError, 'EofError'),
  ImportError: exceptions(ExceptionType.ImportError, 'ImportError'),
  ModuleNotFoundError: exceptions(ExceptionType.ModuleNotFoundError, 'ModuleNotFoundError'),
  LookupError: exceptions(ExceptionType.LookupError, 'LookupError'),
  IndexError: exceptions(ExceptionType.IndexError, 'IndexError'),
  KeyError: exceptions(ExceptionType.KeyError, 'KeyError'),
  MemoryError: exceptions(ExceptionType.MemoryError, 'MemoryError'),
  NameError: exceptions(ExceptionType.NameError, 'NameError'),
  UnboundLocalError: exceptions(ExceptionType.UnboundLocalError, 'UnboundLocalError'),
  OSError: exceptions(ExceptionType.OsError, 'OSError'),
  BlockingIOError: exceptions(ExceptionType.BlockingIoError, 'BlockingIOError'),
  ChildProcessError: exceptions(ExceptionType.ChildProcessError, 'ChildProcessError'),
  ConnectionError: exceptions(ExceptionType.ConnectionError, 'ConnectionError'),
  BrokenPipeError: exceptions(ExceptionType.BrokenPipeError, 'BrokenPipeError'),
  ConnectionAbortedError: exceptions(ExceptionType.ConnectionAbortedError, 'ConnectionAbortedError'),
  ConnectionRefusedError: exceptions(ExceptionType.ConnectionRefusedError, 'ConnectionRefusedError'),
  ConnectionResetError: exceptions(ExceptionType.ConnectionResetError, 'ConnectionResetError'),
  FileExistsError: exceptions(ExceptionType.FileExistsError, 'FileExistsError'),
  FileNotFoundError: exceptions(ExceptionType.FileNotFoundError, 'FileNotFoundError'),
  InterruptedError: exceptions(ExceptionType.InterruptedError, 'InterruptedError'),
  IsADirectoryError: exceptions(ExceptionType.IsADirectoryError, 'IsADirectoryError'),
  NotADirectoryError: exceptions(ExceptionType.NotADirectoryError, 'NotADirectoryError'),
  PermissionError: exceptions(ExceptionType.PermissionError, 'PermissionError'),
  ProcessLookupError: exceptions(ExceptionType.ProcessLookupError, 'ProcessLookupError'),
  TimeoutError: exceptions(ExceptionType.TimeoutError, 'TimeoutError'),
  ReferenceError: exceptions(ExceptionType.ReferenceError, 'ReferenceError'),
  RuntimeError: exceptions(ExceptionType.RuntimeError, 'RuntimeError'),
  NotImplementedError: exceptions(ExceptionType.NotImplementedError, 'NotImplementedError'),
  RecursionError: exceptions(ExceptionType.RecursionError, 'RecursionError'),
  SyntaxError: exceptions(ExceptionType.SyntaxError, 'SyntaxError'),
  IndentationError: exceptions(ExceptionType.IndentationError, 'IndentationError'),
  TabError: exceptions(ExceptionType.TabError, 'TabError'),
  SystemError: exceptions(ExceptionType.SystemError, 'SystemError'),
  TypeError: exceptions(ExceptionType.TypeError, 'TypeError'),
  ValueError: exceptions(ExceptionType.ValueError, 'ValueError'),
  UnicodeError: exceptions(ExceptionType.UnicodeError, 'UnicodeError'),
  UnicodeDecodeError: exceptions(ExceptionType.UnicodeDecodeError, 'UnicodeDecodeError'),
  UnicodeEncodeError: exceptions(ExceptionType.UnicodeEncodeError, 'UnicodeEncodeError'),
  UnicodeTranslateError: exceptions(ExceptionType.UnicodeTranslateError, 'UnicodeTranslateError'),
};

export function getEmbeddedType(name: string): BaseObject {
  const def = GLOBAL_FUNCTIONS[name];
  if (!def) {
    return;
  }
  return def();
}
