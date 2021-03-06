import { compileAndStartModule, compileModule, runModules } from './Utils';
import { RunContext } from '../../src/machine/RunContext';
import { ExceptionObject } from '../../src/machine/objects/ExceptionObject';
import { ModuleObject } from '../../src/machine/objects/ModuleObject';
import { PyObject } from '../../src/api/Object';
import { getObjectUtils } from '../../src/api/ObjectUtils';
import { StringObject } from '../../src/machine/objects/StringObject';
import { NumberObject } from '../../src/machine/objects/NumberObject';
import { PyErrorType } from '../../src/api/ErrorType';
import { UniqueErrorCode } from '../../src/api/UniqueErrorCode';

describe('Customize runContext', () => {
  it('should write to callback instead of internal buffer', () => {
    const accumulated: string[] = [];
    const runContext = compileAndStartModule(`
      print('test1')
      print("test2")
    `);
    runContext.onWriteLine = (line) => accumulated.push(line);
    runContext.run();
    expect(runContext.getOutputText()).toEqual('');
    expect(accumulated).toEqual(['test1', 'test2']);
  });

  it('should call finished callback', () => {
    const code = compileModule(
      `
      print('test1')
      print("test2")
    `,
      'main',
    );
    const runContext = new RunContext({
      main: code,
    });
    let finishCalled = false;
    runContext.startCallModule('main', (returnValue: PyObject, unhandledException: ExceptionObject) => {
      finishCalled = true;
      expect(unhandledException).toBeFalsy();
      expect(returnValue instanceof ModuleObject).toBeTruthy();
    });
    runContext.run();
    expect(finishCalled).toBeTruthy();
  });

  it('should execute runContext in interpreter mode', () => {
    const code = compileModule(
      `
      2 + 3
      10 * 2
    `,
      'main',
      {
        wrapWithPrint: true,
      },
    );
    const runContext = runModules(
      {
        main: code,
      },
      'main',
    );
    expect(runContext.getOutput()).toEqual(['5', '20']);
  });

  it('should execute runContext in interpreter mode', () => {
    const code = compileModule(
      `
      for
    `,
      'main',
      {
        wrapWithPrint: true,
      },
    );
    expect(code.errors[0].type).toEqual(PyErrorType.ExpectedExpressionValue);
  });

  it('should execute runContext in interpreter mode', () => {
    const code = compileModule(
      `
      2 + 5 = 10
    `,
      'main',
      {
        wrapWithPrint: true,
      },
    );
    expect(code.errors[0].type).toEqual(PyErrorType.ExpectedEndOfExpression);
  });

  it('should handle unitialized position', () => {
    const code = compileModule(
      `
    `,
      'main',
    );
    const runContext = new RunContext({
      main: code,
    });
    expect(runContext.getPosition()).toBeUndefined();
    runContext.debugOver();
  });

  it('should wrap and unwrap JS objects into Python objects', () => {
    const a = {
      x: 10,
      y: 'test',
      z: {
        b: 20,
      },
    };
    const wrapped = getObjectUtils().toPyObject(a, true);
    const x = wrapped.getAttribute('x');
    expect(x instanceof NumberObject && x.value).toEqual(10);
    const y = wrapped.getAttribute('y');
    expect(y instanceof StringObject && y.value).toEqual('test');
    const z = wrapped.getAttribute('z');
    const b = z.getAttribute('b');
    expect(b instanceof NumberObject && b.value).toEqual(20);

    const unwrapped = getObjectUtils().fromPyObject(wrapped);
    expect(unwrapped.z.b).toEqual(20);
    expect(getObjectUtils().fromPyObject(x)).toEqual(10);
    expect(getObjectUtils().fromPyObject(y)).toEqual('test');
  });

  it('should handle user input', () => {
    const runContext = compileAndStartModule(
      `
      a = input('test1')
      print(a)
    `,
    );
    let prompt = '';
    runContext.onReadLine = (p: string, callback: (result: string) => void) => {
      prompt = p;
      callback('test2');
    };
    runContext.run();
    expect(prompt).toEqual('test1');
    expect(runContext.getOutputText()).toEqual('test2');
  });

  it('should handle postponed user input', () => {
    const runContext = compileAndStartModule(
      `
      a = input('test1')
      print(a)
    `,
    );
    let prompt = '';
    let promptCallback: (result: string) => void;
    runContext.onReadLine = (p: string, callback: (result: string) => void) => {
      prompt = p;
      promptCallback = callback;
      runContext.pause();
    };
    runContext.run();
    expect(runContext.isPaused()).toEqual(true);
    promptCallback('test2');
    runContext.resume();
    expect(prompt).toEqual('test1');
    expect(runContext.getOutputText()).toEqual('test2');
  });

  it('should generate module not found exception', () => {
    const code = compileModule('', 'main');
    const runContext = new RunContext({
      main: code,
    });
    runContext.startCallFunction('module', 'function', [], () => {});
    const exception = runContext.getUnhandledException();
    expect(exception && exception.uniqueError).toEqual(UniqueErrorCode.ModuleNotFound);
  });

  it('should generate function not found exception', () => {
    const code = compileModule('', 'main');
    const runContext = new RunContext({
      main: code,
    });
    runContext.startCallModule('main');
    runContext.run();
    runContext.startCallFunction('main', 'function', [], () => {});
    const exception = runContext.getUnhandledException();
    expect(exception && exception.uniqueError).toEqual(UniqueErrorCode.FunctionNotFound);
  });

  it('should break on infinite loop', () => {
    let runContext = compileAndStartModule(
      `
      while True:
        print("test")
    `,
      [],
      { maximumSingleRunSteps: 100 },
    );
    let lines = 0;
    runContext.onWriteLine = () => lines++;
    runContext.run();
    expect(lines).toEqual(50);
    runContext = compileAndStartModule(
      `
      while True:
        print("test")
    `,
      [],
      { maximumSingleRunSteps: 100 },
    );
    lines = 0;
    runContext.onWriteLine = () => lines++;
    runContext.debug();
    expect(lines).toEqual(50);
  });

  it('should break on infinite loop by timeout', () => {
    let runContext = compileAndStartModule(
      `
      while True:
        print("test")
    `,
      [],
      { maximumSingleRunTimeout: 100 },
    );
    let startTime = new Date().valueOf();
    runContext.run();
    expect(new Date().valueOf() - startTime < 1000);
    runContext = compileAndStartModule(
      `
      while True:
        print("test")
    `,
      [],
      { maximumSingleRunTimeout: 100 },
    );
    startTime = new Date().valueOf();
    runContext.debug();
    expect(new Date().valueOf() - startTime < 1000);
  });
});
