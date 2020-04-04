import { PyErrorType } from '../../src/api/ErrorType';
import { compileModule } from './Utils';

interface ErrorScenario {
  input: string;
  error: PyErrorType;
  onlyThis?: boolean;
}

const errors: ErrorScenario[] = [
  // LexicalAnalyzer errors
  {
    input: `
      a = x ? y
    `,
    error: PyErrorType.UnknownChar,
  },
  {
    input: `
      a = 10
          b = 20
        c = 30
    `,
    error: PyErrorType.MismatchedIndent,
  },
  {
    input: `
      print('abc\\x')
    `,
    error: PyErrorType.UnknownEscapeChar,
  },
  // Compiler errors
  {
    input: `
      a = 10
      if a + 20 = 10 print(a)
    `,
    error: PyErrorType.BlockExpectedColon,
  },
  {
    input: `
      try:
        raise NotImplementedError()
      except E
        print('ok')
    `,
    error: PyErrorType.BlockExpectedColon,
  },
  {
    input: `
      for a:
        print(a)
    `,
    error: PyErrorType.IncompleteForDefinition,
  },
  {
    input: `
      for 10 in [10]:
        print(10)
    `,
    error: PyErrorType.ForExpectedArgument,
  },
  {
    input: `
      event = 'Party'
      print(f'Results of the {year {event}.')
    `,
    error: PyErrorType.ExpectedBinaryOperator,
  },
  {
    input: `
      for x on [50]:
        print(x)
    `,
    error: PyErrorType.ForExpectedIn,
  },
  {
    input: `
      while:
        print('a')
    `,
    error: PyErrorType.IncompleteWhileDefinition,
  },
  {
    input: `
      def:
        print('a')
    `,
    error: PyErrorType.IncompleteFunctionDeclaration,
  },
  {
    input: `
      def 10():
        print('a')
    `,
    error: PyErrorType.ExpectedFunctionName,
  },
  {
    input: `
      def func[]:
        print('a')
    `,
    error: PyErrorType.ExpectedFunctionArgumentList,
  },
  {
    input: `
      def func(10):
        print('a')
    `,
    error: PyErrorType.ExpectedArgumentName,
  },
  {
    input: `
      def func(a + 5):
        print('a')
    `,
    error: PyErrorType.ExpectedArgumentName,
  },
  {
    input: `
      def func(a = 5 * 2
        print('a')
    `,
    error: PyErrorType.IncompleteFunctionArgumentList,
  },
  {
    input: `
      def func(a = 20 = 30):
        print('a')
    `,
    error: PyErrorType.ExpectedEndOfFunctionDef,
  },
  {
    input: `
      def func():
        pass
      
      func(10
    `,
    error: PyErrorType.ExpectedEndOfFunctionCall,
  },
  {
    input: `
      class:
    `,
    error: PyErrorType.IncompleteClassDeclaration,
  },
  {
    input: `
      class Test(10): pass
    `,
    error: PyErrorType.IncorrectInheritanceList,
  },
  {
    input: `
      class Test(A + B): pass
    `,
    error: PyErrorType.IncorrectInheritanceList,
  },
  {
    input: `
      class Test(A,
    `,
    error: PyErrorType.IncorrectInheritanceList,
  },
  {
    input: `
      class 10: pass
    `,
    error: PyErrorType.ExpectedClassName,
  },
  {
    input: `
      a = 10 20
    `,
    error: PyErrorType.ExpectedBinaryOperator,
  },
  {
    input: `
      x = 10
      if x < 10:
        print('a')
      elif x 10:
        print('b')
    `,
    error: PyErrorType.ExpectedBinaryOperator,
  },
  {
    input: 'raise 10 20',
    error: PyErrorType.ExpectedBinaryOperator,
  },
  {
    input: `
      def func():
        yield 10 20
      func()
    `,
    error: PyErrorType.ExpectedBinaryOperator,
  },
  {
    input: `
      del x.10
    `,
    error: PyErrorType.ExpectedBinaryOperator,
  },
  {
    input: `
      x = +
    `,
    error: PyErrorType.ExpectedUnaryOperatorOrArgument,
  },
  {
    input: `
      def func(a = ):
        print('a')
    `,
    error: PyErrorType.ExpectedExpressionValue,
  },
  {
    input: `
      with
    `,
    error: PyErrorType.ExpectedExpressionValue,
  },
  {
    input: `
      a =
    `,
    error: PyErrorType.ExpectedExpressionValue,
  },
  {
    input: `
      x = .
    `,
    error: PyErrorType.ExpectedExpressionValue,
  },
  {
    input: `
      x = ;
    `,
    error: PyErrorType.ExpectedExpressionValue,
  },
  {
    input: `
      while a > :
        print('test')
    `,
    error: PyErrorType.ExpectedRightOperand,
  },
  {
    input: `
      for x in a > :
        print('test')
    `,
    error: PyErrorType.ExpectedRightOperand,
  },
  {
    input: `
      def func():
        pass
      
      func(a=
    `,
    error: PyErrorType.UnexpectedEndOfCall,
  },
  {
    input: `
      def func():
        pass
      
      func(a=10, b)
    `,
    error: PyErrorType.OrderedArgumentAfterNamed,
  },
  {
    input: `
      a = [1, 2]
      print(a[1)
    `,
    error: PyErrorType.ExpectedEndOfIndexer,
  },
  {
    input: `a = [`,
    error: PyErrorType.ExpectedListDefinition,
  },
  {
    input: `a = [10)`,
    error: PyErrorType.ListExpectedCommaOrRightSquareBracket,
  },
  {
    input: `a = [i for 10 in [1]]`,
    error: PyErrorType.ComprehensionExpectedIdentifier,
  },
  {
    input: `a = [i for x]`,
    error: PyErrorType.ComprehensionExpectedInKeyword,
  },
  {
    input: `
      a = (
    `,
    error: PyErrorType.ExpectedTupleBody,
  },
  {
    input: `
      a = (5,3,10=
    `,
    error: PyErrorType.ExpectedTupleEnd,
  },
  {
    input: `
      a = {
    `,
    error: PyErrorType.ExpectedSetBody,
  },
  {
    input: `
      a = {'x': 10, 20}
    `,
    error: PyErrorType.SetMixedWithAndWithoutColon,
  },
  {
    input: `
      a = {20, 'x': 10}
    `,
    error: PyErrorType.SetMixedWithAndWithoutColon,
  },
  {
    input: `a = {'x': 1, 'y': 2, f'z': 3}`,
    error: PyErrorType.ExpectedStringLiteralInSet,
  },
  {
    input: `a = {10`,
    error: PyErrorType.ExpectedSetEnd,
  },
  {
    input: `
      a = 10
      print(a < 20 if 5)
    `,
    error: PyErrorType.IfExpressionExpectedElse,
  },
  {
    input: `x = def`,
    error: PyErrorType.ExpectedLiteral,
  },
  {
    input: `
      a = 10
      a += 20; if a < 40: print(a)
    `,
    error: PyErrorType.BlockInCombinedLine,
  },
  {
    input: `
      elif x > 3:
        print('x')
    `,
    error: PyErrorType.CannotFindIfOrElifForElif,
  },
  {
    input: `
      try:
        print('a')
      elif x > 3:
        print('x')
    `,
    error: PyErrorType.CannotFindIfOrElifForElif,
  },
  {
    input: `
      else:
        print('a')
    `,
    error: PyErrorType.CannotFindIfOrElifForElse,
  },
  {
    input: 'import',
    error: PyErrorType.IncompleteImportDefinition,
  },
  {
    input: 'from x',
    error: PyErrorType.IncompleteImportFromDefinition,
  },
  {
    input: 'from x import a b',
    error: PyErrorType.ImportFromDefinitionIsTooLong,
  },
  {
    input: 'from x a b',
    error: PyErrorType.ImportFromExpectedImport,
  },
  {
    input: 'from 10 import a',
    error: PyErrorType.ImportFromExpectedIdentifier,
  },
  {
    input: 'from a import 10',
    error: PyErrorType.ImportFromExpectedIdentifier,
  },
  {
    input: 'import a b',
    error: PyErrorType.ImportDefinitionIsTooLong,
  },
  {
    input: 'import 10',
    error: PyErrorType.ImportExpectedIdentifier,
  },
  {
    input: 'import a as 10',
    error: PyErrorType.ImportExpectedAsIdentifier,
  },
  {
    input: 'pass 100',
    error: PyErrorType.PassHasNoArguments,
  },
  {
    input: `
      for a in [1, 2]:
        print(a)
        break a
    `,
    error: PyErrorType.BreakHasNoArguments,
  },
  {
    input: `
      for a in [1, 2]:
        print(a)
        continue a
    `,
    error: PyErrorType.ContinueHasNoArguments,
  },
  {
    input: 'raise 10]',
    error: PyErrorType.RaiseExpectedEndOfLine,
  },
  {
    input: `
      def func():
        return 10]
      func()
    `,
    error: PyErrorType.ReturnExpectedEndOfLine,
  },
  {
    input: `
      yield 10]
    `,
    error: PyErrorType.YieldExpectedEndOfLine,
  },
  {
    input: `
      del 10]
    `,
    error: PyErrorType.DelExpectedEndOfLine,
  },
  {
    input: 'except:',
    error: PyErrorType.ExceptExpectedTry,
  },
  {
    input: `
      try:
        raise NotImplementedError()
      except (E
        print('ok')
    `,
    error: PyErrorType.ExceptExpectedRightBracket,
  },
  {
    input: `
      try:
        raise NotImplementedError()
      except (E]
        print('ok')
    `,
    error: PyErrorType.ExceptExpectedRightBracket,
  },
  {
    input: `
      try:
        raise NotImplementedError()
      except x as
        print('ok')
    `,
    error: PyErrorType.ExceptExpectedIdentifierAfterAs,
  },
  {
    input: `
      try:
        raise NotImplementedError()
      except E as 10:
        print('ok')
    `,
    error: PyErrorType.ExceptExpectedIdentifierAfterAs,
  },
  {
    input: `
      try:
        raise NotImplementedError()
      except 10:
        print('ok')
    `,
    error: PyErrorType.ExceptExpectedIdentifier,
  },
  {
    input: `
      try:
        raise NotImplementedError()
      except a.
        print('ok')
    `,
    error: PyErrorType.ExceptExpectedIdentifier,
  },
  {
    input: `
      finally:
        print(10)
    `,
    error: PyErrorType.FinallyCannotFindTry,
  },
  {
    input: `
      a = 10
      a += 10 += 20
    `,
    error: PyErrorType.MixingAugmentedOperators,
  },
  {
    input: `
      def func():
        yield
      func()
    `,
    error: PyErrorType.ExpectedYieldExpression,
  },
  {
    input: `
      del
    `,
    error: PyErrorType.ExpectedIdentifierForDel,
  },
  {
    input: `
      with 1
    `,
    error: PyErrorType.WithExpectedAs,
  },
  {
    input: `
      nonlocal
    `,
    error: PyErrorType.ExpectedOnlyIdentifier,
  },
  {
    input: `
      nonlocal x,100
    `,
    error: PyErrorType.ExpectedOnlyIdentifier,
  },
  {
    input: `
      nonlocal x,
    `,
    error: PyErrorType.ExpectedOnlyIdentifier,
  },
  {
    input: `
      a = 1
      if not 10+:
        print('1')
      else:
        print('2')
    `,
    error: PyErrorType.ExpectedRightOperand,
  },
  {
    input: `
      a = [1,2]
      b = a[1+]
    `,
    error: PyErrorType.ExpectedRightOperand,
  },
  {
    input: `
      x = lambda x
    `,
    error: PyErrorType.ExpectedFunctionArgumentList,
  },
  {
    input: `
      if True:
      print("true")
    `,
    error: PyErrorType.ExpectedIndent,
  },
  {
    input: `
      print(100x)
    `,
    error: PyErrorType.InvalidNumericLiteral,
  },
];

describe('compiler and machine tests', () => {
  const onlyThis = errors.filter(s => s.onlyThis);
  let scenarios: ErrorScenario[];
  if (onlyThis.length) {
    scenarios = onlyThis;
  } else {
    scenarios = errors;
  }

  for (const { input, error } of scenarios) {
    const match = input.replace(/[\s\r\n\t]*$/, '');
    it(match, () => {
      const code = compileModule(input, 'main');
      expect(code.errors.map(e => e.type)).toContain(error);
    });
  }

  it('should cover all existing compiler errors', () => {
    const errorsMap = {};
    for (const e of errors) {
      errorsMap[e.error] = true;
    }
    // exceptions from the check
    errorsMap[PyErrorType.ExpectedEndOfExpression] = true; // this is tested in customize unit test
    errorsMap[PyErrorType.ErrorUnexpectedScenario01] = true; // this should never happen, safety check
    errorsMap[PyErrorType.ErrorUnexpectedScenario02] = true; // this should never happen, safety check
    errorsMap[PyErrorType.ErrorUnexpectedScenario03] = true; // this should never happen, safety check
    errorsMap[PyErrorType.ErrorUnexpectedScenario04] = true; // this should never happen, safety check
    errorsMap[PyErrorType.ErrorUnexpectedScenario05] = true; // this should never happen, safety check
    const untestedErrors = [];
    for (const id of Object.keys(PyErrorType)) {
      const value = PyErrorType[id];
      if (!errorsMap[value]) {
        untestedErrors.push(value);
      }
    }
    expect(untestedErrors).toEqual([]);
  });
});
