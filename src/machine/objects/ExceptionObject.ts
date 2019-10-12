import { ClassInstanceObject } from './ClassInstanceObject';
import { ClassInheritance } from './ClassObject';
import { ExceptionClassObject } from './ExceptionClassObject';
import { StringObject } from './StringObject';
import { BaseObject } from './BaseObject';
import { ExceptionType } from '../../api/ExceptionType';
import { PyException } from '../../api/Exception';

const MAP_PUBLIC_EXCEPTION_NAME_TO_CODE = {
  BaseException: ExceptionType.Base,
  ArithmeticError: ExceptionType.ArithmeticError,
  BufferError: ExceptionType.BufferError,
  LookupError: ExceptionType.LookupError,
  AssertionError: ExceptionType.AssertionError,
  AttributeError: ExceptionType.AttributeError,
  EofError: ExceptionType.EofError,
  FloatingPointError: ExceptionType.FloatingPointError,
  GeneratorExit: ExceptionType.GeneratorExit,
  ImportError: ExceptionType.ImportError,
  ModuleNotFoundError: ExceptionType.ModuleNotFoundError,
  IndexError: ExceptionType.IndexError,
  KeyError: ExceptionType.KeyError,
  KeyboardInterrupt: ExceptionType.KeyboardInterrupt,
  MemoryError: ExceptionType.MemoryError,
  NameError: ExceptionType.NameError,
  NotImplementedError: ExceptionType.NotImplementedError,
  OsError: ExceptionType.OsError,
  OverflowError: ExceptionType.OverflowError,
  RecursionError: ExceptionType.RecursionError,
  ReferenceError: ExceptionType.ReferenceError,
  RuntimeError: ExceptionType.RuntimeError,
  StopIteration: ExceptionType.StopIteration,
  StopAsyncIteration: ExceptionType.StopAsyncIteration,
  SyntaxError: ExceptionType.SyntaxError,
  IndentationError: ExceptionType.IndentationError,
  TabError: ExceptionType.TabError,
  SystemError: ExceptionType.SystemError,
  SystemExit: ExceptionType.SystemExit,
  TypeError: ExceptionType.TypeError,
  UnboundLocalError: ExceptionType.UnboundLocalError,
  UnicodeError: ExceptionType.UnicodeError,
  UnicodeEncodeError: ExceptionType.UnicodeEncodeError,
  UnicodeDecodeError: ExceptionType.UnicodeDecodeError,
  UnicodeTranslateError: ExceptionType.UnicodeTranslateError,
  ValueError: ExceptionType.ValueError,
  ZeroDivisionError: ExceptionType.ZeroDivisionError,
  EnvironmentError: ExceptionType.EnvironmentError,
  IoError: ExceptionType.IoError,
  BlockingIoError: ExceptionType.BlockingIoError,
  ChildProcessError: ExceptionType.ChildProcessError,
  ConnectionError: ExceptionType.ConnectionError,
  BrokenPipeError: ExceptionType.BrokenPipeError,
  ConnectionAbortedError: ExceptionType.ConnectionAbortedError,
  ConnectionRefusedError: ExceptionType.ConnectionRefusedError,
  ConnectionResetError: ExceptionType.ConnectionResetError,
  FileExistsError: ExceptionType.FileExistsError,
  FileNotFoundError: ExceptionType.FileNotFoundError,
  InterruptedError: ExceptionType.InterruptedError,
  IsADirectoryError: ExceptionType.IsADirectoryError,
  NotADirectoryError: ExceptionType.NotADirectoryError,
  PermissionError: ExceptionType.PermissionError,
  ProcessLookupError: ExceptionType.ProcessLookupError,
  TimeoutError: ExceptionType.TimeoutError,
};

const EXCEPTION_DESCRIPTION: { [key: string]: string } = {
  [ExceptionType.ArithmeticError]: 'Arithmetic error',
  [ExceptionType.BufferError]: 'Buffer error',
  [ExceptionType.LookupError]: 'Lookup error',
  [ExceptionType.AssertionError]: 'Assertion error',
  [ExceptionType.AttributeError]: 'Attribute error',
  [ExceptionType.EofError]: 'End of file error',
  [ExceptionType.FloatingPointError]: 'Floating pointer error',
  [ExceptionType.GeneratorExit]: 'Generator exit',
  [ExceptionType.ImportError]: 'Import error',
  [ExceptionType.ModuleNotFoundError]: 'Module not found',
  [ExceptionType.IndexError]: 'Index error',
  [ExceptionType.KeyError]: 'Key error',
  [ExceptionType.KeyboardInterrupt]: 'Keyboard interrupt',
  [ExceptionType.MemoryError]: 'Memory error',
  [ExceptionType.NameError]: 'Name error',
  [ExceptionType.NotImplementedError]: 'Not implemented',
  [ExceptionType.OsError]: 'OS error',
  [ExceptionType.OverflowError]: 'Overflow error',
  [ExceptionType.RecursionError]: 'Recursion error',
  [ExceptionType.ReferenceError]: 'Reference error',
  [ExceptionType.RuntimeError]: 'Runtime error',
  [ExceptionType.StopIteration]: 'Stop iteration',
  [ExceptionType.StopAsyncIteration]: 'Stop async iteration',
  [ExceptionType.SyntaxError]: 'Syntax error',
  [ExceptionType.IndentationError]: 'Indentation error',
  [ExceptionType.TabError]: 'Tab error',
  [ExceptionType.SystemError]: 'System error',
  [ExceptionType.SystemExit]: 'System exit',
  [ExceptionType.TypeError]: 'Type error',
  [ExceptionType.UnboundLocalError]: 'Unbound local error',
  [ExceptionType.UnicodeError]: 'Unicode error',
  [ExceptionType.UnicodeEncodeError]: 'Unicode encode error',
  [ExceptionType.UnicodeDecodeError]: 'Unicode decode error',
  [ExceptionType.UnicodeTranslateError]: 'Unicode translate error',
  [ExceptionType.ValueError]: 'Value error',
  [ExceptionType.ZeroDivisionError]: 'Zero division error',
  [ExceptionType.EnvironmentError]: 'Environment error',
  [ExceptionType.IoError]: 'I/O error',
  [ExceptionType.BlockingIoError]: 'Blocking I/O error',
  [ExceptionType.ChildProcessError]: 'Child process error',
  [ExceptionType.ConnectionError]: 'Connection error',
  [ExceptionType.BrokenPipeError]: 'Broken pipe error',
  [ExceptionType.ConnectionAbortedError]: 'Connection aborted error',
  [ExceptionType.ConnectionRefusedError]: 'Connection refused error',
  [ExceptionType.ConnectionResetError]: 'Connection reset error',
  [ExceptionType.FileExistsError]: 'File exists',
  [ExceptionType.FileNotFoundError]: 'File not found',
  [ExceptionType.InterruptedError]: 'Interrupted',
  [ExceptionType.IsADirectoryError]: 'This is a directory',
  [ExceptionType.NotADirectoryError]: 'This is not a directory',
  [ExceptionType.PermissionError]: 'Permission error',
  [ExceptionType.ProcessLookupError]: 'Process lookup error',
  [ExceptionType.TimeoutError]: 'Timeout error',
  [ExceptionType.NotASequence]: 'This is not a sequence',
  [ExceptionType.NotAFunction]: 'This is not a function',
  [ExceptionType.UnknownIdentifier]: 'Unknown identifier',
  [ExceptionType.FunctionArgumentError]: 'Function argument error',
  [ExceptionType.FunctionDuplicateArgumentError]: 'Duplicate function call argument',
  [ExceptionType.FunctionMissingArgument]: 'Missing function call argument',
  [ExceptionType.ExpectedReference]: 'Expected reference',
  [ExceptionType.UnpackSourceIsNotSequence]: 'Source is not a sequence',
  [ExceptionType.CannotUnpackToEmptyTuple]: 'Cannot unpack to empty tuple',
  [ExceptionType.UnpackCountDoesntMatch]: "Count of unpack doesn't match",
  [ExceptionType.FunctionArgumentCountMismatch]: 'Mismatch argument count for function',
  [ExceptionType.FunctionTooManyArguments]: 'Too many arguments provided',
  [ExceptionType.ImportAllowedOnlyOnModuleLevel]: 'Import is only allowed at module level',
  [ExceptionType.CannotBuildClassHierarchy]: 'Cannot build class hierarchy',
  [ExceptionType.BreakOrContinueOutsideOfCycle]: 'Break or continue is called outside of cycle',
  [ExceptionType.ResolutionOrder]: 'Cannot determine resolution order',
  [ExceptionType.CannotReRaise]: 'Cannot re-raise exception',
};

export class ExceptionObject extends ClassInstanceObject implements PyException {
  public constructor(t: ExceptionType, inherits?: ClassInheritance[], ...params: string[]) {
    super(inherits || [], null);
    this.exceptionType = t;
    this.message = EXCEPTION_DESCRIPTION[this.exceptionType] || '';
    this.params = params;
  }

  getAttribute(name: string): BaseObject {
    switch (name) {
      case 'message':
        return new StringObject(this.message);
      case 'type':
        return new StringObject(this.exceptionType);
    }
    return super.getAttribute(name);
  }

  /* istanbul ignore next */
  public static getExceptionType(id: string): ExceptionType {
    return MAP_PUBLIC_EXCEPTION_NAME_TO_CODE[id] || ExceptionType.NonPublicExceptionType;
  }

  public matchesTo(classObject: ExceptionClassObject): boolean {
    if (classObject.inheritsFrom.length === 0) {
      if (classObject.exceptionType === this.exceptionType) {
        return true;
      }
      switch (classObject.exceptionType) {
        case ExceptionType.Base:
          return true;
        case ExceptionType.ArithmeticError:
          return (
            this.exceptionType === ExceptionType.FloatingPointError ||
            this.exceptionType === ExceptionType.OverflowError ||
            this.exceptionType === ExceptionType.ZeroDivisionError
          );
        case ExceptionType.ImportError:
          return this.exceptionType === ExceptionType.ModuleNotFoundError;
        case ExceptionType.NameError:
          return this.exceptionType === ExceptionType.UnboundLocalError;
        case ExceptionType.OsError:
          return (
            this.exceptionType === ExceptionType.BlockingIoError ||
            this.exceptionType === ExceptionType.ChildProcessError ||
            this.exceptionType === ExceptionType.ConnectionError ||
            this.exceptionType === ExceptionType.BrokenPipeError ||
            this.exceptionType === ExceptionType.ConnectionAbortedError ||
            this.exceptionType === ExceptionType.ConnectionRefusedError ||
            this.exceptionType === ExceptionType.ConnectionResetError ||
            this.exceptionType === ExceptionType.FileExistsError ||
            this.exceptionType === ExceptionType.FileNotFoundError ||
            this.exceptionType === ExceptionType.InterruptedError ||
            this.exceptionType === ExceptionType.IsADirectoryError ||
            this.exceptionType === ExceptionType.NotADirectoryError ||
            this.exceptionType === ExceptionType.PermissionError ||
            this.exceptionType === ExceptionType.ProcessLookupError ||
            this.exceptionType === ExceptionType.TimeoutError
          );
        case ExceptionType.ConnectionError:
          return (
            this.exceptionType === ExceptionType.ConnectionAbortedError ||
            this.exceptionType === ExceptionType.ConnectionRefusedError ||
            this.exceptionType === ExceptionType.ConnectionResetError
          );
        case ExceptionType.RuntimeError:
          return this.exceptionType === ExceptionType.NotImplementedError || this.exceptionType === ExceptionType.RecursionError;
        case ExceptionType.SyntaxError:
          return this.exceptionType === ExceptionType.IndentationError || this.exceptionType === ExceptionType.TabError;
        case ExceptionType.IndentationError:
          return this.exceptionType === ExceptionType.TabError;
        case ExceptionType.ValueError:
          return (
            this.exceptionType === ExceptionType.UnicodeError ||
            this.exceptionType === ExceptionType.UnicodeDecodeError ||
            this.exceptionType === ExceptionType.UnicodeEncodeError ||
            this.exceptionType === ExceptionType.UnicodeTranslateError
          );
        case ExceptionType.UnicodeError:
          return (
            this.exceptionType === ExceptionType.UnicodeDecodeError ||
            this.exceptionType === ExceptionType.UnicodeEncodeError ||
            this.exceptionType === ExceptionType.UnicodeTranslateError
          );
      }
      return false;
    }
    if (classObject.exceptionType !== this.exceptionType) {
      return true;
    }
    for (const inherited of classObject.inheritsFrom) {
      if (this.classInheritance.findIndex(c => c.object.id === inherited.object.id) < 0) {
        return false;
      }
    }
    return this.classInheritance.findIndex(c => c.object.id === classObject.id) >= 0;
  }

  public readonly exceptionType: ExceptionType;
  public readonly message: string;
  public readonly params: string[];

  public static setThrowExceptionHandler() {
    BaseObject.throwException = (type: ExceptionType, ...args: string[]) => {
      throw new ExceptionObject(type, [], ...args);
    };
  }
}

ExceptionObject.setThrowExceptionHandler();
