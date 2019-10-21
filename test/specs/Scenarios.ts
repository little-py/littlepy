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
        a = 330
        b = 200
        if b > a:
          print("b is greater than a")
        elif b < a:
          print("a is greater than b")
        else:
          print("equal")
      `,
    output: ['a is greater than b'],
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
    `,
    output: ['True'],
  },
  {
    input: `
      a = 10
      b = 10
      print(a is b)
    `,
    output: ['False'],
  },
  {
    input: `
      a = 10
      print(a is a)
    `,
    output: ['True'],
  },
  {
    input: `
      a = 10
      b = 10
      print(a is not b)
    `,
    output: ['True'],
  },
  {
    input: `
      a = 10
      b = 10
      print(a != b)
    `,
    output: ['False'],
  },
  {
    input: `
      a = 10
      b = 10
      print(a == b)
    `,
    output: ['True'],
  },
  {
    input: `
      a = 10
      c = 20
      print(a != c)
    `,
    output: ['True'],
  },
  {
    input: `
      print(10 <= 10)
    `,
    output: ['True'],
  },
  {
    input: `
      print(10 < 10)
    `,
    output: ['False'],
  },
  {
    input: `
      print(20 > 10)
    `,
    output: ['True'],
  },
  {
    input: `
      print(20 < 10)
    `,
    output: ['False'],
  },
  {
    input: `
      print(10 > 10)
    `,
    output: ['False'],
  },
  {
    input: `
      print(10 >= 10)
    `,
    output: ['True'],
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
      a = 1
      if not a >= 0:
        print('1')
      else:
        print('2')
    `,
    output: ['2'],
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
    expectedCompilerError: PyErrorType.ExpectedBinaryOperator,
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
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['event'],
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
    expectedException: ExceptionType.FunctionTooManyArguments,
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
        for x in [2]:
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
      except a.
        print('ok')
    `,
    expectedCompilerError: PyErrorType.ExceptExpectedIdentifier,
  },
  {
    input: `
      try:
        raise NotImplementedError()
      except x as
        print('ok')
    `,
    expectedCompilerError: PyErrorType.ExceptExpectedIdentifierAfterAs,
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
    expectedException: ExceptionType.ReferenceError,
  },
  {
    input: `
      del
    `,
    expectedCompilerError: PyErrorType.ExpectedIdentifierForDel,
  },
  {
    input: `
      with 1
    `,
    expectedCompilerError: PyErrorType.WithExpectedAs,
  },
  {
    input: `
      with
    `,
    expectedCompilerError: PyErrorType.ExpectedExpressionValue,
  },
  {
    input: `
      nonlocal
    `,
    expectedCompilerError: PyErrorType.ExpectedOnlyIdentifier,
  },
  {
    input: `
      a =
    `,
    expectedCompilerError: PyErrorType.ExpectedExpressionValue,
  },
  {
    input: `
      a = 20
      del a
      print(a)
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['a'],
  },
  {
    input: `
      a = 20
      del a
      del a
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['a'],
  },
  {
    input: `
      a = [20]
      del a['x']
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      a = [20]
      del a[0]
      print(a)
    `,
    output: ['[]'],
  },
  {
    input: `
      del x.10
    `,
    expectedCompilerError: PyErrorType.ExpectedBinaryOperator,
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
      class Test:
        """line1
line2"""
        pass
      print(Test.__doc__)
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
      print(s[1:3][0])
      print(s[3:2:-1][0])
    `,
    output: ['(3,)', '(2, 3)', '2', '4'],
  },
  {
    input: `
      s = [1,2,3,4,5]
      print(s[2:3])
      print(s[1:3])
      print(s[1:3][0])
      print(s[3:2:-1][0])
    `,
    output: ['[3]', '[2, 3]', '2', '4'],
  },
  {
    input: `
      s = (1,2,3,4,5)
      print(s['a'])
    `,
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['a'],
  },
  {
    input: `
      s = (1,2,3,4,5)
      print(s['a'][0])
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      s = [1,2,3,4,5]
      print(s['a'][0])
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      s = { 'first': 10, 'second': 20 }
      print(s[10][0])
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      s = (1,2,3,4,5)
      print(s[1:3:0][0])
    `,
    expectedException: ExceptionType.FunctionArgumentError,
  },
  {
    input: `
      s = (1,2,3,4,5)
      print(s['a':3:0][0])
    `,
    expectedException: ExceptionType.TypeError,
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
      s = (1,2,3,4,5,6,7)
      print(s[5:2:-2])
    `,
    output: ['(6, 4)'],
  },
  {
    input: `
      s = [1,2,3,4,5,6,7]
      print(s[5:2:-2])
    `,
    output: ['[6, 4]'],
  },
  {
    input: `
      s = (1,2,3,4,5,6,7)
      print(s[2:7:0])
    `,
    expectedException: ExceptionType.FunctionArgumentError,
  },
  {
    input: `
      s = [1,2,3,4,5,6,7]
      print(s[2:7:2])
    `,
    output: ['[3, 5, 7]'],
  },
  {
    input: `
      s = [1,2,3,4,5,6,7]
      s[2:5] = [8,8,8]
      print(s)
    `,
    output: ['[1, 2, 8, 8, 8, 6, 7]'],
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
  {
    input: `
      print('test'.capitalize())
    `,
    output: ['Test'],
  },
  {
    input: `
      print('test'.center(20, '-'))
    `,
    output: ['--------test--------'],
  },
  {
    input: `
      print('test'.center('a', '-'))
    `,
    expectedException: ExceptionType.TypeError,
    exceptionArgs: ['width'],
  },
  {
    input: `
      print('test'.center(20, 10))
    `,
    expectedException: ExceptionType.TypeError,
    exceptionArgs: ['fillchar'],
  },
  {
    input: `
      print('abc def def de'.count('de', 6, 13))
    `,
    output: ['1'],
  },
  {
    input: `
      print('abcdef'.endswith('ef'))
    `,
    output: ['True'],
  },
  {
    input: `
      print('abcdefabcdef'.find('cd', 5))
    `,
    output: ['8'],
  },
  {
    input: `
      print('abcdefabcdef'.find('cd', 5, 7))
    `,
    output: ['-1'],
  },
  {
    input: `
      print("The sum of 1 + 2 is {0}".format(1+2))
    `,
    output: ['The sum of 1 + 2 is 3'],
  },
  {
    input: `
      print('abcdef'.index('cd', 0, 5))
    `,
    output: ['2'],
  },
  {
    input: `
      print('ab10'.isalnum())
    `,
    output: ['True'],
  },
  {
    input: `
      print('ab-10'.isalnum())
    `,
    output: ['False'],
  },
  {
    input: `
      print('ab10'.isalpha())
    `,
    output: ['False'],
  },
  {
    input: `
      print('abc'.isalpha())
    `,
    output: ['True'],
  },
  {
    input: `
      print('abc'.isascii())
    `,
    output: ['True'],
  },
  {
    input: `
      print('你好，世界'.isascii())
    `,
    output: ['False'],
  },
  {
    input: `
      print('123'.isdecimal())
    `,
    output: ['True'],
  },
  {
    input: `
      print('ab12'.isdecimal())
    `,
    output: ['False'],
  },
  {
    input: `
      print('123'.isidentifier())
    `,
    output: ['False'],
  },
  {
    input: `
      print('a123'.isidentifier())
    `,
    output: ['True'],
  },
  {
    input: `
      print('Abc'.islower())
    `,
    output: ['False'],
  },
  {
    input: `
      print('abc'.islower())
    `,
    output: ['True'],
  },
  {
    input: `
      print('123'.isnumeric())
    `,
    output: ['True'],
  },
  {
    input: `
      print('abc'.isprintable())
    `,
    output: ['True'],
  },
  {
    input: `
      print('abc\\ndef'.isprintable())
    `,
    output: ['False'],
  },
  {
    input: `
      print('   '.isspace())
    `,
    output: ['True'],
  },
  {
    input: `
      print(' \t'.isspace())
    `,
    output: ['True'],
  },
  {
    input: `
      print('Title'.istitle())
    `,
    output: ['True'],
  },
  {
    input: `
      print('title'.istitle())
    `,
    output: ['False'],
  },
  {
    input: `
      print('ABC'.isupper())
    `,
    output: ['True'],
  },
  {
    input: `
      print('Abc'.isupper())
    `,
    output: ['False'],
  },
  {
    input: `
      print('AB2'.isupper())
    `,
    output: ['True'],
  },
  {
    input: `
      print(':'.join(['abc','def']))
    `,
    output: ['abc:def'],
  },
  {
    input: `
      print('ABC'.ljust(10, '-'))
    `,
    output: ['ABC-------'],
  },
  {
    input: `
      print('ABC'.ljust(2, '-'))
    `,
    output: ['ABC'],
  },
  {
    input: `
      print('Abc'.lower())
    `,
    output: ['abc'],
  },
  {
    input: `
      print('www.example.com'.lstrip('cmowz.'))
    `,
    output: ['example.com'],
  },
  {
    input: `
      print('   spacious   '.lstrip())
    `,
    output: ['spacious   '],
  },
  {
    input: `
      print('abcdefabcdef'.partition('cd'))
    `,
    output: ["('ab', 'cd', 'efabcdef')"],
  },
  {
    input: `
      print('abcdefabcdef'.replace('def', '-', 1))
    `,
    output: ['abc-abcdef'],
  },
  {
    input: `
      print('abcdefabcdef'.rfind('d'))
    `,
    output: ['9'],
  },
  {
    input: `
      print('abcdefabcdef'.rindex('d'))
    `,
    output: ['9'],
  },
  {
    input: `
      print('ABC'.rjust(20, '-'))
    `,
    output: ['-----------------ABC'],
  },
  {
    input: `
      print('abcdefabcdef'.rpartition('cd'))
    `,
    output: ["('abcdefab', 'cd', 'ef')"],
  },
  {
    input: `
      print('ab cd ef ab cd ef'.rsplit())
    `,
    output: ["['ab', 'cd', 'ef', 'ab', 'cd', 'ef']"],
  },
  {
    input: `
      print('ab-cd-ef ab-cd ef'.rsplit('-', 1))
    `,
    output: ["['ab-cd-ef ab', 'cd ef']"],
  },
  {
    input: `
      print('mississippi'.rstrip('ipz'))
    `,
    output: ['mississ'],
  },
  {
    input: `
      print('1,2,3'.split(',', maxsplit=1))
    `,
    output: ["['1', '2,3']"],
  },
  {
    input: `
      print('1,2,,3,'.split(','))
    `,
    output: ["['1', '2', '', '3', '']"],
  },
  {
    input: `
      print('   1   2   3   '.split())
    `,
    output: ["['1', '2', '3']"],
  },
  {
    input: `
      print('ab c\\n\\nde fg\\rkl\\r\\n'.splitlines())
    `,
    output: ["['ab c', '', 'de fg', 'kl']"],
  },
  {
    input: `
      print('abcd'.startswith('ab'))
    `,
    output: ['True'],
  },
  {
    input: `
      print('www.example.com'.strip('cmowz.'))
    `,
    output: ['example'],
  },
  {
    input: `
      print('Abc'.swapcase())
    `,
    output: ['aBC'],
  },
  {
    input: `
      print('Hello world'.title())
    `,
    output: ['Hello World'],
  },
  {
    input: `
      print('Abc'.upper())
    `,
    output: ['ABC'],
  },
  {
    input: `
      print('-42'.zfill(5))
    `,
    output: ['-0042'],
  },
  {
    input: `
      print('%(language)s has %(number)03d quote types.' % {'language': "Python", "number": 2})
    `,
    output: ['Python has 002 quote types.'],
  },
  {
    input: `
      print('%(language)s has %(number)3.2f quote types.' % {'language': "Python", "number": 2.14})
    `,
    output: ['Python has 2.14 quote types.'],
  },
  {
    input: `
      print('%(language)s has %(number)3.4f quote types.' % {'language': "Python", "number": 2.14})
    `,
    output: ['Python has 2.1400 quote types.'],
  },
  {
    input: `
      print('%(language)s has %(number)3.2f quote types.' % {'language': "Python", "number": 2.1415})
    `,
    output: ['Python has 2.14 quote types.'],
  },
  {
    input: `
      print("%s's bowling scores were %s" % ('Ross', [190, 135]))
    `,
    output: ["Ross's bowling scores were [190, 135]"],
  },
  // Byte operations are not supported
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
  {
    input: `
      print(set([1,2,3]))
    `,
    output: ['{1, 2, 3}'],
  },
  {
    input: `
      print(set('abc'))
    `,
    output: ["{'a', 'b', 'c'}"],
  },
  {
    input: `
      print(frozenset([1,2,3,'4']))
    `,
    output: ["frozenset({1, 2, 3, '4'})"],
  },
  {
    input: `
      print(len({1,2,3}))
    `,
    output: ['3'],
  },
  {
    input: `
      print(10 in {10, 20, 30})
    `,
    output: ['True'],
  },
  {
    input: `
      print(40 in {10, 20, 30})
    `,
    output: ['False'],
  },
  {
    input: `
      print({10,20}.isdisjoint({30,40}))
    `,
    output: ['True'],
  },
  {
    input: `
      print(frozenset({10,20}).isdisjoint({30,40}))
    `,
    output: ['True'],
  },
  {
    input: `
      print(frozenset({10,20}).isdisjoint(50))
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      print({10,20}.isdisjoint({20,30}))
    `,
    output: ['False'],
  },
  {
    input: `
      print({10,20}.issubset({10,20,30}))
    `,
    output: ['True'],
  },
  {
    input: `
      print({20,40}.issubset({10,20,30}))
    `,
    output: ['False'],
  },
  {
    input: `
      print({10,20} < {10,20,30})
    `,
    output: ['True'],
  },
  {
    input: `
      print({10,20} <= {10,20,30})
    `,
    output: ['True'],
  },
  {
    input: `
      print({10,20} <= {10,20})
    `,
    output: ['True'],
  },
  {
    input: `
      print({10,20,30}.issuperset({10,20}))
    `,
    output: ['True'],
  },
  {
    input: `
      print(frozenset({10,20,30}).issuperset({10,20}))
    `,
    output: ['True'],
  },
  {
    input: `
      print(frozenset({10,20,30}).issuperset(5))
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      print({10,20,30} > {10,20})
    `,
    output: ['True'],
  },
  {
    input: `
      print({10,20,30} >= {10,20})
    `,
    output: ['True'],
  },
  {
    input: `
      print({10,20} >= {10,20})
    `,
    output: ['True'],
  },
  {
    input: `
      print({10,20}.union({20,30}))
    `,
    output: ['{10, 20, 30}'],
  },
  {
    input: `
      print({10,20}.union(1))
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      print(frozenset({10,20}).union({20,30}))
    `,
    output: ['frozenset({10, 20, 30})'],
  },
  {
    input: `
      print(frozenset({10,20}).union(10))
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      print({10,20} | {20,30})
    `,
    output: ['{10, 20, 30}'],
  },
  {
    input: `
      print({10,20}.intersection({20,30}))
    `,
    output: ['{20}'],
  },
  {
    input: `
      print({1.2}.intersection({2}))
    `,
    output: ['{}'],
  },
  {
    input: `
      print({10,20}.intersection(1))
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      print(frozenset({10,20}).intersection({20,30}))
    `,
    output: ['frozenset({20})'],
  },
  {
    input: `
      print(frozenset({10,20}).intersection(10))
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      print({10,20} & {20,30})
    `,
    output: ['{20}'],
  },
  {
    input: `
      print({10,20}.difference({20,30}))
    `,
    output: ['{10}'],
  },
  {
    input: `
      print({10,20}.difference(1))
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      print(frozenset({10,20}).difference({20,30}))
    `,
    output: ['frozenset({10})'],
  },
  {
    input: `
      print(frozenset({10,20}).difference(1))
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      print({10,20} - {20,30})
    `,
    output: ['{10}'],
  },
  {
    input: `
      print({10,20}.symmetric_difference({20,30}))
    `,
    output: ['{10, 30}'],
  },
  {
    input: `
      print({10,20}.symmetric_difference(1))
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      print(frozenset({10,20}).symmetric_difference({20,30}))
    `,
    output: ['frozenset({10, 30})'],
  },
  {
    input: `
      print(frozenset({10,20}).symmetric_difference(10))
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      print({10,20} ^ {20,30})
    `,
    output: ['{10, 30}'],
  },
  {
    input: `
      print(set([10,20]).issubset([10,20,30]))
    `,
    output: ['True'],
  },
  {
    input: `
      print(frozenset([10,20]).issubset([10,20,30]))
    `,
    output: ['True'],
  },
  {
    input: `
      print(frozenset([10,20]).issubset(19))
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      print(set('abc') == frozenset('abc'))
    `,
    output: ['True'],
  },
  {
    input: `
      print({'c','b','a'} == {'c','a','b'})
    `,
    output: ['True'],
  },
  {
    input: `
      print([10,20] <= [10,20,30])
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      a = {1,2}
      a.add(1)
      print(a)
      a.add(3)
      print(a)
      a.remove(1)
      print(a)
      a.discard(2)
      print(a)
      a.update({5,6})
      print(a)
      a.clear()
      print(a)
    `,
    output: [
      '{1, 2}', //
      '{1, 2, 3}',
      '{2, 3}',
      '{3}',
      '{3, 5, 6}',
      '{}',
    ],
  },
  {
    input: `
      iter(10)
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      a = dict(one=1, two=2, three=3)
      print(a)
      print(len(a))
      print(a['one'])
      a['four'] = 4
      print(a)
      print('one' in a)
      print('five' in a)
      for b in iter(a):
        print(b)
      a.pop('two')
      for b in iter(a.keys()):
        print(b)
      print(a.get('three'))
      print(a.popitem())
      print(a)
      a.clear()
      print(len(a))
    `,
    output: [
      "{'one': 1, 'two': 2, 'three': 3}",
      '3',
      '1',
      "{'one': 1, 'two': 2, 'three': 3, 'four': 4}",
      'True',
      'False',
      'one',
      'two',
      'three',
      'four',
      'one',
      'three',
      'four',
      '3',
      "('four', 4)",
      "{'one': 1, 'three': 3}",
      '0',
    ],
  },
  // {
  //   input: `
  //   `,
  //   output: [],
  // },
  {
    input: `
      dishes = {'eggs': 2, 'sausage': 1, 'bacon': 1, 'spam': 500}
      keys = dishes.keys()
      values = dishes.values()
      print(len(values))
      n = 0
      for val in values: n += val
      print(n)
      print(list(keys))
      print(list(values))
      del dishes['eggs']
      del dishes['sausage']
      print(list(keys))
      print(keys & {'eggs', 'bacon', 'salad'})
      print(keys ^ {'sausage', 'juice'})
    `,
    output: [
      '4',
      '504',
      "['eggs', 'sausage', 'bacon', 'spam']",
      '[2, 1, 1, 500]',
      "['bacon', 'spam']",
      "{'bacon'}",
      "{'bacon', 'spam', 'sausage', 'juice'}",
    ],
  },
  {
    input: `
      class Parent: pass
      class Child(Parent): pass
      p = Parent()
      c = Child()
      print(p.__class__ == Parent)
      print(c.__class__ == Child)
      print(p.__class__.__name__)
      def func(): pass
      f = func
      print(f.__name__)
    `,
    output: [
      'True', //
      'True',
      'Parent',
      'func',
    ],
  },
  {
    input: `
      import math
      print(math.ceil(10.12))
    `,
    output: ['11'],
  },
  {
    input: `
      import math
      print(math.copysign(5, -7))
    `,
    output: ['-5'],
  },
  {
    input: `
      import math
      print(math.fabs(10), math.fabs(-5), math.fabs(3.4))
    `,
    output: ['10 5 3.4'],
  },
  {
    input: `
      import math
      print(math.factorial(10))
    `,
    output: ['3628800'],
  },
  {
    input: `
      import math
      print(math.floor(10.12))
    `,
    output: ['10'],
  },
  {
    input: `
      import math
      print(math.fmod(12, 10))
    `,
    output: ['2'],
  },
  {
    input: `
      import math
      print(math.frexp(12))
    `,
    expectedException: ExceptionType.NotImplementedError,
  },
  {
    input: `
      import math
      print(math.fsum([0.1,0.2]))
    `,
    output: ['0.3'],
  },
  {
    input: `
      import math
      print(math.exp(5))
    `,
    output: ['148.4131591025766'],
  },
  {
    input: `
      import math
      print(math.expm1(5))
    `,
    output: ['147.4131591025766'],
  },
  {
    input: `
      import math
      print(math.log(5))
    `,
    output: ['1.6094379124341003'],
  },
  {
    input: `
      import math
      print(math.log1p(5))
    `,
    output: ['1.791759469228055'],
  },
  {
    input: `
      import math
      print(math.log2(5))
    `,
    output: ['2.321928094887362'],
  },
  {
    input: `
      import math
      print(math.log10(5))
    `,
    output: ['0.6989700043360189'],
  },
  {
    input: `
      import math
      print(math.pow(5.1, 10.2))
    `,
    output: ['16489815.489690851'],
  },
  {
    input: `
      import math
      print(math.pow('x', 10.2))
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      import math
      print(math.sqrt(3.02))
    `,
    output: ['1.7378147196982767'],
  },
  {
    input: `
      import math
      print(math.acos(0.24))
    `,
    output: ['1.3284304757559333'],
  },
  {
    input: `
      import math
      print(math.asin(0.24))
    `,
    output: ['0.24236585103896321'],
  },
  {
    input: `
      import math
      print(math.atan(0.24))
    `,
    output: ['0.23554498072086333'],
  },
  {
    input: `
      import math
      print(math.atan2(0.24, 3))
    `,
    output: ['0.07982998571223732'],
  },
  {
    input: `
      import math
      print(math.cos(0.24))
    `,
    output: ['0.9713379748520297'],
  },
  {
    input: `
      import math
      print(math.hypot(3.2, 5.09))
    `,
    output: ['6.012328999647308'],
  },
  {
    input: `
      import math
      print(math.sin(0.24))
    `,
    output: ['0.23770262642713458'],
  },
  {
    input: `
      import math
      print(math.tan(0.24))
    `,
    output: ['0.24471670271446497'],
  },
  {
    input: `
      import math
      print(math.degrees(1.22))
    `,
    output: ['69.90085100596043'],
  },
  {
    input: `
      import math
      print(math.radians(141.3))
    `,
    output: ['2.466150233067988'],
  },
  {
    input: `
      import math
      print(math.pi)
    `,
    output: ['3.141592653589793'],
  },
  {
    input: `
      import math
      print(math.e)
    `,
    output: ['2.718281828459045'],
  },
  {
    input: `
      print(abs(-3), abs(-3.2))
    `,
    output: ['3 3.2'],
  },
  {
    input: `
      print(abs('x'))
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      print(all({True, False}))
      print(all([True, True]))
      print(all([]))
    `,
    output: ['False', 'True', 'True'],
  },
  {
    input: `
      print(all(10))
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      print(any({True, False}))
      print(any([False, False]))
      print(any([]))
    `,
    output: ['True', 'False', 'False'],
  },
  {
    input: `
      print(any(10))
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      print(chr(97))
    `,
    output: ['a'],
  },
  {
    input: `
      print(chr('x'))
    `,
    expectedException: ExceptionType.TypeError,
  },
  {
    input: `
      print(min(40, 100, 20))
    `,
    output: ['20'],
  },
  {
    input: `
      print(min())
    `,
    expectedException: ExceptionType.ValueError,
  },
  {
    input: `
      print(max(40, 100, 20))
    `,
    output: ['100'],
  },
  {
    input: `
      print(max())
    `,
    expectedException: ExceptionType.ValueError,
  },
  {
    input: `
      print(sum(40, 100, 20))
    `,
    output: ['160'],
  },
  {
    input: `
      print(sum())
    `,
    expectedException: ExceptionType.ValueError,
  },
  {
    input: `
      print(pow(1.2, 3.4))
    `,
    output: ['1.858729691979481'],
  },
  {
    input: `
      import random
      print(random.random() >= 0)
    `,
    output: ['True'],
  },
  {
    input: `
      a = 10
      print(f'value: {a+5}')
    `,
    output: ['value: 15'],
  },
  {
    input: `
      while a > :
        print('test')
    `,
    expectedCompilerError: PyErrorType.ExpectedRightOperand,
  },
  {
    input: `
      for x in a > :
        print('test')
    `,
    expectedCompilerError: PyErrorType.ExpectedRightOperand,
  },
];

export default scenarios;
