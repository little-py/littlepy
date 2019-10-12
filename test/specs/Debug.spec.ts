import { compileAndStartModule, compileModule } from './Utils';
import { RunContext } from '../../src/machine/RunContext';
import { NumberObject } from '../../src/machine/objects/NumberObject';

describe('Debug flow', () => {
  it('should step from first to second line and initialize two variables', () => {
    const runContext = compileAndStartModule(`
      a = 10
      b = 20
    `);
    let position = runContext.getPosition();
    expect(position.row).toEqual(0);
    runContext.debugOver();
    position = runContext.getPosition();
    expect(position.row).toEqual(1);
    expect(position === runContext.getPosition());
    let scope = runContext.getGlobalScope();
    expect(scope.getObject('a')).toBeUndefined();
    scope = runContext.getCurrentFunctionStack().scope;
    expect(scope.getObject('a')).toBeDefined();
    expect(scope.getObject('b')).toBeUndefined();
    runContext.debugOver();
    expect(scope.getObject('b')).toBeDefined();
  });

  it('should stop on breakpoint', () => {
    const runContext = compileAndStartModule(
      `
      a = 10
      b = 20
    `,
      [
        {
          row: 1,
          moduleId: '',
        },
      ],
    );
    let position = runContext.getPosition();
    expect(position.row).toEqual(0);
    runContext.debug();
    expect(runContext.getUnhandledException()).toBeUndefined();
    position = runContext.getPosition();
    expect(position.row).toEqual(1);
    runContext.debugOver();
    expect(runContext.isFinished()).toBeTruthy();
  });

  it('should stop on call to stop', () => {
    const runContext = compileAndStartModule(
      `
      a = 10
      b = 20
    `,
    );
    let position = runContext.getPosition();
    expect(position.row).toEqual(0);
    runContext.debugOver();
    position = runContext.getPosition();
    expect(position.row).toEqual(1);
    expect(runContext.isFinished()).toBeFalsy();
    runContext.stop();
    expect(runContext.isFinished()).toBeTruthy();
  });

  it('should step in and out', () => {
    const source = `
      def func():
        print('i1')
        print('i2')
      print('1')
      func()
      print('2');
    `;
    let runContext = compileAndStartModule(source);
    expect(runContext.getPosition().row).toEqual(0);
    expect(runContext.getUnhandledException()).toBeUndefined();
    runContext.debugOver();
    expect(runContext.getPosition().row).toEqual(3);
    runContext.debugOver();
    expect(runContext.getPosition().row).toEqual(4);
    runContext.debugOver();
    expect(runContext.getPosition().row).toEqual(5);
    expect(runContext.getOutputText()).toEqual('1\ni1\ni2');
    runContext = compileAndStartModule(source);
    runContext.debugOver();
    runContext.debugOver();
    expect(runContext.getPosition().row).toEqual(4);
    runContext.debugIn();
    expect(runContext.getPosition().row).toEqual(1);
    runContext.debugIn();
    expect(runContext.getPosition().row).toEqual(2);
    runContext.debugIn();
    expect(runContext.getPosition().row).toEqual(5);
    runContext = compileAndStartModule(source);
    runContext.debugOver();
    runContext.debugOver();
    runContext.debugIn();
    expect(runContext.getPosition().row).toEqual(1);
    runContext.debugOut();
    expect(runContext.getPosition().row).toEqual(5);
    runContext.debugOut();
    expect(runContext.isFinished()).toBeTruthy();
  });

  it('should block entering callModule twice', () => {
    const runContext = compileAndStartModule(`
      a = 10
    `);
    let errorThrown = false;
    try {
      runContext.startCallModule('abc');
    } catch (error) {
      errorThrown = true;
    }
    expect(errorThrown).toBeTruthy();
  });

  it('should generate exception for unknown module', () => {
    const code = compileModule('a = 10', 'first');
    const runContext = new RunContext({
      first: code,
    });
    runContext.startCallModule('second');
    expect(runContext.getUnhandledException()).toBeDefined();
  });

  it('should call function from module', () => {
    const source = `
      print('start')
      def funcToCall(arg):
        print(arg)
      print('end')
    `;
    const code = compileModule(source, 'main');
    let runContext = new RunContext({
      main: code,
    });
    runContext.startCallModule('main');
    runContext.run();
    runContext.startCallFunction('main', 'funcToCall', [new NumberObject(100)]);
    expect(runContext.getUnhandledException()).toBeUndefined();
    expect(runContext.getPosition().row).toEqual(2);
    let errorThrown = false;
    try {
      runContext.startCallFunction('main', 'funcToCall');
    } catch (err) {
      errorThrown = true;
    }
    expect(errorThrown).toBeTruthy();
    runContext.stop();
    runContext.startCallFunction('other', 'some');
    expect(runContext.getUnhandledException()).toBeDefined();
    runContext = new RunContext({
      main: code,
    });
    runContext.startCallModule('main');
    runContext.run();
    expect(runContext.getUnhandledException()).toBeUndefined();
    runContext.startCallFunction('main', 'badFunction');
    expect(runContext.getUnhandledException()).toBeDefined();
  });

  it('should show stack trace', () => {
    const source = `
      def func():
        print('i1')
        print('i2')
      func()
    `;
    const runContext = compileAndStartModule(source);
    runContext.debugIn();
    runContext.debugIn();
    expect(runContext.getPosition().row).toEqual(1);
    const entries = runContext.getStackEntries();
    expect(entries).toHaveLength(2);
    expect(entries.map(e => e.instruction)).toEqual([0, 5]);
  });
});
