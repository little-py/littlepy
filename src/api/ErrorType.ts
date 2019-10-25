export enum PyErrorType {
  // LexicalAnalyzer errors
  UnknownChar = 'unknownChar',
  MismatchedIndent = 'mismatchedIndent',
  UnknownEscapeChar = 'unknownEscapeChar',

  // Compiler errors
  BlockExpectedColon = 'blockExpectedColon',
  IncompleteForDefinition = 'incompleteForDefinition',
  ForExpectedArgument = 'forExpectedArgument',
  ForExpectedIn = 'forExpectedIn',
  IncompleteWhileDefinition = 'incompleteWhileDefinition',
  IncompleteFunctionDeclaration = 'incompleteFunctionDeclaration',
  ExpectedFunctionName = 'expectedFunctionName',
  ExpectedFunctionArgumentList = 'expectedFunctionArgumentList',
  ExpectedArgumentName = 'expectedArgumentName',
  IncompleteFunctionArgumentList = 'incompleteFunctionArgumentList',
  ExpectedEndOfFunctionDef = 'expectedEndOfFunctionDef',
  ExpectedEndOfFunctionCall = 'expectedEndOfFunctionCall',
  IncompleteClassDeclaration = 'incompleteClassDeclaration',
  IncorrectInheritanceList = 'incorrectInheritanceList',
  ExpectedClassName = 'expectedClassName',
  ExpectedBinaryOperator = 'expectedBinaryOperator',
  ExpectedUnaryOperatorOrArgument = 'expectedUnaryOperatorOrArgument',
  ExpectedExpressionValue = 'expectedExpressionValue',
  ExpectedRightOperand = 'expectedRightOperand',
  UnexpectedEndOfCall = 'unexpectedEndOfCall',
  OrderedArgumentAfterNamed = 'orderedArgumentAfterNamed',
  ExpectedEndOfIndexer = 'expectedEndOfIndexer',
  ExpectedListDefinition = 'expectedListDefinition',
  ListExpectedCommaOrRightSquareBracket = 'listExpectedCommaOrRightSquareBracket',
  ComprehensionExpectedIdentifier = 'comprehensionExpectedIdentifier',
  ComprehensionExpectedInKeyword = 'comprehensionExpectedInKeyword',
  ExpectedTupleBody = 'expectedTupleBody',
  ExpectedTupleEnd = 'expectedTupleEnd',
  ExpectedSetBody = 'expectedSetBody',
  SetMixedWithAndWithoutColon = 'setMixedWithAndWithoutColon',
  ExpectedStringLiteralInSet = 'expectedStringLiteralInSet',
  ExpectedSetEnd = 'expectedSetEnd',
  IfExpressionExpectedElse = 'ifExpressionExpectedElse',
  ExpectedLiteral = 'expectedLiteral',
  BlockInCombinedLine = 'blockInCombinedLine',
  CannotFindIfOrElifForElif = 'cannotFindIfOrElifForElif',
  CannotFindIfOrElifForElse = 'cannotFindIfOrElifForElse',
  IncompleteImportDefinition = 'incompleteImportDefinition',
  IncompleteImportFromDefinition = 'incompleteImportFromDefinition',
  ImportFromDefinitionIsTooLong = 'importFromDefinitionIsTooLong',
  ImportFromExpectedImport = 'importFromExpectedImport',
  ImportFromExpectedIdentifier = 'importFromExpectedIdentifier',
  ImportDefinitionIsTooLong = 'importDefinitionIsTooLong',
  ImportExpectedIdentifier = 'importExpectedIdentifier',
  ImportExpectedAsIdentifier = 'importExpectedAsIdentifier',
  PassHasNoArguments = 'passHasNoArguments',
  BreakHasNoArguments = 'breakHasNoArguments',
  ContinueHasNoArguments = 'continueHasNoArguments',
  RaiseExpectedEndOfLine = 'raiseExpectedEndOfLine',
  ReturnExpectedEndOfLine = 'returnExpectedEndOfLine',
  YieldExpectedEndOfLine = 'yieldExpectedEndOfLine',
  DelExpectedEndOfLine = 'delExpectedEndOfLine',
  ExceptExpectedTry = 'exceptExpectedTry',
  ExceptExpectedRightBracket = 'exceptExpectedRightBracket',
  ExceptExpectedIdentifierAfterAs = 'exceptExpectedIdentifierAfterAs',
  ExceptExpectedIdentifier = 'exceptExpectedIdentifier',
  FinallyCannotFindTry = 'finallyCannotFindTry',
  MixingAugmentedOperators = 'mixingAugmentedOperators',
  ExpectedYieldExpression = 'expectedYieldExpression',
  ExpectedIdentifierForDel = 'expectedIdentifierForDel',
  WithExpectedAs = 'withExpectedAs',
  ExpectedOnlyIdentifier = 'expectedOnlyIdentifier',

  ExpectedEndOfExpression = 'expectedEndOfExpression',
  ErrorUnexpectedScenario01 = 'errorUnexpectedScenario01',
  ErrorUnexpectedScenario02 = 'errorUnexpectedScenario02',
  ErrorUnexpectedScenario03 = 'errorUnexpectedScenario03',
  ErrorUnexpectedScenario04 = 'errorUnexpectedScenario04',
  ErrorUnexpectedScenario05 = 'errorUnexpectedScenario05',
}
