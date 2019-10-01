import { ExceptionType } from '../../src/machine/objects/ExceptionObject';
import { PyErrorType } from '../../src/api/ErrorType';

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
    output: ['1', '2', '3'],
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
    output: ['Orange', 'Banana', 'Cherry'],
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
    output: ['True', 'False', 'True', 'True', 'False', 'True', 'True', 'True', 'False', 'True', 'False', 'False', 'True'],
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
    `,
    output: ['True', 'False', 'True', 'False'],
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
    `,
    output: ['20', '10'],
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
    expectedException: ExceptionType.ReferenceError,
  },
  {
    input: `
      b = 10
      b.c.d(100)
    `,
    expectedException: ExceptionType.ReferenceError,
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
    output: ['5', '2.5', '8', '2', '1', '64', '4', '8', '7', '11', 'True', 'False', 'True', 'False', 'True', 'False', 'True', 'False', 'True', 'False', 'True', 'False'],
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
    expectedCompilerError: PyErrorType.Error_Compiler_CannotFindIfOrElifForElse,
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
    expectedCompilerError: PyErrorType.Error_Compiler_CannotFindIfOrElifForElif,
  },
  {
    input: `
      try:
        print('a')
      elif x > 3:
        print('x')
    `,
    expectedCompilerError: PyErrorType.Error_Compiler_CannotFindIfOrElifForElif,
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
    expectedCompilerError: PyErrorType.Error_Compiler_IncompleteImportDefinition,
  },
  {
    input: 'import a b',
    expectedCompilerError: PyErrorType.Error_Compiler_ImportDefinitionIsTooLong,
  },
  {
    input: 'import 10',
    expectedCompilerError: PyErrorType.Error_Compiler_ImportExpectedIdentifier,
  },
  {
    input: 'import a as 10',
    expectedCompilerError: PyErrorType.Error_Compiler_ImportExpectedAsIdentifier,
  },
  {
    input: 'from x',
    expectedCompilerError: PyErrorType.Error_Compiler_IncompleteImportFromDefinition,
  },
  {
    input: 'from x import a b',
    expectedCompilerError: PyErrorType.Error_Compiler_ImportFromDefinitionIsTooLong,
  },
  {
    input: 'from x a b',
    expectedCompilerError: PyErrorType.Error_Compiler_ImportFromExpectedImport,
  },
  {
    input: 'from 10 import a',
    expectedCompilerError: PyErrorType.Error_Compiler_ImportFromExpectedIdentifier,
  },
  {
    input: 'from a import 10',
    expectedCompilerError: PyErrorType.Error_Compiler_ImportFromExpectedIdentifier,
  },
  {
    input: `
      for a in [1, 2]:
        print(a)
        break a
    `,
    expectedCompilerError: PyErrorType.Error_Compiler_BreakHasNoArguments,
  },
  {
    input: `
      for a in [1, 2]:
        print(a)
        continue a
    `,
    expectedCompilerError: PyErrorType.Error_Compiler_ContinueHasNoArguments,
  },
  {
    input: 'pass 100',
    expectedCompilerError: PyErrorType.Error_Compiler_PassHasNoArguments,
  },
  {
    input: 'raise 10 20',
    expectedCompilerError: PyErrorType.ExpectedBinaryOperator,
  },
  {
    input: 'raise 10]',
    expectedCompilerError: PyErrorType.Error_Compiler_RaiseExpectedEndOfLine,
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
    expectedCompilerError: PyErrorType.Error_Compiler_ExpectedYieldExpression,
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
    expectedCompilerError: PyErrorType.Error_Compiler_ReturnOrYieldExpectedEndOfLine,
  },
  {
    input: 'except:',
    expectedCompilerError: PyErrorType.Error_Compiler_ExceptExpectedTryOrExcept,
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
    expectedCompilerError: PyErrorType.Error_Compiler_ExceptExpectedIdentifier,
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
    expectedCompilerError: PyErrorType.Error_Compiler_ExceptExpectedRightBracket,
  },
  {
    input: `
      try:
        raise NotImplementedError()
      except (E]
        print('ok')
    `,
    expectedCompilerError: PyErrorType.Error_Compiler_ExceptExpectedRightBracket,
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
    expectedCompilerError: PyErrorType.Error_Compiler_ExceptExpectedIdentifierAfterAs,
  },
  {
    input: `
      finally:
        print(10)
    `,
    expectedCompilerError: PyErrorType.Error_Compiler_FinallyCannotFindExceptOrTry,
  },
  {
    input: `
      a = 10
      a += 10 += 20
    `,
    expectedCompilerError: PyErrorType.Error_Compiler_MixingAugmentedOperators,
  },
  {
    input: `
      del 10
    `,
    expectedCompilerError: PyErrorType.Error_Compiler_ExpectedIdentifierForDel,
  },
  {
    input: `
      del x.10
    `,
    expectedCompilerError: PyErrorType.Error_Compiler_ExpectedEndOfIdentifierForDel,
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
    expectedCompilerError: PyErrorType.Error_Compiler_IfExpressionExpectedElse,
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
    output: ['(5)'],
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
    expectedException: ExceptionType.UnknownIdentifier,
    exceptionArgs: ['test'],
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
    onlyThis: true,
  },
];

export default scenarios;
