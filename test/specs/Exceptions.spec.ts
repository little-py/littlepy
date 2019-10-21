import { UniqueErrorCode } from '../../src/api/UniqueErrorCode';
import { compileModule, runModules } from './Utils';

interface ErrorScenario {
  input: string;
  error: UniqueErrorCode;
  args?: string[];
  onlyThis?: boolean;
}

const errors: ErrorScenario[] = [
  {
    input: `
      a = 10
      class Some(a): pass
    `,
    error: UniqueErrorCode.ExpectedClass,
  },
  {
    input: `
      b.c = a
    `,
    error: UniqueErrorCode.UnknownIdentifier,
    // expectedException: ExceptionType.UnknownIdentifier,
  },
  {
    input: `
      b = 10
      b.c = 100
      a = b.c.d
    `,
    error: UniqueErrorCode.UnknownIdentifier,
    // expectedException: ExceptionType.UnknownIdentifier,
  },
  {
    input: `
      b = 10
      b.c(100)
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['c'],
  },
  {
    input: `
      b = 10
      b.c.d(100)
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['c'],
  },
  {
    input: `
      a = 10
      class Some(a.b): pass
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['a.b'],
  },
  {
    input: `
      a = 10
      a.b = 20
      class Some(a.b.c): pass
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['a.b.c'],
  },
  {
    input: `
      a = 10 + x
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['x'],
  },
  {
    input: `
      a = x + 10
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['x'],
  },
  {
    input: `
      print(-x)
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['x'],
  },
  {
    input: `
      print(-'abc')
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedNumberObject,
  },
  {
    input: `
      print(x)
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['x'],
  },
  {
    input: `
      print(end=x)
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['x'],
  },
  {
    input: `
      test = 5
      test(10)
    `,
    // expectedException: ExceptionType.NotAFunction,
    error: UniqueErrorCode.ExpectedCallableObject,
  },
  {
    input: `
      test = 5
      test.sub = 10
      test.sub(10)
    `,
    // expectedException: ExceptionType.NotAFunction,
    error: UniqueErrorCode.ExpectedCallableObject,
  },
  {
    input: `
      raise x
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['x'],
  },
  {
    input: `
      raise 5
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedException,
  },
  {
    input: `
      a = [y]
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['y'],
  },
  {
    input: `
     2 += 3
    `,
    // expectedException: ExceptionType.ExpectedReference,
    error: UniqueErrorCode.ExpectedReferenceObject,
  },
  {
    input: `
     x += 10
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['x'],
  },
  {
    input: `
     x = 5
     x += y
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['y'],
  },
  {
    input: `
      c = 10
      a, b = c
    `,
    // expectedException: ExceptionType.UnpackSourceIsNotSequence,
    error: UniqueErrorCode.ExpectedIterableObject,
  },
  {
    input: `
      c, d = 10, 20
      a, b, e = c, d
    `,
    // expectedException: ExceptionType.UnpackCountDoesntMatch,
    error: UniqueErrorCode.UnpackCountDoesntMatch,
  },
  {
    input: `
      c, d = 10, 20
      a, 10 = c, d
    `,
    // expectedException: ExceptionType.ExpectedReference,
    error: UniqueErrorCode.ExpectedReferenceObject,
  },
  {
    input: `
      c, d = 10, 20
      () = c, d
    `,
    // expectedException: ExceptionType.CannotUnpackToEmptyTuple,
    error: UniqueErrorCode.CannotUnpackToEmptyTuple,
  },
  {
    input: `
      break
    `,
    // expectedException: ExceptionType.BreakOrContinueOutsideOfCycle,
    error: UniqueErrorCode.BreakAndContinueShouldBeInsideCycle,
  },
  {
    input: `
      def test():
        return x
      test()
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['x'],
  },
  {
    input: `
      x.y(10)
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['x'],
  },
  {
    input: `
      while x:
        print(10)
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['x'],
  },
  {
    input: `
      a = { unk }
      print(a)
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['unk'],
  },
  {
    input: `
      a = 10
      if not x:
        print('ok')
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['x'],
  },
  {
    input: `
      def func():
        import abc
      func()
    `,
    // expectedException: ExceptionType.ImportAllowedOnlyOnModuleLevel,
    error: UniqueErrorCode.ImportAllowedOnlyOnModuleLevel,
  },
  {
    input: `
      def func():
        import abc as d
      func()
    `,
    // expectedException: ExceptionType.ImportAllowedOnlyOnModuleLevel,
    error: UniqueErrorCode.ImportAllowedOnlyOnModuleLevel,
  },
  {
    input: `
      def func():
        from a import d
      func()
    `,
    // expectedException: ExceptionType.ImportAllowedOnlyOnModuleLevel,
    error: UniqueErrorCode.ImportAllowedOnlyOnModuleLevel,
  },
  {
    input: `
      import u
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    args: ['u'],
    error: UniqueErrorCode.UnknownIdentifier,
  },
  {
    input: `
      if x or y:
        print('x')
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
  },
  {
    input: `
      year = 2018
      print(f'Results of the {year} {event}.')
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    args: ['event'],
    error: UniqueErrorCode.UnknownIdentifier,
  },
  {
    input: `
      print('1' > '2')
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.MathOperationOperandsDontMatch,
  },
  {
    input: `
      def func(arg):
        print(arg)
        
      func(1, 2)
    `,
    // expectedException: ExceptionType.FunctionTooManyArguments,
    error: UniqueErrorCode.FunctionTooManyArguments,
  },
  {
    input: `
      class Example:
        def __init__(self):
          print('init')
          
      r = Example(10)
    `,
    // expectedException: ExceptionType.FunctionTooManyArguments,
    error: UniqueErrorCode.FunctionTooManyArguments,
  },
  {
    input: `
      class Example: pass
      r = Example(10)
    `,
    // expectedException: ExceptionType.FunctionTooManyArguments,
    error: UniqueErrorCode.FunctionTooManyArguments,
  },
  {
    input: `
      def func():
        print('a')
      func(x=10)
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
  },
  {
    input: `
      def func(a):
        print(a)
      func(10, a=20)
    `,
    // expectedException: ExceptionType.FunctionDuplicateArgumentError,
    error: UniqueErrorCode.ArgumentAlreadyProvided,
  },
  {
    input: `
      def func(a):
        print(a)
      func()
    `,
    // expectedException: ExceptionType.FunctionMissingArgument,
    error: UniqueErrorCode.MissingArgument,
  },
  {
    input: `
      def func(**a):
        print(a)
      func(10)
    `,
    // expectedException: ExceptionType.FunctionTooManyArguments,
    error: UniqueErrorCode.FunctionTooManyArguments,
  },
  {
    input: `
      class Test(Exception, Exception): pass
      e = Test()
    `,
    // expectedException: ExceptionType.ResolutionOrder,
    error: UniqueErrorCode.CannotBuildResolutionOrder,
  },
  {
    input: `
      class Test(Exception, ArithmeticError): pass
      e = Test()
    `,
    // expectedException: ExceptionType.CannotDeriveFromMultipleException,
    error: UniqueErrorCode.CannotDeriveFromMultipleException,
  },
  {
    input: `
      del 10
    `,
    // expectedException: ExceptionType.ReferenceError,
    error: UniqueErrorCode.ExpectedReferenceObject,
  },
  {
    input: `
      a = 20
      del a
      print(a)
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['a'],
  },
  {
    input: `
      a = 20
      del a
      del a
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['a'],
  },
  {
    input: `
      a = [20]
      del a['x']
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedDictionaryObject,
  },
  {
    input: `
      a = [10]
      print(a['test'])
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedStringObject,
  },
  {
    input: `
      for x in range(3, 4, 5, 6):
        print(x)
    `,
    // expectedException: ExceptionType.FunctionArgumentCountMismatch,
    error: UniqueErrorCode.RequiredArgumentIsMissing,
  },
  {
    input: `
      for x in range(3, 4, 0):
        print(x)
    `,
    // expectedException: ExceptionType.FunctionArgumentError,
    error: UniqueErrorCode.StepCannotBeZero,
  },
  {
    input: `
      x = 10
      try:
        1/0
      except Exception as x:
        print(x)
      print(x)
    `,
    // exception 'as' parameter is undefined after except clause is finished
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['x'],
  },
  {
    input: `
      a = 'test'
      print(a['x'])
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedNumericIndexer,
  },
  {
    input: `
      def func():
        print('test')
        
      print(func.__name)
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['__name'],
  },
  {
    input: `
      n = -37
      n.bit_length()
    `,
    // TBD: binary operations aren't supported
    // output: ['-0b100101', '6'],
    // expectedException: ExceptionType.NotImplementedError,
    error: UniqueErrorCode.NotImplemented,
    args: ['bit_length'],
  },
  {
    input: `
      print((1024).to_bytes(2, byteorder='big'))
      print((1024).to_bytes(10, byteorder='big'))
      print((-1024).to_bytes(10, byteorder='big', signed=True))
      x = 1000
      print(x.to_bytes((x.bit_length() + 7) // 8, byteorder='little'))
    `,
    // expectedException: ExceptionType.NotImplementedError,
    error: UniqueErrorCode.NotImplemented,
    args: ['to_bytes'],
    // TBD: binary operations aren't supported
    // output: ["b'\x04\x00'", "b'\x00\x00\x00\x00\x00\x00\x00\x00\x04\x00'", "b'\xff\xff\xff\xff\xff\xff\xff\xff\xfc\x00'", "b'\xe8\x03'"],
  },
  {
    input: `
      print(int.from_bytes(b'\x00\x10', byteorder='big'))
      print(int.from_bytes(b'\x00\x10', byteorder='little'))
      print(int.from_bytes(b'\xfc\x00', byteorder='big', signed=True))
      print(int.from_bytes(b'\xfc\x00', byteorder='big', signed=False))
      print(int.from_bytes([255, 0, 0], byteorder='big'))
    `,
    // TBD: binary operations aren't supported
    // output: ['16', '4096', '-1024', '64512', '16711680'],
    // expectedException: ExceptionType.NotImplementedError,
    error: UniqueErrorCode.NotImplemented,
    args: ['from_bytes'],
  },
  {
    input: `
      # print((3.12).hex())
      print(float.fromhex('0x1.8f5c28f5c28f6p+1'))
    `,
    // TBD: binary operations aren't supported
    // output: ["'0x1.8f5c28f5c28f6p+1'", '3.12'],
    // expectedException: ExceptionType.NotImplementedError,
    error: UniqueErrorCode.NotImplemented,
    args: ['fromhex'],
  },
  {
    input: `
      print(hash(30.2) == hash(30.2))
    `,
    // TBD: hash operations aren't supported
    // output: ['True'],
    // expectedException: ExceptionType.NotImplementedError,
    error: UniqueErrorCode.NotImplemented,
    args: ['hash'],
  },
  {
    input: `
      s = (1,2,3,4,5)
      print(s['a'])
    `,
    // expectedException: ExceptionType.UnknownIdentifier,
    error: UniqueErrorCode.UnknownIdentifier,
    args: ['a'],
  },
  {
    input: `
      s = (1,2,3,4,5)
      print(s['a'][0])
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedDictionaryOrListObject,
  },
  {
    input: `
      s = [1,2,3,4,5]
      print(s['a'][0])
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedNumberObject,
  },
  {
    input: `
      s = { 'first': 10, 'second': 20 }
      print(s[10][0])
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedStringObject,
  },
  {
    input: `
      s = (1,2,3,4,5)
      print(s[1:3:0][0])
    `,
    // expectedException: ExceptionType.FunctionArgumentError,
    error: UniqueErrorCode.StepCannotBeZero,
  },
  {
    input: `
      s = (1,2,3,4,5)
      print(s['a':3:0][0])
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedNumberObject,
  },
  {
    input: `
      s = (1,2,3,4,5,6,7)
      print(s[2:7:0])
    `,
    // expectedException: ExceptionType.FunctionArgumentError,
    error: UniqueErrorCode.StepCannotBeZero,
  },
  {
    input: `
      s = (1,2,3)*4
      print(s.index(2, 5, 6))
    `,
    // expectedException: ExceptionType.ValueError,
    error: UniqueErrorCode.CannotFindObjectInIterator,
  },
  {
    input: `
      print('test'.center('a', '-'))
    `,
    // expectedException: ExceptionType.TypeError,
    args: ['width'],
    error: UniqueErrorCode.ExpectedNumberObject,
  },
  {
    input: `
      print('test'.center(20, 10))
    `,
    // expectedException: ExceptionType.TypeError,
    args: ['fillchar'],
    error: UniqueErrorCode.ExpectedStringObject,
  },
  {
    input: `
      print(frozenset({10,20}).isdisjoint(50))
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedIterableObject,
  },
  {
    input: `
      print(frozenset({10,20,30}).issuperset(5))
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedIterableObject,
  },
  {
    input: `
      print({10,20}.union(1))
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedIterableObject,
  },
  {
    input: `
      print(frozenset({10,20}).union(10))
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedIterableObject,
  },
  {
    input: `
      print({10,20}.intersection(1))
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedIterableObject,
  },
  {
    input: `
      print(frozenset({10,20}).intersection(10))
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedIterableObject,
  },
  {
    input: `
      print({10,20}.difference(1))
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedIterableObject,
  },
  {
    input: `
      print(frozenset({10,20}).difference(1))
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedIterableObject,
  },
  {
    input: `
      print({10,20}.symmetric_difference(1))
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedIterableObject,
  },
  {
    input: `
      print(frozenset({10,20}).symmetric_difference(10))
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedIterableObject,
  },
  {
    input: `
      print(frozenset([10,20]).issubset(19))
    `,
    // expectedException: ExceptionType.TypeError,
    error: UniqueErrorCode.ExpectedIterableObject,
  },
  {
    input: `
      print([10,20] <= [10,20,30])
    `,
    error: UniqueErrorCode.MathOperationOperandsDontMatch,
  },
  {
    input: `
      iter(10)
    `,
    error: UniqueErrorCode.ExpectedIterableObject,
  },
  {
    input: `
      import math
      print(math.fmod(12, 0))
    `,
    error: UniqueErrorCode.ZeroDivision,
  },
  {
    input: `
      import math
      print(math.frexp(12))
    `,
    error: UniqueErrorCode.NotImplemented,
  },
  {
    input: `
      import math
      print(math.pow('x', 10.2))
    `,
    error: UniqueErrorCode.ExpectedNumberObject,
  },
  {
    input: `
      print(abs('x'))
    `,
    error: UniqueErrorCode.ExpectedNumberObject,
  },
  {
    input: `
      print(all(10))
    `,
    error: UniqueErrorCode.ExpectedIterableObject,
  },
  {
    input: `
      print(any(10))
    `,
    error: UniqueErrorCode.ExpectedIterableObject,
  },
  {
    input: `
      print(chr('x'))
    `,
    error: UniqueErrorCode.ExpectedNumberObject,
  },
  {
    input: `
      print(min())
    `,
    error: UniqueErrorCode.ExpectedNonEmptyArgs,
  },
  {
    input: `
      print(max())
    `,
    error: UniqueErrorCode.ExpectedNonEmptyArgs,
  },
  {
    input: `
      print(sum())
    `,
    error: UniqueErrorCode.ExpectedNonEmptyArgs,
  },
  {
    input: `
      a = dict(one=1, two=2, three=3)
      a.pop('four')
    `,
    error: UniqueErrorCode.CannotFindDictionaryKey,
  },
  {
    input: `
      a = dict()
      a.popitem()
    `,
    error: UniqueErrorCode.DictionaryIsEmpty,
  },
  {
    input: `
      def generator():
        yield 1
      it = generator()
      for x in it:
        print(x)
      it.__next__()
    `,
    error: UniqueErrorCode.CalledNextOnFinishedIterator,
  },
  {
    input: `
      a = [1]
      it = a.__iter__()
      for x in it:
        print(x)
      it.__next__()
    `,
    error: UniqueErrorCode.IteratorFinished,
  },
  {
    input: `
      a = [10]
      del a[{5}]
    `,
    error: UniqueErrorCode.ExpectedNumericOrStringIndexer,
  },
  {
    input: `
      a = [10]
      print(a[1])
    `,
    error: UniqueErrorCode.IndexerIsOutOfRange,
  },
  {
    input: `
      a = {10}
      a.remove(2)
    `,
    error: UniqueErrorCode.ObjectNotFoundInSet,
  },
  {
    input: `
      a = 'test'
      print(a % 2)
    `,
    error: UniqueErrorCode.ExpectedDictionaryOrIterableInFormat,
  },
  {
    input: `
      raise
    `,
    error: UniqueErrorCode.NoCurrentException,
  },
  {
    input: `
      print(1 in 2)
    `,
    error: UniqueErrorCode.ExpectedContainer,
  },
];

describe('Exceptions', () => {
  const onlyThis = errors.filter(s => s.onlyThis);
  let scenarios: ErrorScenario[];
  if (onlyThis.length) {
    scenarios = onlyThis;
  } else {
    scenarios = errors;
  }

  for (const { input, error, args } of scenarios) {
    const match = input.replace(/[\s\r\n\t]*$/, '');
    it(match, () => {
      const code = compileModule(input, 'main');
      expect(code.errors).toHaveLength(0);
      const result = runModules(
        {
          main: code,
        },
        'main',
      );
      const exception = result.getUnhandledException();
      expect(exception.uniqueError).toEqual(error);
      if (args) {
        expect(exception.params).toEqual(args);
      }
    });
  }

  it('should cover all exceptions', () => {
    const exceptionsMap = {};
    for (const e of errors) {
      exceptionsMap[e.error] = true;
    }
    // exceptions from the check
    exceptionsMap[UniqueErrorCode.CannotConvertJsToString] = true; // handled in native spec
    exceptionsMap[UniqueErrorCode.CannotConvertJsToNumber] = true; // handled in native spec
    exceptionsMap[UniqueErrorCode.CannotConvertJsToBoolean] = true; // handled in native spec
    exceptionsMap[UniqueErrorCode.CannotConvertJsToObject] = true; // handled in native spec
    exceptionsMap[UniqueErrorCode.ExpectedBooleanObject] = true; // handled in native spec
    exceptionsMap[UniqueErrorCode.ExpectedListObject] = true; // handled in native spec
    exceptionsMap[UniqueErrorCode.ExpectedDictionaryObject] = true; // handled in native spec
    exceptionsMap[UniqueErrorCode.ExpectedTupleObject] = true; // handled in native spec
    exceptionsMap[UniqueErrorCode.ExpectedPythonObject] = true;
    exceptionsMap[UniqueErrorCode.UnexpectedJsException] = true;
    exceptionsMap[UniqueErrorCode.CannotFindEndOfCycle] = true; // cannot reproduce with valid compiler
    exceptionsMap[UniqueErrorCode.CannotFindModuleFunction] = true; // cannot reproduce with valid compiler
    exceptionsMap[UniqueErrorCode.CannotFindLabel] = true; // cannot reproduce with valid compiler
    exceptionsMap[UniqueErrorCode.UnexpectedEndOfStack] = true; // cannot reproduce with valid compiler
    exceptionsMap[UniqueErrorCode.StopIteration] = true; // it is not exactly and exception and it is tested
    exceptionsMap[UniqueErrorCode.NotSpecified] = true; // it is used for external exceptions which don't have unique code
    exceptionsMap[UniqueErrorCode.RegisterIsNotSet] = true; // it is internal state error, should not happen with valid machine code
    exceptionsMap[UniqueErrorCode.UnknownUnaryOperation] = true; // it is internal state error, should not happen with valid machine code
    exceptionsMap[UniqueErrorCode.UnknownInstruction] = true; // it is internal state error, should not happen with valid machine code
    exceptionsMap[UniqueErrorCode.UnsupportedLiteralType] = true; // it is just unsupported literal type which is rarely used
    exceptionsMap[UniqueErrorCode.ModuleNotFound] = true; // handled in customize spec
    exceptionsMap[UniqueErrorCode.FunctionNotFound] = true; // handled in customize spec
    const untestedErrors = [];
    for (const id of Object.keys(UniqueErrorCode)) {
      const value = UniqueErrorCode[id];
      if (!exceptionsMap[value]) {
        untestedErrors.push(value);
      }
    }
    expect(untestedErrors).toEqual([]);
  });
});
