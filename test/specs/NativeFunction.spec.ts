import { CallableIgnore, MemberWithMetadata, NativeFinishCallback, RunContextBase } from '../../src/machine/NativeTypes';
import { StringObject } from '../../src/machine/objects/StringObject';
import { CallableContext } from '../../src/machine/CallableContext';
import { RunContext } from '../../src/machine/RunContext';
import { ExceptionObject } from '../../src/machine/objects/ExceptionObject';
import { ExceptionType } from '../../src/api/ExceptionType';
import { BooleanObject } from '../../src/machine/objects/BooleanObject';
import { ListObject } from '../../src/machine/objects/ListObject';
import { DictionaryObject } from '../../src/machine/objects/DictionaryObject';
import { TupleObject } from '../../src/machine/objects/TupleObject';
import { FrozenSetObject } from '../../src/machine/objects/FrozenSetObject';
import { NoneObject } from '../../src/machine/objects/NoneObject';
import { IterableObject } from '../../src/machine/objects/IterableObject';
import { nativeWrapper } from '../../src/machine/embedded/NativeWrapper';
import { PyObject } from '../../src/api/Object';
import { NumberObject } from '../../src/machine/objects/NumberObject';
import { pyFunction, pyParam, pyParamArgs, pyParamCallback, pyParamKwargs } from '../../src/api/Decorators';

function createCallContext({
  indexed,
  named,
  onFinish,
}: {
  indexed?: PyObject[];
  named?: { [key: string]: PyObject };
  onFinish?: (ret: PyObject, exception: ExceptionObject) => boolean | void | undefined;
}): CallableContext {
  return {
    setIndexedArg: () => {},
    setNamedArg: () => {},
    onFinish,
    indexedArgs: (indexed || []).map(object => ({
      object,
      expand: false,
    })),
    namedArgs: named || {},
  };
}

function createRunContext(runContext: Partial<RunContext>): RunContext {
  return runContext as RunContext;
}

describe('Native function', () => {
  let callNumber = 0;
  let callString: string | undefined;
  let callBool: boolean | undefined;
  let callFrozenSet: FrozenSetObject;
  let argsArgument: PyObject[];
  let kwargsArgument: { [key: string]: PyObject };
  let callableContext: CallableContext;
  let runContext: RunContext;

  class NativeTest {
    @pyFunction
    public testWithInteger(@pyParam('param1', NumberObject) param1: number): number {
      callNumber = param1;
      return 1;
    }

    @pyFunction
    public testWithString(@pyParam('param1', StringObject) param1: string) {
      callString = param1;
      return true;
    }

    @pyFunction
    public testWithBoolean(@pyParam('param1', BooleanObject) param1: boolean) {
      callBool = param1;
      return false;
    }

    @pyFunction
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public testWithList(@pyParam('param1', ListObject) param1: ListObject) {
      return new CallableIgnore();
    }

    @pyFunction
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public testWithDictionary(@pyParam('dictionaryParam', DictionaryObject) param1: TupleObject) {
      return new CallableIgnore();
    }

    @pyFunction
    public testWithSome(@pyParam('someParam', FrozenSetObject) param1: FrozenSetObject) {
      callFrozenSet = param1;
    }

    @pyFunction
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public testWithTuple(@pyParam('tupleParam', TupleObject) param1: TupleObject) {
      return new CallableIgnore();
    }

    @pyFunction
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public testWithIterable(@pyParam('iterable', IterableObject) param1: IterableObject) {
      return new CallableIgnore();
    }

    @pyFunction
    public testWithCallback(@pyParam('param1', NumberObject) param1: number, @pyParamCallback callback: NativeFinishCallback) {
      callback(new StringObject('abc'), null);
    }

    @pyFunction
    public testWithArgs(@pyParamArgs param1: PyObject[]) {
      argsArgument = param1;
      return new CallableIgnore();
    }

    @pyFunction
    public testWithKwargs(@pyParamKwargs param1: { [key: string]: PyObject }) {
      kwargsArgument = param1;
      return new CallableIgnore();
    }

    @pyFunction
    public testWithDefault(@pyParam('param2', NumberObject, 20) param1: number) {
      callNumber = param1;
      return new CallableIgnore();
    }

    @pyFunction
    public testWithCallableContext(@pyParam('context', CallableContext) ctx: CallableContext) {
      callableContext = ctx;
      return new CallableIgnore();
    }

    @pyFunction
    public testWithRunContext(@pyParam('context', RunContextBase) ctx: RunContext) {
      runContext = ctx;
      return new CallableIgnore();
    }

    @pyFunction
    public testReturnSome() {
      return new TupleObject([]);
    }

    @pyFunction
    public testReturnUnknown() {
      return {};
    }

    @pyFunction
    public testThrowError() {
      throw Error();
    }
  }

  beforeEach(() => {
    callNumber = 0;
    callString = undefined;
    callBool = undefined;
    callFrozenSet = undefined;
    argsArgument = undefined;
    callableContext = undefined;
    kwargsArgument = undefined;
    runContext = undefined;
  });

  it('should use number argument', () => {
    const test = new NativeTest();
    const method = (test.testWithInteger as unknown) as MemberWithMetadata;
    const ret = nativeWrapper(test, method)(createCallContext({ indexed: [new NumberObject(10)] }), null);
    expect(ret instanceof NumberObject && ret.value).toEqual(1);
    expect(callNumber).toEqual(10);
  });

  it('should use string argument', () => {
    const test = new NativeTest();
    const method = (test.testWithString as unknown) as MemberWithMetadata;
    const ret = nativeWrapper(test, method)(createCallContext({ indexed: [new StringObject('xyz')] }), null);
    expect(callString).toEqual('xyz');
    expect(ret instanceof BooleanObject && ret.value).toEqual(1);
  });

  it('should use bool argument', () => {
    const test = new NativeTest();
    const method = (test.testWithBoolean as unknown) as MemberWithMetadata;
    const ret = nativeWrapper(test, method)(createCallContext({ indexed: [new BooleanObject(true)] }), null);
    expect(callBool).toEqual(true);
    expect(ret instanceof BooleanObject && ret.value).toEqual(0);
  });

  it('should throw exception on non-bool argument', () => {
    const test = new NativeTest();
    const method = (test.testWithBoolean as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    nativeWrapper(test, method)(
      createCallContext({ indexed: [new DictionaryObject()] }),
      createRunContext({
        raiseException(exception) {
          raisedException = exception;
        },
      }),
    );
    expect(raisedException.exceptionType).toEqual(ExceptionType.TypeError);
  });

  it('should use any other argument', () => {
    const test = new NativeTest();
    const method = (test.testWithSome as unknown) as MemberWithMetadata;
    const ret = nativeWrapper(test, method)(
      createCallContext({ indexed: [new FrozenSetObject()] }),
      createRunContext({ getNoneObject: () => new NoneObject() }),
    );
    expect(callFrozenSet).toBeTruthy();
    expect(ret instanceof NoneObject).toBeTruthy();
  });

  it('should throw exception on missing argument', () => {
    const test = new NativeTest();
    const method = (test.testWithInteger as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    nativeWrapper(test, method)(
      createCallContext({}),
      createRunContext({
        raiseException: exception => {
          raisedException = exception;
        },
      }),
    );
    expect(raisedException).toBeTruthy();
    expect(raisedException.exceptionType).toEqual(ExceptionType.FunctionArgumentError);
  });

  it('should throw exception on too much arguments', () => {
    const test = new NativeTest();
    const method = (test.testWithInteger as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    nativeWrapper(test, method)(
      createCallContext({
        indexed: [new NumberObject(10), new NumberObject(20)],
      }),
      createRunContext({
        raiseException: exception => {
          raisedException = exception;
        },
      }),
    );
    expect(raisedException).toBeTruthy();
    expect(raisedException.exceptionType).toEqual(ExceptionType.FunctionArgumentCountMismatch);
  });

  it('should provide callback', () => {
    const test = new NativeTest();
    const method = (test.testWithCallback as unknown) as MemberWithMetadata;
    let returnValue: PyObject;
    nativeWrapper(test, method)(
      createCallContext({
        onFinish: ret => {
          returnValue = ret;
        },
        indexed: [new NumberObject(10)],
      }),
      null,
    );
    expect(returnValue instanceof StringObject && returnValue.value).toEqual('abc');
  });

  it('should give args', () => {
    const test = new NativeTest();
    const method = (test.testWithArgs as unknown) as MemberWithMetadata;
    nativeWrapper(test, method)(
      createCallContext({
        indexed: [new NumberObject(10)],
      }),
      null,
    );
    expect(argsArgument).toHaveLength(1);
  });

  it('should give kwargs', () => {
    const test = new NativeTest();
    const method = (test.testWithKwargs as unknown) as MemberWithMetadata;
    nativeWrapper(test, method)(
      createCallContext({
        named: {
          test1: new NumberObject(100),
        },
      }),
      null,
    );
    expect(kwargsArgument).toBeTruthy();
    expect(NumberObject.toNumber(kwargsArgument['test1'], 'test1')).toEqual(100);
  });

  it('should give default value', () => {
    const test = new NativeTest();
    const method = (test.testWithDefault as unknown) as MemberWithMetadata;
    nativeWrapper(test, method)(createCallContext({}), null);
    expect(callNumber).toEqual(20);
  });

  it('should take value from named', () => {
    const test = new NativeTest();
    const method = (test.testWithDefault as unknown) as MemberWithMetadata;
    nativeWrapper(test, method)(
      createCallContext({
        named: {
          param2: new NumberObject(15),
        },
      }),
      null,
    );
    expect(callNumber).toEqual(15);
  });

  it('should give callable context', () => {
    const test = new NativeTest();
    const method = (test.testWithCallableContext as unknown) as MemberWithMetadata;
    nativeWrapper(test, method)(
      createCallContext({
        indexed: [new NumberObject(10), new NumberObject(10)],
      }),
      null,
    );
    expect(callableContext).toBeTruthy();
    expect(callableContext.indexedArgs).toHaveLength(2);
  });

  it('should give run context', () => {
    const test = new NativeTest();
    const method = (test.testWithRunContext as unknown) as MemberWithMetadata;
    nativeWrapper(test, method)(
      createCallContext({}),
      createRunContext({
        onLeaveFunction: () => {},
      }),
    );
    expect(runContext).toBeTruthy();
    expect(runContext.onLeaveFunction).toBeTruthy();
  });

  it('should throw exception on non-list argument', () => {
    const test = new NativeTest();
    const method = (test.testWithList as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    nativeWrapper(test, method)(
      createCallContext({
        indexed: [new StringObject('xyz')],
      }),
      createRunContext({
        raiseException: exception => {
          raisedException = exception;
        },
      }),
    );
    expect(raisedException.exceptionType).toEqual(ExceptionType.TypeError);
  });

  it('should throw exception on non-dictionary argument', () => {
    const test = new NativeTest();
    const method = (test.testWithDictionary as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    nativeWrapper(test, method)(
      createCallContext({
        indexed: [new StringObject('xyz')],
      }),
      createRunContext({
        raiseException: exception => {
          raisedException = exception;
        },
      }),
    );
    expect(raisedException.exceptionType).toEqual(ExceptionType.TypeError);
  });

  it('should throw exception on non-tuple argument', () => {
    const test = new NativeTest();
    const method = (test.testWithTuple as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    nativeWrapper(test, method)(
      createCallContext({
        indexed: [new StringObject('xyz')],
      }),
      createRunContext({
        raiseException: exception => {
          raisedException = exception;
        },
      }),
    );
    expect(raisedException.exceptionType).toEqual(ExceptionType.TypeError);
    expect(raisedException.params).toEqual(['tupleParam']);
  });

  it('should throw exception on non-iterable argument', () => {
    const test = new NativeTest();
    const method = (test.testWithIterable as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    nativeWrapper(test, method)(
      createCallContext({
        indexed: [new NumberObject(20)],
      }),
      createRunContext({
        raiseException: exception => {
          raisedException = exception;
        },
      }),
    );
    expect(raisedException.exceptionType).toEqual(ExceptionType.TypeError);
    expect(raisedException.params).toEqual(['iterable']);
  });

  it('should return any other argument', () => {
    const test = new NativeTest();
    const method = (test.testReturnSome as unknown) as MemberWithMetadata;
    const ret = nativeWrapper(test, method)(createCallContext({}), null);
    expect(ret instanceof TupleObject).toBeTruthy();
  });

  it('should throw exception on unknown return type', () => {
    const test = new NativeTest();
    const method = (test.testReturnUnknown as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    nativeWrapper(test, method)(
      createCallContext({}),
      createRunContext({
        raiseException: exception => {
          raisedException = exception;
        },
      }),
    );
    expect(raisedException.exceptionType).toEqual(ExceptionType.TypeError);
  });

  it('should throw exception on unknown return type', () => {
    const test = new NativeTest();
    const method = (test.testThrowError as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    nativeWrapper(test, method)(
      createCallContext({}),
      createRunContext({
        raiseException: exception => {
          raisedException = exception;
        },
      }),
    );
    expect(raisedException.exceptionType).toEqual(ExceptionType.SystemError);
  });
});