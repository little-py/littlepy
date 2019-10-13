import { compileAndStartModule, compileModule, runModules } from './Utils';
import { RunContext } from '../../src/machine/RunContext';
import { ExceptionObject } from '../../src/machine/objects/ExceptionObject';
import { ModuleObject } from '../../src/machine/objects/ModuleObject';
import { PyObject } from '../../src/api/Object';
import { getObjectUtils } from '../../src/api/ObjectUtils';
import { StringObject } from '../../src/machine/objects/StringObject';
import { NumberObject } from '../../src/machine/objects/NumberObject';

describe('Customize runContext', () => {
  it('should write to callback instead of internal buffer', () => {
    const accumulated: string[] = [];
    const runContext = compileAndStartModule(`
      print('test1')
      print("test2")
    `);
    runContext.onWriteLine = line => accumulated.push(line);
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

    const unwrapped = getObjectUtils().fromPyObject(wrapped, true);
    expect(unwrapped.z.b).toEqual(20);
    expect(getObjectUtils().fromPyObject(x, true)).toEqual(10);
    expect(getObjectUtils().fromPyObject(y, true)).toEqual('test');
  });
});
