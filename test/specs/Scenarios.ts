import { PyErrorType } from '../../src/api/ErrorType';
import { ExceptionType } from '../../src/api/ExceptionType';

export interface TestScenario {
  input: string;
  output?: string[];
  onlyThis?: boolean;
  expectedException?: ExceptionType;
  expectedCompilerError?: PyErrorType;
  exceptionArgs?: string[];
}

const scenarios: TestScenario[] = [
  {
    input: '',
    output: [],
  },
  {
    input: 'print("test1")\nprint("test2")\rprint("test3")\r\nprint("test4")\n\rprint("test5")',
    output: ['test1', 'test2', 'test3', 'test4', 'test5'],
  },
  {
    input: `
        # This is a comment
        print("hello world")
      `,
    output: ['hello world'],
  },
  {
    input: `
        for x in [1, 2, 3]:
           print(x)
      `,
    output: [
      '1', //
      '2',
      '3',
    ],
  },
  {
    input: `
        a = 33
        b = 200
        if b > a:
          print("b is greater than a")
      `,
    output: ['b is greater than a'],
  },
  {
    input: `
        a = 33
        b = 200
        if b < a:
          print("b is greater than a")
      `,
    output: [],
  },
  {
    input: `
        x = 5
        y = 'John'
        print(x)
        print(y)
      `,
    output: ['5', 'John'],
  },
  {
    input: `
        x, y, z = "Orange", "Banana", "Cherry"
        print(x)
        print(y)
        print(z)
      `,
    output: [
      'Orange', //
      'Banana',
      'Cherry',
    ],
  },
  {
    input: `
        fruits = ["apple", 'banana', "cherry"]
        for x in fruits:
          print(x)
          if x == "banana":
            break
      `,
    output: ['apple', 'banana'],
  },
  {
    input: `
        fruits = ["apple", "banana", "cherry"]
        for x in fruits:
          if x == "banana":
            continue
          print(x)
      `,
    output: ['apple', 'cherry'],
  },
  {
    input: `
        for x in range(3, 6):
          print(x)
      `,
    output: ['3', '4', '5'],
  },
  {
    input: `
        def my_function(fname):
          print(fname + " Ghi")
        my_function("Abc")
        my_function("Defdef")
      `,
    output: ['Abc Ghi', 'Defdef Ghi'],
  },
  {
    input: `
        def my_function(country = "Norway"):
          print("I am from " + country)
        my_function("Sweden")
        my_function()
      `,
    output: ['I am from Sweden', 'I am from Norway'],
  },
  {
    input: `
        def some_function(x):
          return 11 * x
        print(some_function(5))
        print(some_function(6))
      `,
    output: ['55', '66'],
  },
  {
    input: `
        class MyClass:
          x = 5
        p1 = MyClass()
        print(p1.x)
      `,
    output: ['5'],
  },
  {
    input: `
        class Person:
          def __init__(self, name, age):
            self.name = name
            self.age = age
        p1 = Person("John", 36)
        print(p1.name)
        print(p1.age)
      `,
    output: ['John', '36'],
  },
  {
    input: `
        class Person:
          def __init__(self, name):
            self.name = name
          def write_name(self):
            print('My name is ' + self.name)
        p2 = Person('Clown')
        p2.write_name()
        p2.name = "Joker"
        p2.write_name()
      `,
    output: ['My name is Clown', 'My name is Joker'],
  },
  {
    input: `
      print(1 < 2)
      a = 10
      b = 10
      c = 20
      print(a is b)
      print(a is a)
      print(a is not b)
      print(a != b)
      print(a == b)
      print(a != c)
      print(10 <= 10)
      print(10 < 10)
      print(20 > 10)
      print(20 < 10)
      print(10 > 10)
      print(10 >= 10)
    `,
    output: [
      'True', //
      'False',
      'True',
      'True',
      'False',
      'True',
      'True',
      'True',
      'False',
      'True',
      'False',
      'False',
      'True',
    ],
  },
  {
    input: `
      class HasEqual:
        def __init__(self, value):
          self.value = value
        def __eq__(self, other):
          return self.value == other.value
      a = HasEqual(5)
      b = HasEqual(10)
      c = HasEqual(5)
      print(a == b)
      print(a != b)
      print(a == c)
      print(a != c)
    `,
    output: ['False', 'True', 'True', 'False'],
  },
  {
    input: `
      print('Wolf' in 'Lonely Wolf')
      print('Cat' in 'Lonely Wolf')
      a = 10
      b = [a]
      c = 20
      print(a in b)
      print(c in b)
      print(c not in b)
    `,
    output: ['True', 'False', 'True', 'False', 'True'],
  },
  {
    input: `
      class TestContains:
        def __init__(self, value):
          self.value = value
        def __contains__(self, value):
          return self.value == value
      a = TestContains(100)
      print(20 in a)
      print(100 in a)
    `,
    output: ['False', 'True'],
  },
  {
    input: `
      class Parent:
        age = 10
        def __init__(self, age):
          self.age = age
      class Child(Parent):
        def __init__(self):
          super().__init__(20)
      p = Child()
      print(p.age)
      del p.age
      print(p.age)
      print(Parent);
    `,
    output: ['20', '10', "<class 'Parent'>"],
  },
  {
    input: `
      def generator():
        yield 1
        yield 2
        yield 3
      for x in generator():
        print(x)
    `,
    output: ['1', '2', '3'],
  },
  {
    input: `
      print(1, end=' ')
      print(2, end='-')
    `,
    output: ['1 2-'],
  },
  {
    input: `
      a = 3
      while(a < 5):
        print(a)
        a = a + 1
    `,
    output: ['3', '4'],
  },
  {
    input: `
      a = 10
      class Some(a): pass
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      a = [1]
      a[0] = 5
      print(a[0])
    `,
    output: ['5'],
  },
  {
    input: `
      b.c = a
    `,
    expectedException: ExceptionType.UnknownIdentifier,
  },
  {
    input: `
      b = 10
      b.c = 100
      a = b.c.d
    `,
    expectedException: ExceptionType.UnknownIdentifier,
  },
  {
    input: `
      b = 10
      b.c(100)
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['c'],
  },
  {
    input: `
      b = 10
      b.c.d(100)
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['c'],
  },
  {
    input: `
      a = 10
      class Some(a.b): pass
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['a.b'],
  },
  {
    input: `
      a = 10
      a.b = 20
      class Some(a.b.c): pass
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['a.b.c'],
  },
  {
    input: `
      a = 10 + x
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['x'],
  },
  {
    input: `
      a = x + 10
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['x'],
  },
  {
    input: `
      print(-10)
    `,
    output: ['-10'],
  },
  {
    input: `
      print(-x)
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['x'],
  },
  {
    input: `
      print(-'abc')
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      x = 10
      print(-x)
    `,
    output: ['-10'],
  },
  {
    input: `
      print(x)
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['x'],
  },
  {
    input: `
      print(end=x)
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['x'],
  },
  {
    input: `
      test = 5
      test(10)
    `,
    expectedException: ExceptionType.NotAFunction,
  },
  {
    input: `
      test = 5
      test.sub = 10
      test.sub(10)
    `,
    expectedException: ExceptionType.NotAFunction,
  },
  {
    input: `
      class B(Exception): pass
      class C(B): pass
      class D(C): pass

      for cls in [B, C, D]:
        try: raise cls()
        except D: print("D")
        except C: print("C")
        except B: print("B")
    `,
    output: ['B', 'C', 'D'],
  },
  {
    input: `
      raise x
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['x'],
  },
  {
    input: `
      raise 5
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      a = [y]
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['y'],
  },
  {
    input: `
      try:
        raise Exception()
      except:
        print('except')
      finally:
        print('finally')
    `,
    output: ['except', 'finally'],
  },
  {
    input: `
      try:
        try:
          raise Exception()
        finally:
          print('finally')
      except:
        print('except')
    `,
    output: ['finally', 'except'],
  },
  {
    input: `
      a = 10
      print(a)
      a += 100
      print(a)
    `,
    output: ['10', '110'],
  },
  {
    input: `
     2 += 3
    `,
    expectedException: ExceptionType.ExpectedReference,
  },
  {
    input: `
     x += 10
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['x'],
  },
  {
    input: `
     x = 5
     x += y
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['y'],
  },
  {
    input: `
      c = 10
      a, b = c
    `,
    expectedException: ExceptionType.UnpackSourceIsNotSequence,
  },
  {
    input: `
      c, d = 10, 20
      a, b, e = c, d
    `,
    expectedException: ExceptionType.UnpackCountDoesntMatch,
  },
  {
    input: `
      c, d = 10, 20
      a, 10 = c, d
    `,
    expectedException: ExceptionType.ExpectedReference,
  },
  {
    input: `
      c, d = 10, 20
      () = c, d
    `,
    expectedException: ExceptionType.CannotUnpackToEmptyTuple,
  },
  {
    input: `
      a = { 'apple', 'banana' }
      print(a)
    `,
    output: ["{'apple', 'banana'}"],
  },
  {
    input: `
      dict = { 'first': 'firstvalue', 'second': 'secondvalue' }
      dict['first'] = 10
      print(dict)
    `,
    output: ["{'first': 10, 'second': 'secondvalue'}"],
  },
  {
    input: `
      break
    `,
    expectedException: ExceptionType.BreakOrContinueOutsideOfCycle,
  },
  {
    input: `
      i = 10
      while i < 15:
        try:
          if i == 12:
            raise Exception()
        except:
          print('caught')
          break
        
        print(i)
        i += 1
    `,
    output: ['10', '11', 'caught'],
  },
  {
    input: `
      def test():
        return x
      test()
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['x'],
  },
  {
    input: `
      x.y(10)
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['x'],
  },
  {
    input: `
      while x:
        print(10)
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['x'],
  },
  {
    input: `
      a = { unk }
      print(a)
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['unk'],
  },
  {
    input: `
      a = 10
      if not a < 10:
        print('ok')
    `,
    output: ['ok'],
  },
  {
    input: `
      a = 10
      if not x:
        print('ok')
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['x'],
  },
  {
    input: `
      def func():
        import abc
      func()
    `,
    expectedException: ExceptionType.ImportAllowedOnlyOnModuleLevel,
  },
  {
    input: `
      def func():
        import abc as d
      func()
    `,
    expectedException: ExceptionType.ImportAllowedOnlyOnModuleLevel,
  },
  {
    input: `
      def func():
        from a import d
      func()
    `,
    expectedException: ExceptionType.ImportAllowedOnlyOnModuleLevel,
  },
  {
    input: `
      import u
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['u'],
  },
  {
    input: `
      class Truth:
        def __bool__(self):
          return True
      
      class Lie:
        def __bool__(self):
          return False
      
      t = Truth()
      if t:
        print('true')
      else:
        print('false')
      f = Lie()
      if f:
        print('true')
      else:
        print('false')
    `,
    output: ['true', 'false'],
  },
  {
    input: `
      class Truth:
        def __len__(self):
          return 10
      
      class Lie:
        def __len__(self):
          return 0
      
      t = Truth()
      if t:
        print('true')
      else:
        print('false')
      f = Lie()
      if f:
        print('true')
      else:
        print('false')
    `,
    output: ['true', 'false'],
  },
  {
    input: `
      class Truth:
        def __bool__(self):
          print('truth')
          return True
      
      t = Truth()
      if t or t:
        print('ok')
    `,
    output: ['truth', 'ok'],
  },
  {
    input: `
      if x or y:
        print('x')
    `,
    expectedException: ExceptionType.UnknownIdentifier,
  },
  {
    input: `
      class Lie:
        def __len__(self):
          print('lie')
          return 0
      
      f = Lie()
      if f and f:
        print('x')
      else:
        print('y')
    `,
    output: ['lie', 'y'],
  },
  {
    input: `
      def test():
        return None
      test()
    `,
    output: [],
  },
  {
    input: `
      a = -10.2
      b = True
      c = False
      d = -9
      print(a, b, c, d)
    `,
    output: ['-10.2 True False -9'],
  },
  {
    input: `
      year = 2019
      event = 'Referendum'
      print(f'Results of the {year} {event}.')
    `,
    output: ['Results of the 2019 Referendum.'],
  },
  {
    input: `
      event = 'Party'
      print(f'Results of the {year {event}.')
    `,
    output: ['Results of the {year Party.'],
  },
  {
    input: `
      event = 'Party'
      print(f'Results of the {year {event.')
    `,
    output: ['Results of the {year {event.'],
  },
  {
    input: `
      year = 2018
      print(f'Results of the {year} {event}.')
    `,
    output: ['Results of the 2018 {event}.'],
  },
  {
    input: `
      print(10 - 5)
      print(5 / 2)
      print(2 ** 3)
      print(5 // 2)
      print(10 % 3)
      print(2 << 5)
      print(16 >> 2)
      print(9 & 8)
      print(5 | 2)
      print(10 ^ 1)
      print(5 > 2)
      print(2 > 5)
      print(2 < 5)
      print(5 < 2)
      print(10 >= 10)
      print(9 >= 10)
      print(10 <= 10)
      print(10 <= 9)
      print('test' == 'test')
      print('test' == 'other')
      print('test' != 'other')
      print('test' != 'test')
    `,
    output: [
      '5',
      '2.5',
      '8',
      '2',
      '1',
      '64',
      '4',
      '8',
      '7',
      '11',
      'True',
      'False',
      'True',
      'False',
      'True',
      'False',
      'True',
      'False',
      'True',
      'False',
      'True',
      'False',
    ],
  },
  {
    input: `
      class Compare:
        def __eq__(self, other):
          return True
          
      c = Compare()
      if c == 10:
        print('ok')
      if 20 == c:
        print('ok')
    `,
    output: ['ok', 'ok'],
  },
  {
    input: `
      a = Exception()
      c = Exception()
      b = a
      if a == b:
        print('true')
      else:
        print('false')
      if a != b:
        print('true')
      else:
        print('false')
      if a == c:
        print('true')
      else:
        print('false')
    `,
    output: ['true', 'false', 'false'],
  },
  {
    input: `
      print('1' > '2')
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      def func(arg):
        print(arg)
        
      func(1, 2)
    `,
    expectedException: ExceptionType.FunctionTooManyArguments,
  },
  {
    input: `
      class Example:
        def __init__(self):
          print('init')
          
      r = Example(10)
    `,
    expectedException: ExceptionType.FunctionTooManyArguments,
  },
  {
    input: `
      class Example: pass
      r = Example(10)
    `,
    expectedException: ExceptionType.FunctionTooManyArguments,
  },
  {
    input: `
      def func(a, *other):
        print(a)
        print(other)
        
      func(1)
      func(1, 2, 3)
    `,
    output: ['1', '()', '1', '(2, 3)'],
  },
  {
    input: `
      def func(a, **other):
        print(a)
        print(other)
      func(10)
      func(10, test=20)
      func(a=20)
    `,
    output: ['10', '{}', '10', "{'test': 20}", '20', '{}'],
  },
  {
    input: `
      def func():
        print('a')
      func(x=10)
    `,
    expectedException: ExceptionType.UnknownIdentifier,
  },
  {
    input: `
      def func(a):
        print(a)
      func(10, a=20)
    `,
    expectedException: ExceptionType.FunctionDuplicateArgumentError,
  },
  {
    input: `
      def func(a):
        print(a)
      func()
    `,
    expectedException: ExceptionType.FunctionMissingArgument,
  },
  {
    input: `
      def func(**a):
        print(a)
      func(10)
    `,
    expectedException: ExceptionType.FunctionArgumentError,
  },
  {
    input: `
      class Test(Exception, Exception): pass
      e = Test()
    `,
    expectedException: ExceptionType.ResolutionOrder,
  },
  {
    input: `
      class Test(Exception, ArithmeticError): pass
      e = Test()
    `,
    expectedException: ExceptionType.CannotDeriveFromMultipleException,
  },
  {
    input: `
      a = 10
      a *= 20
      print(a)
      a = 10
      a -= 5
      print(a)
      a = 5
      a /= 2
      print(a)
      a = 2
      a **= 3
      print(a)
      a = 5
      a //= 2
      print(a)
      a = 10
      a %= 3
      print(a)
      a = 2
      a <<= 5
      print(a)
      a = 16
      a >>= 2
      print(a)
      a = 9
      a &= 8
      print(a)
      a = 5
      a |= 2
      print(a)
      a = 10
      a ^= 1
      print(a)
    `,
    output: ['200', '5', '2.5', '8', '2', '1', '64', '4', '8', '7', '11'],
  },
  {
    input: `# comment`,
    output: [],
  },
  {
    input: `
      a = 10
      if a > 5:
        print('first')
      if a > 7:
        print('second')
    `,
    output: ['first', 'second'],
  },
  {
    input: `
      else:
        print('a')
    `,
    expectedCompilerError: PyErrorType.CannotFindIfOrElifForElse,
  },
  {
    input: `
      a = 10; print(a); print(a+10)
    `,
    output: ['10', '20'],
  },
  {
    input: `
      a = 10
      if a < 20: a += 20; print(a)
    `,
    output: ['30'],
  },
  {
    input: `
      a = 10
      a += 20; if a < 40: print(a)
    `,
    expectedCompilerError: PyErrorType.BlockInCombinedLine,
  },
  {
    input: `
      a = 10
      if a + 20 = 10 print(a)
    `,
    expectedCompilerError: PyErrorType.BlockExpectedColon,
  },
  {
    input: `
      for a:
        print(a)
    `,
    expectedCompilerError: PyErrorType.IncompleteForDefinition,
  },
  {
    input: `
      for 10 in [10]:
        print(10)
    `,
    expectedCompilerError: PyErrorType.ForExpectedArgument,
  },
  {
    input: `
      for x on [50]:
        print(x)
    `,
    expectedCompilerError: PyErrorType.ForExpectedIn,
  },
  {
    input: `
      a = 10 20
    `,
    expectedCompilerError: PyErrorType.ExpectedBinaryOperator,
  },
  {
    input: `
      while:
        print('a')
    `,
    expectedCompilerError: PyErrorType.IncompleteWhileDefinition,
  },
  {
    input: `
      def:
        print('a')
    `,
    expectedCompilerError: PyErrorType.IncompleteFunctionDeclaration,
  },
  {
    input: `
      def 10():
        print('a')
    `,
    expectedCompilerError: PyErrorType.ExpectedFunctionName,
  },
  {
    input: `
      def func[]:
        print('a')
    `,
    expectedCompilerError: PyErrorType.ExpectedFunctionArgumentList,
  },
  {
    input: `
      def func(10):
        print('a')
    `,
    expectedCompilerError: PyErrorType.ExpectedArgumentName,
  },
  {
    input: `
      def func(a + 5):
        print('a')
    `,
    expectedCompilerError: PyErrorType.ExpectedArgumentName,
  },
  {
    input: `
      def func(a = 5 * 2
        print('a')
    `,
    expectedCompilerError: PyErrorType.IncompleteFunctionArgumentList,
  },
  {
    input: `
      def func(a = ):
        print('a')
    `,
    expectedCompilerError: PyErrorType.ExpectedExpressionValue,
  },
  {
    input: `
      def func(a = 10, b = 20):
        print(a, b)
        
      func()
    `,
    output: ['10 20'],
  },
  {
    input: `
      def func(a = 20 = 30):
        print('a')
    `,
    expectedCompilerError: PyErrorType.ExpectedEndOfFunctionDef,
  },
  {
    input: `
      class:
    `,
    expectedCompilerError: PyErrorType.IncompleteClassDeclaration,
  },
  {
    input: `
      class 10: pass
    `,
    expectedCompilerError: PyErrorType.ExpectedClassName,
  },
  {
    input: `
      class Test(10): pass
    `,
    expectedCompilerError: PyErrorType.IncorrectInheritanceList,
  },
  {
    input: `
      class Test(A + B): pass
    `,
    expectedCompilerError: PyErrorType.IncorrectInheritanceList,
  },
  {
    input: `
      class Test(A,
    `,
    expectedCompilerError: PyErrorType.IncorrectInheritanceList,
  },
  {
    input: `
      elif x > 3:
        print('x')
    `,
    expectedCompilerError: PyErrorType.CannotFindIfOrElifForElif,
  },
  {
    input: `
      try:
        print('a')
      elif x > 3:
        print('x')
    `,
    expectedCompilerError: PyErrorType.CannotFindIfOrElifForElif,
  },
  {
    input: `
      x = 10
      if x < 10:
        print('a')
      elif x 10:
        print('b')
    `,
    expectedCompilerError: PyErrorType.ExpectedBinaryOperator,
  },
  {
    input: 'import',
    expectedCompilerError: PyErrorType.IncompleteImportDefinition,
  },
  {
    input: 'import a b',
    expectedCompilerError: PyErrorType.ImportDefinitionIsTooLong,
  },
  {
    input: 'import 10',
    expectedCompilerError: PyErrorType.ImportExpectedIdentifier,
  },
  {
    input: 'import a as 10',
    expectedCompilerError: PyErrorType.ImportExpectedAsIdentifier,
  },
  {
    input: 'from x',
    expectedCompilerError: PyErrorType.IncompleteImportFromDefinition,
  },
  {
    input: 'from x import a b',
    expectedCompilerError: PyErrorType.ImportFromDefinitionIsTooLong,
  },
  {
    input: 'from x a b',
    expectedCompilerError: PyErrorType.ImportFromExpectedImport,
  },
  {
    input: 'from 10 import a',
    expectedCompilerError: PyErrorType.ImportFromExpectedIdentifier,
  },
  {
    input: 'from a import 10',
    expectedCompilerError: PyErrorType.ImportFromExpectedIdentifier,
    // onlyThis: true,
  },
  {
    input: `
      for a in [1, 2]:
        print(a)
        break a
    `,
    expectedCompilerError: PyErrorType.BreakHasNoArguments,
  },
  {
    input: `
      for a in [1, 2]:
        print(a)
        continue a
    `,
    expectedCompilerError: PyErrorType.ContinueHasNoArguments,
  },
  {
    input: 'pass 100',
    expectedCompilerError: PyErrorType.PassHasNoArguments,
  },
  {
    input: 'raise 10 20',
    expectedCompilerError: PyErrorType.ExpectedBinaryOperator,
  },
  {
    input: 'raise 10]',
    expectedCompilerError: PyErrorType.RaiseExpectedEndOfLine,
  },
  {
    input: `
      def func():
        return
      func()
    `,
    output: [],
  },
  {
    input: `
      def func():
        yield
      func()
    `,
    expectedCompilerError: PyErrorType.ExpectedYieldExpression,
  },
  {
    input: `
      def func():
        yield 10 20
      func()
    `,
    expectedCompilerError: PyErrorType.ExpectedBinaryOperator,
  },
  {
    input: `
      def func():
        yield 10]
      func()
    `,
    expectedCompilerError: PyErrorType.ReturnOrYieldExpectedEndOfLine,
  },
  {
    input: 'except:',
    expectedCompilerError: PyErrorType.ExceptExpectedTry,
  },
  {
    input: `
      try:
        raise NotImplementedError()
      except(NotImplementedError, PermissionError):
        print('ok')
    `,
    output: ['ok'],
  },
  {
    input: `
      a = 10
      a.exc = NotImplementedError
      try:
        raise NotImplementedError()
      except(a.exc, PermissionError):
        print('ok')
    `,
    output: ['ok'],
  },
  {
    input: `
      try:
        raise NotImplementedError()
      except 10:
        print('ok')
    `,
    expectedCompilerError: PyErrorType.ExceptExpectedIdentifier,
  },
  {
    input: `
      try:
        raise NotImplementedError()
      except E
        print('ok')
    `,
    expectedCompilerError: PyErrorType.BlockExpectedColon,
  },
  {
    input: `
      try:
        raise NotImplementedError()
      except (E
        print('ok')
    `,
    expectedCompilerError: PyErrorType.ExceptExpectedRightBracket,
  },
  {
    input: `
      try:
        raise NotImplementedError()
      except (E]
        print('ok')
    `,
    expectedCompilerError: PyErrorType.ExceptExpectedRightBracket,
  },
  {
    input: `
      try:
        raise SystemError()
      except Exception as e:
        print(e.type)
    `,
    output: [ExceptionType.SystemError.toString()],
  },
  {
    input: `
      try:
        raise NotImplementedError()
      except E as 10:
        print('ok')
    `,
    expectedCompilerError: PyErrorType.ExceptExpectedIdentifierAfterAs,
  },
  {
    input: `
      finally:
        print(10)
    `,
    expectedCompilerError: PyErrorType.FinallyCannotFindTry,
  },
  {
    input: `
      a = 10
      a += 10 += 20
    `,
    expectedCompilerError: PyErrorType.MixingAugmentedOperators,
  },
  {
    input: `
      del 10
    `,
    expectedCompilerError: PyErrorType.ExpectedIdentifierForDel,
  },
  {
    input: `
      del x.10
    `,
    expectedCompilerError: PyErrorType.ExpectedEndOfIdentifierForDel,
  },
  {
    input: `
      x = .
    `,
    expectedCompilerError: PyErrorType.ExpectedExpressionValue,
  },
  {
    input: `
      x = ;
    `,
    expectedCompilerError: PyErrorType.ExpectedExpressionValue,
  },
  {
    input: `
      x = def
    `,
    expectedCompilerError: PyErrorType.ExpectedLiteral,
  },
  {
    input: `
      x = +
    `,
    expectedCompilerError: PyErrorType.ExpectedUnaryOperatorOrArgument,
  },
  {
    input: `
      a = 10
      print(a < 20 if 5 else 6)
    `,
    output: ['5'],
  },
  {
    input: `
      a = 10
      print(a < 20 if 5)
    `,
    expectedCompilerError: PyErrorType.IfExpressionExpectedElse,
  },
  {
    input: `
      print(10 - 2 - 3)
    `,
    output: ['5'],
  },
  {
    input: `
      print(10 - 2 * 3)
    `,
    output: ['4'],
  },
  {
    input: `
      def func():
        pass
      
      func(10
    `,
    expectedCompilerError: PyErrorType.ExpectedEndOfFunctionCall,
  },
  {
    input: `
      def func():
        pass
      
      func(a=
    `,
    expectedCompilerError: PyErrorType.UnexpectedEndOfCall,
  },
  {
    input: `
      def func():
        pass
      
      func(a=10, b)
    `,
    expectedCompilerError: PyErrorType.OrderedArgumentAfterNamed,
  },
  {
    input: `
      a = [1, 2]
      print(a[1)
    `,
    expectedCompilerError: PyErrorType.ExpectedEndOfIndexer,
  },
  {
    input: `
      b = { 'test': 10 }
      a = { 'x': 0, 'y': b }
      print(a['y']['test'])
    `,
    output: ['10'],
  },
  {
    input: `
      a = []
      print(a)
    `,
    output: ['[]'],
  },
  {
    input: `
      a = [
    `,
    expectedCompilerError: PyErrorType.ExpectedListDefinition,
  },
  {
    input: `
      a = (
    `,
    expectedCompilerError: PyErrorType.ExpectedTupleBody,
  },
  {
    input: `
      b = (5, 7)
      print(b)
    `,
    output: ['(5, 7)'],
  },
  {
    input: `
      a = (5,3,10=
    `,
    expectedCompilerError: PyErrorType.ExpectedTupleEnd,
  },
  {
    input: `
      b = (5,)
      print(b)
    `,
    output: ['(5,)'],
  },
  {
    input: `
      b = (5)
      print(b)
    `,
    output: ['5'],
  },
  {
    input: `
      a = {
    `,
    expectedCompilerError: PyErrorType.ExpectedSetBody,
  },
  {
    input: `
      b = {}
      print(b)
    `,
    output: ['{}'],
  },
  {
    input: `
      b = {2, 3}
      print(b)
    `,
    output: ['{2, 3}'],
  },
  {
    input: `
      a = {'x': 10, 20}
    `,
    expectedCompilerError: PyErrorType.SetMixedWithAndWithoutColon,
  },
  {
    input: `
      a = {20, 'x': 10}
    `,
    expectedCompilerError: PyErrorType.SetMixedWithAndWithoutColon,
  },
  {
    input: `
      a = {10
    `,
    expectedCompilerError: PyErrorType.ExpectedSetEnd,
  },
  {
    input: `
      a = 10
\t  b = 20
      print(a, b)
    `,
    output: ['10 20'],
  },
  {
    input: `
      a = 10
          b = 20
        c = 30
    `,
    expectedCompilerError: PyErrorType.MismatchedIndent,
  },
  {
    input: `
      a = x ? y
    `,
    expectedCompilerError: PyErrorType.UnknownChar,
  },
  {
    input: `
      a = '''test'''
      print(a)
    `,
    output: ['test'],
  },
  {
    input: `
      a = '\\a\\\''
      print(a)
    `,
    output: ["'"],
  },
  {
    input: `
      print(~10)
    `,
    output: ['-11'],
  },
  {
    input: `
      try:
        raise BlockingIOError()
      except OSError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise ChildProcessError()
      except OSError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise ConnectionError()
      except OSError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise BrokenPipeError()
      except OSError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise ConnectionAbortedError()
      except OSError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise ConnectionRefusedError()
      except OSError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise ConnectionResetError()
      except OSError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise FileExistsError()
      except OSError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise FileNotFoundError()
      except OSError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise InterruptedError()
      except OSError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise IsADirectoryError()
      except OSError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise NotADirectoryError()
      except OSError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise PermissionError()
      except OSError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise ProcessLookupError()
      except OSError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise TimeoutError()
      except OSError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise FloatingPointError()
      except ArithmeticError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise OverflowError()
      except ArithmeticError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise ZeroDivisionError()
      except ArithmeticError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise ModuleNotFoundError()
      except ImportError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise UnboundLocalError()
      except NameError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise ConnectionAbortedError()
      except ConnectionError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise ConnectionRefusedError()
      except ConnectionError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise ConnectionResetError()
      except ConnectionError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise NotImplementedError()
      except RuntimeError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise RecursionError()
      except RuntimeError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise IndentationError()
      except SyntaxError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise TabError()
      except SyntaxError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise TabError()
      except IndentationError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise UnicodeError()
      except ValueError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise UnicodeDecodeError()
      except ValueError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise UnicodeEncodeError()
      except ValueError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise UnicodeTranslateError()
      except ValueError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise UnicodeDecodeError()
      except UnicodeError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise UnicodeEncodeError()
      except UnicodeError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      try:
        raise UnicodeTranslateError()
      except UnicodeError:
        print('caught')
    `,
    output: ['caught'],
  },
  {
    input: `
      a = [10]
      print(a['test'])
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      for x in range(1, 4, 2):
        print(x)
    `,
    output: ['1', '3'],
  },
  {
    input: `
      for x in range(3):
        print(x)
    `,
    output: ['0', '1', '2'],
  },
  {
    input: `
      for x in range(3, 4, 5, 6):
        print(x)
    `,
    expectedException: ExceptionType.FunctionArgumentCountMismatch,
  },
  {
    input: `
      for x in range(3, 4, 0):
        print(x)
    `,
    expectedException: ExceptionType.FunctionArgumentError,
  },
  {
    input: `
      for x in range(5, 2, -2):
        print(x)
    `,
    output: ['5', '3'],
  },
  {
    input: `
      print([2, 3])
    `,
    output: ['[2, 3]'],
  },
  {
    input: `
      max = 25

      for val in range(1, max):
        isPrime = True
        for n in range(2, val): 
          if (val % n) == 0: 
            isPrime = False
            break
        if isPrime:
          print(val)
    `,
    output: ['1', '2', '3', '5', '7', '11', '13', '17', '19', '23'],
  },
  {
    input: `
      for x in [1, 5, 6]:
        if x == 5:
          print('found')
          break
      else:
        print('not found')
      for x in [1, 5, 6]:
        if x == 3:
          print('found')
          break
      else:
        print('not found')
    `,
    output: ['found', 'not found'],
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
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['x'],
  },
  {
    input: `
      x = 10
      try:
        1/0
      except SystemException as x:
        print(x)
      except: pass
      print(x)
    `,
    output: ['10'],
  },
  {
    input: `
      for x in ['a', 'b']:
        try:
          print(x)
          1/0
        except:
          print(2)
          continue
        print(3)
    `,
    output: ['a', '2', 'b', '2'],
  },
  {
    input: `
      try:
        for x in ['a', 'b']:
          try:
            print(x)
            1/0
          finally:
            print(2)
            continue
          print(3)
      except: pass
    `,
    output: ['a', '2', 'b', '2'],
  },
  {
    input: `
      for x in ['a', 'b']:
        try:
          print(x)
          1/0
        except:
          print(2)
          break
        print(3)
    `,
    output: ['a', '2'],
  },
  {
    input: `
      x = lambda x, y: x * y
      print(x(20, 30))
    `,
    output: ['600'],
  },
  {
    input: `
      def fib(n):
        a, b = 0, 1
        while a < n:
          print(a, end=' ')
          a, b = b, a + b
        print()
      fib(2000)
    `,
    output: ['0 1 1 2 3 5 8 13 21 34 55 89 144 233 377 610 987 1597 '],
  },
  {
    input: `
      def func():
        """line1
line2"""
        print('call')
      print(func.__doc__)
    `,
    output: ['line1', 'line2'],
  },
  {
    input: `
      try:
        try:
          print(1)
        else:
          print(2)
          1/0
        except:
          print(3)
        print(4)
      except:
        print(5)
    `,
    output: ['1', '2', '5'],
  },
  {
    input: `
      class ContextManager:
          def __init__(self, name):
              self.name = name
      
          def __enter__(self):
              print('entered')
              return self
      
          def __exit__(self, exc_type, exc_value, traceback):
              if exc_type:
                print('left with exception')
              else:
                print('left, no exception')
      
          def test(self):
              print('inside')
      
      
      with ContextManager('a') as c:
          c.test()
      
      try:
          with ContextManager('b') as x:
              x.test()
              1 / 0
      except:
          print('caught')
      
      print(x.name)
    `,
    output: [
      'entered', //
      'inside',
      'left, no exception',
      'entered',
      'inside',
      'left with exception',
      'caught',
      'b',
    ],
  },
  {
    input: `
      class ContextManager:
          def __init__(self, name):
              self.name = name
      
          def __enter__(self):
              print('entered')
              return self
      
          def __exit__(self, exc_type, exc_value, traceback):
              if exc_type:
                print('left with exception')
              else:
                print('left, no exception')
              return True
      
          def test(self):
              print('inside')
      
      
      with ContextManager('a') as c:
          c.test()
      
      try:
          with ContextManager('b') as x:
              x.test()
              1 / 0
      except:
          print('caught')
      
      print(x.name)
    `,
    output: [
      'entered', //
      'inside',
      'left, no exception',
      'entered',
      'inside',
      'left with exception',
      'b',
    ],
  },
  {
    input: `
      a = 'test'
      print(len(a))
    `,
    output: ['4'],
  },
  {
    input: `
      class WithLen:
        def __len__(self):
          return 5
      
      a = WithLen()
      print(len(a))
    `,
    output: ['5'],
  },
  {
    input: `
      a = 'test'
      print(a['x'])
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      a = b'1122'
      print(a)
    `,
    output: ["b'1122'"],
  },
  {
    input: `
      a = { 10, 20 }
      for x in a:
        print(x)
      print (10 in a)
    `,
    output: ['10', '20', 'True'],
  },
  {
    input: `
      a = ['abc', 'def']
      print('abc' in a)
      print(10 in a)
    `,
    output: ['True', 'False'],
  },
  {
    input: `
      a = ('abc', 'def')
      print('abc' in a)
      print(10 in a)
      print(a)
    `,
    output: ['True', 'False', "('abc', 'def')"],
  },
  {
    input: `
      a = { 'abc': 10, 'def': 10 }
      print('abc' in a)
      print(10 in a)
      print(a)
      print(len(a))
    `,
    output: ['True', 'False', "{'abc': 10, 'def': 10}", '2'],
  },
  {
    input: `
      a = 'test'
      print(a[2])
      print(a if 1 else 2)
    `,
    output: ['s', '1'],
  },
  {
    input: `
      a = { 'x': 10, 'y': 20 }
      print(a['x'])
    `,
    output: ['10'],
  },
  {
    input: `
      a = [10, '20']
      print(a[0])
      print(a if 1 else 2)
      print(a)
    `,
    output: ['10', '1', "[10, '20']"],
  },
  {
    input: `
      def func():
        print('test')
        
      print(func.__name__)
    `,
    output: ['func'],
  },
  {
    input: `
      def func():
        print('test')
        
      print(func.__name)
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['__name'],
  },
  {
    input: `
      x = 10
      def func1():
        nonlocal x
        x = 20
      def func2():
        x = 30
      def func3():
        global y
        y = 40
      func1()
      print(x)
      func2()
      print(x)
      func3()
      print(y)
    `,
    output: ['20', '20', '40'],
  },
  {
    input: `
      n = -37
      n.bit_length()
    `,
    // TBD: binary operations aren't supported
    // output: ['-0b100101', '6'],
    expectedException: ExceptionType.NotImplementedError,
    exceptionArgs: ['bit_length'],
  },
  {
    input: `
      print((1024).to_bytes(2, byteorder='big'))
      print((1024).to_bytes(10, byteorder='big'))
      print((-1024).to_bytes(10, byteorder='big', signed=True))
      x = 1000
      print(x.to_bytes((x.bit_length() + 7) // 8, byteorder='little'))
    `,
    expectedException: ExceptionType.NotImplementedError,
    exceptionArgs: ['to_bytes'],
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
    expectedException: ExceptionType.NotImplementedError,
    exceptionArgs: ['from_bytes'],
  },
  {
    input: `
      # print((3.12).hex())
      print(float.fromhex('0x1.8f5c28f5c28f6p+1'))
    `,
    // TBD: binary operations aren't supported
    // output: ["'0x1.8f5c28f5c28f6p+1'", '3.12'],
    expectedException: ExceptionType.NotImplementedError,
    exceptionArgs: ['fromhex'],
  },
  {
    input: `
      print(hash(30.2) == hash(30.2))
    `,
    // TBD: hash operations aren't supported
    // output: ['True'],
    expectedException: ExceptionType.NotImplementedError,
    exceptionArgs: ['hash'],
  },
  {
    input: `
      print((2, 3) * 3)
      print([2, 3] * 3)
      print('abc' * 3)
    `,
    output: ['(2, 3, 2, 3, 2, 3)', '[2, 3, 2, 3, 2, 3]', 'abcabcabc'],
  },
  {
    input: `
      a = [(x, y) for x in [1,2,3] for y in [3,1,4] if x != y]
      print(a)
    `,
    output: ['[(1, 3), (1, 4), (2, 3), (2, 1), (2, 4), (3, 1), (3, 4)]'],
  },
  {
    input: `
      s = (1,2,3,4,5)
      print(s[2:3])
      print(s[1:3])
    `,
    output: ['(3,)', '(2, 3)'],
  },
  {
    input: `
      s = (1,2,3,4,5,6,7)
      print(s[2:7:2])
    `,
    output: ['(3, 5, 7)'],
  },
  {
    input: `
      s = [1,2,3]*4
      print(s.index(2, 4, 5))
    `,
    output: ['4'],
  },
  {
    input: `
      s = (1,2,3)*4
      print(s.index(2, 4, 5))
    `,
    output: ['4'],
  },
  {
    input: `
      s = (1,2,3)*4
      print(s.index(2, 5, 6))
    `,
    expectedException: ExceptionType.ValueError,
  },
  {
    input: `
      lists = [[]]*3
      lists[0].append(3)
      print(lists)
    `,
    output: ['[[3], [3], [3]]'],
  },
  //   {
  //     input: `
  //       a = 'test'
  //       print(a.capitalize())
  //       print(a.center(20, '-'))
  //       print('abc def def de'.count('de', 6, 13))
  //       print('abcdef'.endswith('ef'))
  //       print('abcdefabcdef'.find('cd', 5))
  //       print('abcdefabcdef'.find('cd', 5, 7))
  //       print("The sum of 1 + 2 is {0}".format(1+2))
  //       print('abcdef'.index('cd', 0, 5))
  //       print('ab10'.isalnum())
  //       print('ab-10'.isalnum())
  //       print('ab10'.isalpha())
  //       print('abc'.isalpha())
  //       print('abc'.isascii())
  //       print('你好，世界'.isascii())
  //       print('123'.isdecimal())
  //       print('ab12'.isdecimal())
  //       print('123'.isidentifier())
  //       print('a123'.isidentifier())
  //       print('Abc'.islower())
  //       print('abc'.islower())
  //       print('123'.isnumeric())
  //       print('abc'.isprintable())
  //       print('abc\\ndef'.isprintable())
  //       print('   '.isspace())
  //       print(' \t'.isspace())
  //       print('Title'.istitle())
  //       print('title'.istitle())
  //       print('ABC'.isupper())
  //       print('Abc'.isupper())
  //       print(':'.join(['abc','def']))
  //       print('ABC'.ljust(10, '-'))
  //       print('ABC'.ljust(2, '-'))
  //       print('Abc'.lower())
  //       print('www.example.com'.lstrip('cmowz.'))
  //       print('   spacious   '.lstrip())
  //       print('abcdefabcdef'.partition('cd'))
  //       print('abcdefabcdef'.replace('def', '-', 1))
  //       print('abcdefabcdef'.rfind('d'))
  //       print('abcdefabcdef'.rindex('d'))
  //       print('ABC'.rjust(20, '-'))
  //       print('abcdefabcdef'.rpartition('cd'))
  //       print('ab cd ef ab cd ef'.rsplit())
  //       print('ab-cd-ef ab-cd ef'.rsplit('-', 1))
  //       print('mississippi'.rstrip('ipz'))
  //       print('1,2,3'.split(',', maxsplit=1))
  //       print('1,2,,3,'.split(','))
  //       print('   1   2   3   '.split())
  //       print('ab c\\n\\nde fg\\rkl\\r\\n'.splitlines())
  //       print('abcd'.startswith('ab'))
  //       print('www.example.com'.strip('cmowz.'))
  //       print('Abc'.swapcase())
  //       print('Hello world'.title())
  //       print('Abc'.upper())
  //       print('-42'.zfill(5))
  //       print(print('%(language)s has %(number)03d quote types.' % {'language': "Python", "number": 2}))
  //       print("%s's bowling scores were %s"  % ('Ross', [190, 135]))
  //     `,
  //     output: [
  //       'Test',
  //       '--------test--------',
  //       '1',
  //       'True',
  //       '8',
  //       '-1',
  //       'The sum of 1 + 2 is 3',
  //       '2',
  //       'True',
  //       'False',
  //       'False',
  //       'True',
  //       'True',
  //       'False',
  //       'True',
  //       'False',
  //       'False',
  //       'True',
  //       'False',
  //       'True',
  //       'True',
  //       'True',
  //       'False',
  //       'True',
  //       'True',
  //       'True',
  //       'False',
  //       'True',
  //       'False',
  //       'abc:def',
  //       'ABC-------',
  //       'ABC',
  //       'abc',
  //       'example.com',
  //       'spacious',
  //       "('ab', 'cd', 'efabcdef')",
  //       'abc-abcdef',
  //       '9',
  //       '9',
  //       '-----------------ABC',
  //       "('abcdefab', 'cd', 'ef')",
  //       "['ab', 'cd', 'ef', 'ab', 'cd', 'ef']",
  //       "['ab-cd-ef ab', 'cd ef']",
  //       'mississ',
  //       "['1', '2,3']",
  //       "['1', '2', '', '3', '']",
  //       "['1', '2', '3']",
  //       "['ab c', '', 'de fg', 'kl']",
  //       'True',
  //       'example',
  //       'aBC',
  //       'Hello World',
  //       'ABC',
  //       '-0042',
  //       'Python has 002 quote types.',
  //       'None',
  //       "Ross's bowling scores were [190, 135]",
  //     ],
  //   },
  //   {
  //     input: `
  //       print(b'\\xf0\\xf1\\xf2'.hex())
  //       print(bytes.fromhex('2Ef0 F1f2  '))
  //       print(bytes('Test', 'utf-8'))
  //       print(bytearray.fromhex('2Ef0 F1f2  '))
  //       print(bytearray(b'\xf0\xf1\xf2').hex())
  //     `,
  //     output: [
  //       'f0f1f2',
  //       "'b'.\\xf0\\xf1\\xf2'",
  //       "b'Test'",
  //       "bytearray(b'.\\xf0\\xf1\\xf2')",
  //       'f0f1f2',
  //     ],
  //   },
  //   {
  //     input: `
  //       print(set([1,2,3]))
  //       print(set('abc'))
  //       print(frozenset([1,2,3]))
  //       print(len({1,2,3}))
  //       print(10 in {10, 20, 30})
  //       print({10,20}.isdisjoint({30,40}))
  //       print({10,20}.isdisjoint({20,30}))
  //       print({10,20}.issubset({10,20,30}))
  //       print({10,20} < {10,20,30})
  //       print({10,20} <= {10,20,30})
  //       print({10,20} <= {10,20})
  //       print({10,20,30}.issuperset({10,20}))
  //       print({10,20,30} > {10,20})
  //       print({10,20,30} >= {10,20})
  //       print({10,20} >= {10,20})
  //       print({10,20}.union({20,30}))
  //       print({10,20} | {20,30})
  //       print({10,20}.intersection({20,30}))
  //       print({10,20} & {20,30})
  //       print({10,20}.difference({20,30}))
  //       print({10,20} - {20,30})
  //       print({10,20}.symmetric_difference({20,30}))
  //       print({10,20} ^ {20,30})
  //       print(set([10,20]).issubset([10,20,30]))
  //       print(set('abc') == frozenset('abc'))
  //       print({'c','b','a'} == {'c','a','b'})
  //     `,
  //     output: [
  //       '{1, 2, 3}',
  //       "{'a', 'b', 'c'}",
  //       'frozenset({1, 2, 3})',
  //       '3',
  //       'True',
  //       'True',
  //       'False',
  //       'True',
  //       'True',
  //       'True',
  //       'True',
  //       'True',
  //       'True',
  //       'True',
  //       'True',
  //       '{10, 20, 30}',
  //       '{10, 20, 30}',
  //       '{20}',
  //       '{20}',
  //       '{10}',
  //       '{10}',
  //       '{10, 30}',
  //       '{10, 30}',
  //       'True',
  //       'True',
  //       'True',
  //     ],
  //   },
  //   {
  //     input: `
  //           print([10,20] <= [10,20,30])
  //     `,
  //     expectedException: ExceptionType.TypeError,
  //   },
  //   {
  //     input: `
  //       a = {1,2}
  //       a.add(3)
  //       print(a)
  //       a.remove(1)
  //       print(a)
  //       a.discard(2)
  //       a.update({5,6})
  //       print(a)
  //       a.clear()
  //       print(a)
  //     `,
  //     output: [
  //       '{1, 2, 3}', //
  //       '{2, 3}',
  //       '{3}',
  //       '{3, 5, 6}',
  //       '{}',
  //     ],
  //   },
  //   {
  //     input: `
  //       a = dict(one=1, two=2, three=3)
  //       print(a)
  //       print(len(a))
  //       print(a['one'])
  //       a['four'] = 4
  //       print(a)
  //       print('one' in a)
  //       print('five' in a)
  //       for b in iter(a):
  //         print(b)
  //       a.pop('two')
  //       for b in iter(a.keys()):
  //         print(b)
  //       print(a.get('three'))
  //       print(a.popitem())
  //       print(a)
  //       a.clear()
  //       print(len(a))
  //     `,
  //     output: [
  //       "{'one': 1, 'two': 2, 'three': 3}",
  //       '3',
  //       '1',
  //       "{'one': 1, 'two': 2, 'three': 3, 'four': 4}",
  //       'True',
  //       'False',
  //       'one',
  //       'two',
  //       'three',
  //       'four',
  //       'one',
  //       'three',
  //       'four',
  //       '3',
  //       "('four', 4)",
  //       "{'one': 1, 'three': 3}",
  //       '0',
  //     ],
  //   },
  //   {
  //     input: `
  //       dishes = {'eggs': 2, 'sausage': 1, 'bacon': 1, 'spam': 500}
  //       keys = dishes.keys()
  //       values = dishes.values()
  //       print(len(values))
  //       n = 0
  //       for val in values: n += val
  //       print(n)
  //       print(list(keys))
  //       print(list(values))
  //       del dishes['eggs']
  //       del dishes['sausage']
  //       print(list(keys))
  //       print(keys & {'eggs', 'bacon', 'salad'})
  //       print(keys ^ {'sausage', 'juice'})
  //     `,
  //     output: [
  //       '4',
  //       '504',
  //       "['eggs', 'sausage', 'bacon', 'spam']",
  //       '[2, 1, 1, 500]',
  //       "['bacon', 'spam']",
  //       "{'bacon'}",
  //       "{'spam', 'sausage', 'juice', 'bacon'}",
  //     ],
  //   },
  //   {
  //     input: `
  //       class Parent: pass
  //       class Child(Parent): pass
  //       p = Parent()
  //       c = Child()
  //       print(p.__class__ == Parent)
  //       print(c.__class__ == Child)
  //       print(p.__class__.__name__)
  //       def func(): pass
  //       f = func
  //       print(f.__name__)
  //     `,
  //     output: [
  //       'True', //
  //       'True',
  //       'Parent',
  //       'func',
  //     ],
  //   },
];

export default scenarios;
