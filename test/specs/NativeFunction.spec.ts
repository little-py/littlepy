import { IntegerObject } from '../../src/machine/objects/IntegerObject';
import { RealObject } from '../../src/machine/objects/RealObject';
import {
  CallableIgnore,
  MemberWithMetadata,
  NativeFinishCallback,
  nativeFunction,
  param,
  paramArgs,
  paramCallback,
  paramKwargs,
  RunContextBase,
} from '../../src/machine/NativeTypes';
import { StringObject } from '../../src/machine/objects/StringObject';
import { BaseObject } from '../../src/machine/objects/BaseObject';
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
import { setNativeWrapper } from '../../src/machine/embedded/NativeFunction';
import { nativeWrapper } from '../../src/machine/embedded/NativeWrapper';
import {IterableObject} from "../../src/machine/objects/IterableObject";

setNativeWrapper(nativeWrapper);

describe('Native function', () => {
  let callNumber = 0;
  let callString: string | undefined;
  let callBool: boolean | undefined;
  let callFrozenSet: FrozenSetObject;
  let argsArgument: BaseObject[];
  let kwargsArgument: { [key: string]: BaseObject };
  let callableContext: CallableContext;
  let runContext: RunContext;

  class NativeTest {
    @nativeFunction
    public testWithInteger(@param('param1', IntegerObject) param1: number): number {
      callNumber = param1;
      return 1;
    }

    @nativeFunction
    public testWithReal(@param('param1', RealObject) param1: number) {
      callNumber = param1;
      return 'test';
    }

    @nativeFunction
    public testWithString(@param('param1', StringObject) param1: string) {
      callString = param1;
      return true;
    }

    @nativeFunction
    public testWithBoolean(@param('param1', BooleanObject) param1: boolean) {
      callBool = param1;
      return false;
    }

    @nativeFunction
    public testWithList(@param('param1', ListObject) param1: ListObject) {
      return new CallableIgnore();
    }

    @nativeFunction
    public testWithDictionary(@param('dictionaryParam', DictionaryObject) param1: TupleObject) {
      return new CallableIgnore();
    }

    @nativeFunction
    public testWithSome(@param('someParam', FrozenSetObject) param1: FrozenSetObject) {
      callFrozenSet = param1;
    }

    @nativeFunction
    public testWithTuple(@param('tupleParam', TupleObject) param1: TupleObject) {
      return new CallableIgnore();
    }

    @nativeFunction
    public testWithIterable(@param('iterable', IterableObject) param1: IterableObject) {
      return new CallableIgnore();
    }

    @nativeFunction
    public testWithCallback(@param('param1', IntegerObject) param1: number, @paramCallback callback: NativeFinishCallback) {
      callback(new StringObject('abc'), null);
    }

    @nativeFunction
    public testWithArgs(@paramArgs param1: BaseObject[]) {
      argsArgument = param1;
      return new CallableIgnore();
    }

    @nativeFunction
    public testWithKwargs(@paramKwargs param1: { [key: string]: BaseObject }) {
      kwargsArgument = param1;
      return new CallableIgnore();
    }

    @nativeFunction
    public testWithDefault(@param('param2', IntegerObject, 20) param1: number) {
      callNumber = param1;
      return new CallableIgnore();
    }

    @nativeFunction
    public testWithCallableContext(@param('context', CallableContext) ctx: CallableContext) {
      callableContext = ctx;
      return new CallableIgnore();
    }

    @nativeFunction
    public testWithRunContext(@param('context', RunContextBase) ctx: RunContext) {
      runContext = ctx;
      return new CallableIgnore();
    }

    @nativeFunction
    public testReturnSome() {
      return new TupleObject([]);
    }

    @nativeFunction
    public testReturnUnknown() {
      return {};
    }

    @nativeFunction
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

  it('should use integer argument', () => {
    const test = new NativeTest();
    const method = (test.testWithInteger as unknown) as MemberWithMetadata;
    const ret = method.pythonWrapper()(
      {
        indexedArgs: [
          {
            object: new IntegerObject(10),
          },
        ],
      },
      null,
    );
    expect(ret instanceof RealObject && ret.value).toEqual(1);
    expect(callNumber).toEqual(10);
  });

  it('should use real argument', () => {
    const test = new NativeTest();
    const method = (test.testWithReal as unknown) as MemberWithMetadata;
    const ret = method.pythonWrapper()(
      {
        indexedArgs: [
          {
            object: new IntegerObject(20),
          },
        ],
      },
      null,
    );
    expect(ret instanceof StringObject && ret.value).toEqual('test');
    expect(callNumber).toEqual(20);
  });

  it('should use string argument', () => {
    const test = new NativeTest();
    const method = (test.testWithString as unknown) as MemberWithMetadata;
    const ret = method.pythonWrapper()(
      {
        indexedArgs: [
          {
            object: new StringObject('xyz'),
          },
        ],
      },
      null,
    );
    expect(callString).toEqual('xyz');
    expect(ret instanceof BooleanObject && ret.value).toEqual(1);
  });

  it('should use bool argument', () => {
    const test = new NativeTest();
    const method = (test.testWithBoolean as unknown) as MemberWithMetadata;
    const ret = method.pythonWrapper()(
      {
        indexedArgs: [
          {
            object: new BooleanObject(true),
          },
        ],
      },
      null,
    );
    expect(callBool).toEqual(true);
    expect(ret instanceof BooleanObject && ret.value).toEqual(0);
  });

  it('should throw exception on non-bool argument', () => {
    const test = new NativeTest();
    const method = (test.testWithBoolean as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    method.pythonWrapper()(
      {
        indexedArgs: [
          {
            object: new DictionaryObject(),
          },
        ],
      },
      {
        raiseException: exception => {
          raisedException = exception;
        },
      },
    );
    expect(raisedException.exceptionType).toEqual(ExceptionType.TypeError);
  });

  it('should use any other argument', () => {
    const test = new NativeTest();
    const method = (test.testWithSome as unknown) as MemberWithMetadata;
    const ret = method.pythonWrapper()(
      {
        indexedArgs: [
          {
            object: new FrozenSetObject(),
          },
        ],
      },
      {
        getNoneObject: () => new NoneObject(),
      },
    );
    expect(callFrozenSet).toBeTruthy();
    expect(ret instanceof NoneObject).toBeTruthy();
  });

  it('should throw exception on missing argument', () => {
    const test = new NativeTest();
    const method = (test.testWithInteger as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    method.pythonWrapper()(
      {
        indexedArgs: [],
        namedArgs: {},
      },
      {
        raiseException: exception => {
          raisedException = exception;
        },
      },
    );
    expect(raisedException).toBeTruthy();
    expect(raisedException.exceptionType).toEqual(ExceptionType.FunctionArgumentError);
  });

  it('should throw exception on too much arguments', () => {
    const test = new NativeTest();
    const method = (test.testWithInteger as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    method.pythonWrapper()(
      {
        indexedArgs: [{ object: new IntegerObject(10) }, { object: new IntegerObject(20) }],
        namedArgs: {},
      },
      {
        raiseException: exception => {
          raisedException = exception;
        },
      },
    );
    expect(raisedException).toBeTruthy();
    expect(raisedException.exceptionType).toEqual(ExceptionType.FunctionArgumentCountMismatch);
  });

  it('should provide callback', () => {
    const test = new NativeTest();
    const method = (test.testWithCallback as unknown) as MemberWithMetadata;
    let returnValue: BaseObject;
    method.pythonWrapper()(
      {
        onFinish: ret => {
          returnValue = ret;
        },
        indexedArgs: [
          {
            object: new IntegerObject(10),
          },
        ],
      },
      null,
    );
    expect(returnValue instanceof StringObject && returnValue.value).toEqual('abc');
  });

  it('should give args', () => {
    const test = new NativeTest();
    const method = (test.testWithArgs as unknown) as MemberWithMetadata;
    method.pythonWrapper()(
      {
        indexedArgs: [
          {
            object: new IntegerObject(10),
          },
        ],
      },
      null,
    );
    expect(argsArgument).toHaveLength(1);
  });

  it('should give kwargs', () => {
    const test = new NativeTest();
    const method = (test.testWithKwargs as unknown) as MemberWithMetadata;
    method.pythonWrapper()(
      {
        indexedArgs: [],
        namedArgs: {
          test1: new IntegerObject(100),
        },
      },
      null,
    );
    expect(kwargsArgument).toBeTruthy();
    expect(kwargsArgument['test1'].toInteger()).toEqual(100);
  });

  it('should give default value', () => {
    const test = new NativeTest();
    const method = (test.testWithDefault as unknown) as MemberWithMetadata;
    method.pythonWrapper()(
      {
        indexedArgs: [],
        namedArgs: {},
      },
      null,
    );
    expect(callNumber).toEqual(20);
  });

  it('should take value from named', () => {
    const test = new NativeTest();
    const method = (test.testWithDefault as unknown) as MemberWithMetadata;
    method.pythonWrapper()(
      {
        indexedArgs: [],
        namedArgs: {
          param2: new IntegerObject(15),
        },
      },
      null,
    );
    expect(callNumber).toEqual(15);
  });

  it('should give callable context', () => {
    const test = new NativeTest();
    const method = (test.testWithCallableContext as unknown) as MemberWithMetadata;
    method.pythonWrapper()(
      {
        indexedArgs: [
          {
            object: new IntegerObject(10),
          },
          {
            object: new IntegerObject(10),
          },
        ],
      },
      null,
    );
    expect(callableContext).toBeTruthy();
    expect(callableContext.indexedArgs).toHaveLength(2);
  });

  it('should give run context', () => {
    const test = new NativeTest();
    const method = (test.testWithRunContext as unknown) as MemberWithMetadata;
    method.pythonWrapper()(
      {
        indexedArgs: [],
      },
      {
        onLeaveFunction: () => {},
      },
    );
    expect(runContext).toBeTruthy();
    expect(runContext.onLeaveFunction).toBeTruthy();
  });

  it('should throw exception on non-list argument', () => {
    const test = new NativeTest();
    const method = (test.testWithList as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    method.pythonWrapper()(
      {
        indexedArgs: [
          {
            object: new StringObject('xyz'),
          },
        ],
      },
      {
        raiseException: exception => {
          raisedException = exception;
        },
      },
    );
    expect(raisedException.exceptionType).toEqual(ExceptionType.TypeError);
  });

  it('should throw exception on non-dictionary argument', () => {
    const test = new NativeTest();
    const method = (test.testWithDictionary as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    method.pythonWrapper()(
      {
        indexedArgs: [
          {
            object: new StringObject('xyz'),
          },
        ],
      },
      {
        raiseException: exception => {
          raisedException = exception;
        },
      },
    );
    expect(raisedException.exceptionType).toEqual(ExceptionType.TypeError);
  });

  it('should throw exception on non-tuple argument', () => {
    const test = new NativeTest();
    const method = (test.testWithTuple as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    method.pythonWrapper()(
      {
        indexedArgs: [
          {
            object: new StringObject('xyz'),
          },
        ],
      },
      {
        raiseException: exception => {
          raisedException = exception;
        },
      },
    );
    expect(raisedException.exceptionType).toEqual(ExceptionType.TypeError);
    expect(raisedException.params).toEqual(['tupleParam']);
  });

  it('should throw exception on non-iterable argument', () => {
    const test = new NativeTest();
    const method = (test.testWithIterable as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    method.pythonWrapper()(
      {
        indexedArgs: [
          {
            object: new IntegerObject(20),
          },
        ],
      },
      {
        raiseException: exception => {
          raisedException = exception;
        },
      },
    );
    expect(raisedException.exceptionType).toEqual(ExceptionType.TypeError);
    expect(raisedException.params).toEqual(['iterable']);
  });

  it('should return any other argument', () => {
    const test = new NativeTest();
    const method = (test.testReturnSome as unknown) as MemberWithMetadata;
    const ret = method.pythonWrapper()(
      {
        indexedArgs: [],
        namedArgs: {},
      },
      null,
    );
    expect(ret instanceof TupleObject).toBeTruthy();
  });

  it('should throw exception on unknown return type', () => {
    const test = new NativeTest();
    const method = (test.testReturnUnknown as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    method.pythonWrapper()(
      {
        indexedArgs: [],
        namedArgs: {},
      },
      {
        raiseException: exception => {
          raisedException = exception;
        },
      },
    );
    expect(raisedException.exceptionType).toEqual(ExceptionType.TypeError);
  });

  it('should throw exception on unknown return type', () => {
    const test = new NativeTest();
    const method = (test.testThrowError as unknown) as MemberWithMetadata;
    let raisedException: ExceptionObject;
    method.pythonWrapper()(
      {
        indexedArgs: [],
        namedArgs: {},
      },
      {
        raiseException: exception => {
          raisedException = exception;
        },
      },
    );
    expect(raisedException.exceptionType).toEqual(ExceptionType.SystemError);
  });
});
