import { CallableIgnore, MemberWithMetadata, NativeFinishCallback } from '../../src/machine/NativeTypes';
import { StringObject } from '../../src/machine/objects/StringObject';
import { CallContext } from '../../src/api/CallContext';
import { RunContext } from '../../src/machine/RunContext';
import { ExceptionObject } from '../../src/machine/objects/ExceptionObject';
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
import { pyFunction, pyGetter, pyParam, pyParamArgs, pyParamCallback, pyParamKwargs, pySetter } from '../../src/api/Decorators';
import { getObjectUtils, setObjectUtils } from '../../src/api/ObjectUtils';
import { objectUtils } from '../../src/machine/ObjectUtilsImpl';
import { PropertyType } from '../../src/api/Native';
import { UniqueErrorCode } from '../../src/api/UniqueErrorCode';

setObjectUtils(objectUtils);

function createCallContext({
  indexed,
  named,
  onFinish,
}: {
  indexed?: PyObject[];
  named?: { [key: string]: PyObject };
  onFinish?: (ret: PyObject, exception: ExceptionObject) => boolean | void | undefined;
}): CallContext {
  return {
    onFinish,
    indexedArgs: (indexed || []).map((object) => ({
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
  let callableContext: CallContext;
  let runContext: RunContext;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let stringProperty: any = '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let numberProperty: any = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let objectProperty: any;

  class NativeTest extends PyObject {
    @pyFunction
    public testWithInteger(@pyParam('param1', PropertyType.Number) param1: number): number {
      callNumber = param1;
      return 1;
    }

    @pyFunction
    public testWithString(@pyParam('param1', PropertyType.String) param1: string) {
      callString = param1;
      return true;
    }

    @pyFunction
    public testWithBoolean(@pyParam('param1', PropertyType.Boolean) param1: boolean) {
      callBool = param1;
      return false;
    }

    @pyFunction
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public testWithList(@pyParam('param1', PropertyType.List) param1: ListObject) {
      return new CallableIgnore();
    }

    @pyFunction
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public testWithDictionary(@pyParam('dictionaryParam', PropertyType.Dictionary) param1: TupleObject) {
      return new CallableIgnore();
    }

    @pyFunction
    public testWithSome(@pyParam('someParam') param1: FrozenSetObject) {
      callFrozenSet = param1;
    }

    @pyFunction
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public testWithTuple(@pyParam('tupleParam', PropertyType.Tuple) param1: TupleObject) {
      return new CallableIgnore();
    }

    @pyFunction
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public testWithIterable(@pyParam('iterable', PropertyType.Iterable) param1: IterableObject) {
      return new CallableIgnore();
    }

    @pyFunction
    public testWithCallback(@pyParam('param1', PropertyType.Number) param1: number, @pyParamCallback callback: NativeFinishCallback) {
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
    public testWithDefault(@pyParam('param2', PropertyType.Number, 20) param1: number) {
      callNumber = param1;
      return new CallableIgnore();
    }

    @pyFunction
    public testWithCallableContext(@pyParam('context', PropertyType.CallContext) ctx: CallContext) {
      callableContext = ctx;
      return new CallableIgnore();
    }

    @pyFunction
    public testWithRunContext(@pyParam('context', PropertyType.Machine) ctx: RunContext) {
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public visibleInstance: any;

    @pyGetter()
    public getVisible() {
      return this.visibleInstance;
    }

    @pySetter(PropertyType.Boolean)
    public setVisible(newValue: boolean) {
      this.visibleInstance = newValue;
    }

    @pyGetter()
    public getString() {
      return stringProperty;
    }

    @pySetter(PropertyType.String)
    public setString(newValue: string) {
      stringProperty = newValue;
    }

    @pyGetter()
    public getNumber() {
      return numberProperty;
    }

    @pySetter(PropertyType.Number)
    public setNumber(newValue: number) {
      numberProperty = newValue;
    }

    @pyGetter()
    public getObject() {
      return objectProperty;
    }

    @pySetter(PropertyType.Object)
    public setObject(newValue: PyObject) {
      objectProperty = newValue;
    }

    @pyGetter('overrideName')
    public someGetter() {
      return 10;
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
    stringProperty = '';
    numberProperty = 0;
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
    expect(raisedException.uniqueError).toEqual(UniqueErrorCode.ExpectedBooleanObject);
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
        raiseException: (exception) => {
          raisedException = exception;
        },
      }),
    );
    expect(raisedException).toBeTruthy();
    expect(raisedException.uniqueError).toEqual(UniqueErrorCode.RequiredArgumentIsMissing);
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
        raiseException: (exception) => {
          raisedException = exception;
        },
      }),
    );
    expect(raisedException).toBeTruthy();
    expect(raisedException.uniqueError).toEqual(UniqueErrorCode.FunctionTooManyArguments);
  });

  it('should provide callback', () => {
    const test = new NativeTest();
    const method = (test.testWithCallback as unknown) as MemberWithMetadata;
    let returnValue: PyObject;
    nativeWrapper(test, method)(
      createCallContext({
        onFinish: (ret) => {
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
    expect(getObjectUtils().toNumber(kwargsArgument['test1'], 'test1')).toEqual(100);
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
        raiseException: (exception) => {
          raisedException = exception;
        },
      }),
    );
    expect(raisedException.uniqueError).toEqual(UniqueErrorCode.ExpectedListObject);
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
        raiseException: (exception) => {
          raisedException = exception;
        },
      }),
    );
    expect(raisedException.uniqueError).toEqual(UniqueErrorCode.ExpectedDictionaryObject);
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
        raiseException: (exception) => {
          raisedException = exception;
        },
      }),
    );
    expect(raisedException.uniqueError).toEqual(UniqueErrorCode.ExpectedTupleObject);
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
        raiseException: (exception) => {
          raisedException = exception;
        },
      }),
    );
    expect(raisedException.uniqueError).toEqual(UniqueErrorCode.ExpectedIterableObject);
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
        raiseException: (exception) => {
          raisedException = exception;
        },
      }),
    );
    expect(raisedException.uniqueError).toEqual(UniqueErrorCode.ExpectedPythonObject);
  });

  it('should throw exception on unknown return type', () => {
    const test = new NativeTest();
    const method = (test.testThrowError as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    nativeWrapper(test, method)(
      createCallContext({}),
      createRunContext({
        raiseException: (exception) => {
          raisedException = exception;
        },
      }),
    );
    expect(raisedException.uniqueError).toEqual(UniqueErrorCode.UnexpectedJsException);
  });

  it('should update properties', () => {
    const test = new NativeTest();
    test.visibleInstance = false;
    let value = test.getAttribute('visible');
    expect(value instanceof BooleanObject && value.value).toBeFalsy();
    test.setAttribute('visible', new BooleanObject(true));
    value = test.getAttribute('visible');
    expect(value instanceof BooleanObject && value.value).toBeTruthy();
    stringProperty = 'test1';
    value = test.getAttribute('string');
    expect(value instanceof StringObject && value.value).toEqual('test1');
    test.setAttribute('string', new StringObject('test2'));
    expect(stringProperty).toEqual('test2');
    numberProperty = 10;
    value = test.getAttribute('number');
    expect(value instanceof NumberObject && value.value).toEqual(10);
    test.setAttribute('number', new NumberObject(30));
    expect(numberProperty).toEqual(30);
  });

  it('should throw exception on non-boolean value', () => {
    try {
      const test = new NativeTest();
      test.setAttribute('visible', new StringObject('a'));
      fail();
    } catch (e) {
      expect(e instanceof ExceptionObject && e.uniqueError).toEqual(UniqueErrorCode.ExpectedBooleanObject);
    }
  });

  it('should throw exception on non-string value', () => {
    try {
      const test = new NativeTest();
      test.setAttribute('string', new BooleanObject(true));
      fail();
    } catch (e) {
      expect(e instanceof ExceptionObject && e.uniqueError).toEqual(UniqueErrorCode.ExpectedStringObject);
    }
  });

  it('should throw exception on non-number value', () => {
    try {
      const test = new NativeTest();
      test.setAttribute('number', new StringObject('a'));
      fail();
    } catch (e) {
      expect(e instanceof ExceptionObject && e.uniqueError).toEqual(UniqueErrorCode.ExpectedNumberObject);
    }
  });

  it('should return correct object on toPyObject() call', () => {
    let value = getObjectUtils().toPyObject(false, false);
    expect(value instanceof BooleanObject && value.value).toBeFalsy();
    value = getObjectUtils().toPyObject(10, false);
  });

  it('should throw exception in case of getter returns non-boolean value', () => {
    const test = new NativeTest();
    test.visibleInstance = 'abc';
    try {
      test.getAttribute('visible');
    } catch (e) {
      expect(e instanceof ExceptionObject && e.uniqueError).toEqual(UniqueErrorCode.CannotConvertJsToBoolean);
    }
  });

  it('should throw exception in case of getter returns non-number value', () => {
    const test = new NativeTest();
    numberProperty = 'x';
    try {
      test.getAttribute('number');
    } catch (e) {
      expect(e instanceof ExceptionObject && e.uniqueError).toEqual(UniqueErrorCode.CannotConvertJsToNumber);
    }
  });

  it('should throw exception in case of getter returns non-string value', () => {
    const test = new NativeTest();
    stringProperty = 10;
    try {
      test.getAttribute('string');
    } catch (e) {
      expect(e instanceof ExceptionObject && e.uniqueError).toEqual(UniqueErrorCode.CannotConvertJsToString);
    }
  });

  it('should throw exception in case of getter returns non-string value', () => {
    const test = new NativeTest();
    objectProperty = 10;
    try {
      test.getAttribute('object');
    } catch (e) {
      expect(e instanceof ExceptionObject && e.uniqueError).toEqual(UniqueErrorCode.CannotConvertJsToObject);
    }
  });

  it('should throw exception in case of getter is ill-formed', () => {
    try {
      class BadNativeTest extends PyObject {
        @pyGetter()
        public setBadGetter() {
          return 10;
        }
      }
      new BadNativeTest();
      fail('Unreachable code');
    } catch (e) {}
  });
});
