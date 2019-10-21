export enum UniqueErrorCode {
  CannotConvertJsToBoolean = 'CannotConvertJsToBoolean',
  CannotConvertJsToNumber = 'CannotConvertJsToNumber',
  CannotConvertJsToString = 'CannotConvertJsToString',
  CannotConvertJsToObject = 'CannotConvertJsToObject',
  ExpectedBooleanObject = 'ExpectedBooleanObject',
  ExpectedStringObject = 'ExpectedStringObject',
  ExpectedNumberObject = 'ExpectedNumberObject',
  ExpectedListObject = 'ExpectedListObject',
  ExpectedDictionaryObject = 'ExpectedDictionaryObject',
  ExpectedTupleObject = 'ExpectedTupleObject',
  ExpectedNonEmptyArgs = 'ExpectedNonEmptyArgs',
  StepCannotBeZero = 'StepCannotBeZero',
  ExpectedCallableObject = 'ExpectedCallableObject',
  ExpectedIterableObject = 'ExpectedIterableObject',
  NotImplemented = 'NotImplemented',
  ZeroDivision = 'ZeroDivision',
  RequiredArgumentIsMissing = 'RequiredArgumentIsMissing',
  ExpectedPythonObject = 'ExpectedPythonObject',
  UnexpectedJsException = 'UnexpectedJsException',
  CannotFindDictionaryKey = 'CannotFindDictionaryKey',
  DictionaryIsEmpty = 'DictionaryIsEmpty',
  CalledNextOnFinishedIterator = 'CalledNextOnFinishedIterator',
  CannotFindObjectInIterator = 'CannotFindObjectInIterator',
  IteratorFinished = 'IteratorFinished',
  ExpectedNumericOrStringIndexer = 'ExpectedNumericOrStringIndexer',
  ExpectedNumericIndexer = 'ExpectedNumericIndexer',
  IndexerIsOutOfRange = 'IndexerIsOutOfRange',
  ObjectNotFoundInSet = 'ObjectNotFoundInSet',
  ExpectedDictionaryOrIterableInFormat = 'ExpectedDictionaryOrIterableInFormat',
  CannotFindEndOfCycle = 'CannotFindEndOfCycle',
  CannotFindModuleFunction = 'CannotFindModuleFunction',
  ModuleNotFound = 'ModuleNotFound',
  FunctionNotFound = 'FunctionNotFound',
  NoCurrentException = 'NoCurrentException',
  CannotFindLabel = 'CannotFindLabel',
  BreakAndContinueShouldBeInsideCycle = 'BreakAndContinueShouldBeInsideCycle',
  ExpectedReferenceObject = 'ExpectedReferenceObject',
  CannotUnpackToEmptyTuple = 'CannotUnpackToEmptyTuple',
  UnpackCountDoesntMatch = 'UnpackCountDoesntMatch',
  ImportAllowedOnlyOnModuleLevel = 'ImportAllowedOnlyOnModuleLevel',
  UnknownInstruction = 'UnknownInstruction',
  UnsupportedLiteralType = 'UnsupportedLiteralType',
  CannotBuildResolutionOrder = 'CannotBuildResolutionOrder',
  CannotDeriveFromMultipleException = 'CannotDeriveFromMultipleException',
  NotSpecified = 'NotSpecified',
  UnexpectedEndOfStack = 'UnexpectedEndOfStack',
  ExpectedClass = 'ExpectedClass',
  ExpectedException = 'ExpectedException',
  ExpectedContainer = 'ExpectedContainer',
  ExpectedDictionaryOrListObject = 'ExpectedDictionaryOrListObject',
  FunctionTooManyArguments = 'FunctionTooManyArguments',
  ArgumentAlreadyProvided = 'ArgumentAlreadyProvided',
  MissingArgument = 'MissingArgument',
  StopIteration = 'StopIteration',
  UnknownUnaryOperation = 'UnknownUnaryOperation',
  MathOperationOperandsDontMatch = 'MathOperationOperandsDontMatch',
  UnknownIdentifier = 'UnknownIdentifier',
  RegisterIsNotSet = 'RegisterIsNotSet',
}