import { BaseObject } from '../objects/BaseObject';
import { print } from './Print';
import { range } from './Range';
import { exceptions } from './Exceptions';
import { sys } from './Sys';
import { ExceptionType } from '../../api/ExceptionType';
import { len } from './Len';
import { IntegerClassObject } from '../objects/IntegerClassObject';
import { FloatClassObject } from '../objects/FloatClassObject';
import { hash } from './Hash';
import { setFactory } from './Set';
import { frozenSetFactory } from './FrozenSet';
import { dictFactory } from './Dict';
import { iter } from './Iter';
import { listFactory } from './List';
import { exportedFunctions } from './Functions';
import { pow } from './Math';
import { getClassObject, getFunctionObject } from './Utils';
import { ObjectScope } from '../ObjectScope';

const GlobalPropertiesCreators: { [key: string]: () => BaseObject } = {
  abs: () => getFunctionObject(exportedFunctions.abs, 'abs'),
  all: () => getFunctionObject(exportedFunctions.all, 'all'),
  any: () => getFunctionObject(exportedFunctions.any, 'any'),
  chr: () => getFunctionObject(exportedFunctions.chr, 'chr'),
  min: () => getFunctionObject(exportedFunctions.min, 'min'),
  max: () => getFunctionObject(exportedFunctions.max, 'max'),
  sum: () => getFunctionObject(exportedFunctions.sum, 'sum'),
  pow: () => getFunctionObject(pow, 'pow'),
  print: () => getFunctionObject(print, 'print'),
  range: () => getFunctionObject(range, 'range'),
  len: () => getFunctionObject(len, 'len'),
  hash: () => getFunctionObject(hash, 'hash'),
  iter: () => getFunctionObject(iter, 'iter'),
  int: () => getClassObject(new IntegerClassObject(null), 'int'),
  float: () => getClassObject(new FloatClassObject(null), 'float'),
  set: setFactory,
  frozenset: frozenSetFactory,
  dict: dictFactory,
  list: listFactory,
  __sys__: sys,
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

export const getEmbeddedType = (name: string): BaseObject => {
  const def = GlobalPropertiesCreators[name];
  if (!def) {
    return;
  }
  return def();
};
