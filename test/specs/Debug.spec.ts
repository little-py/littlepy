import { compileAndStartModule, compileModule } from './Utils';
import { RunContext } from '../../src/machine/RunContext';
import { NumberObject } from '../../src/machine/objects/NumberObject';
import { PyScope } from '../../src/api/Scope';
import { PyObject } from '../../src/api/Object';
import { ExceptionObject } from '../../src/machine/objects/ExceptionObject';
import { ExceptionType } from '../../src/api/ExceptionType';

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
    let scope: PyScope = runContext.getGlobalScope();
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
    runContext.debugContinue();
    expect(runContext.getUnhandledException()).toBeUndefined();
    position = runContext.getPosition();
    expect(position.row).toEqual(1);
    runContext.debugOver();
    expect(runContext.isFinished()).toBeTruthy();
  });

  it('should stop on breakpoint on first line', () => {
    const runContext = compileAndStartModule(
      `
      a = 10
      b = 20
    `,
      [
        {
          row: 0,
          moduleId: '',
        },
      ],
    );
    let position = runContext.getPosition();
    expect(position.row).toEqual(0);
    runContext.debug();
    expect(runContext.getUnhandledException()).toBeUndefined();
    position = runContext.getPosition();
    expect(position && position.row).toEqual(0);
    runContext.debugOver();
    expect(runContext.isFinished()).toBeFalsy();
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
    expect(runContext.getPosition()).toBeUndefined();
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
    expect(entries.map((e) => e.instruction)).toEqual([0, 5]);
  });

  it('should call exit function on unhandled exception', (done) => {
    const source = 'arg1.arg2 = 10';
    const code = compileModule(source, 'main');
    const runContext = new RunContext({
      main: code,
    });
    runContext.startCallModule('main', (returnValue: PyObject, error: ExceptionObject) => {
      expect(runContext.isFinished()).toBeTruthy();
      expect(error.exceptionType).toEqual(ExceptionType.UnknownIdentifier);
      expect(error.params).toEqual(['arg1']);
      done();
    });
    runContext.run();
    expect(runContext.isFinished()).toBeTruthy();
  });

  it('should allow debugging empty source code', () => {
    const runContext = compileAndStartModule('');
    runContext.debug();
    expect(runContext.getPosition()).toBeUndefined();
  });

  it('should report correct positions', () => {
    const source = `
      a = 10
      if a == 10:
        print('3')
      if a == 20:
        print('4')
      else:
        b = 20
        print('5')
      def func():
        print('i1')
        print('i2')
      print('1')
      func()
      print('2')
      for x in range(1,5)
        print(x)
        if x == 3:
          break
      print('3')
    `;
    const runContext = compileAndStartModule(source);
    runContext.debugIn();
    while (!runContext.isFinished()) {
      expect(runContext.getCurrentLocation()).toBeDefined();
      runContext.debugIn();
    }
    expect(runContext.getCurrentLocation()).toBeUndefined();
  });
});
