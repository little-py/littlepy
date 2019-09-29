import { compileAndStartModule, compileModule, runModules } from './Utils';
import { RunContext } from '../../../src/machine/RunContext';
import { BaseObject, ObjectType } from '../../../src/machine/objects/BaseObject';
import { ExceptionObject } from '../../../src/machine/objects/ExceptionObject';

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
    runContext.startCallModule('main', (returnValue: BaseObject, unhandledException: ExceptionObject) => {
      finishCalled = true;
      expect(unhandledException).toBeUndefined();
      expect(returnValue.type).toEqual(ObjectType.Module);
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
      true,
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
});
