export enum KeywordType {
  InvalidKeyword = -1,
  KeywordFalse = 0,
  KeywordNone,
  KeywordTrue,
  KeywordAnd,
  KeywordAs,
  KeywordAssert,
  KeywordAsync,
  KeywordAwait,
  KeywordBreak,
  KeywordClass,
  KeywordContinue,
  KeywordDef,
  KeywordDel,
  KeywordElif,
  KeywordElse,
  KeywordExcept,
  KeywordFinally,
  KeywordFor,
  KeywordFrom,
  KeywordGlobal,
  KeywordIf,
  KeywordImport,
  KeywordIn,
  KeywordIs,
  KeywordLambda,
  KeywordNonlocal,
  KeywordNot,
  KeywordOr,
  KeywordPass,
  KeywordRaise,
  KeywordReturn,
  KeywordTry,
  KeywordWhile,
  KeywordWith,
  KeywordYield,
  KeywordCount, // Should be always last one, excluding composite keywords

  // composite keywords
  KeywordNotIn,
  KeywordIsNot,
  KeywordAsyncFor,
}

const KEYWORDS = {
  False: KeywordType.KeywordFalse,
  None: KeywordType.KeywordNone,
  True: KeywordType.KeywordTrue,
  and: KeywordType.KeywordAnd,
  as: KeywordType.KeywordAs,
  assert: KeywordType.KeywordAssert,
  async: KeywordType.KeywordAsync,
  await: KeywordType.KeywordAwait,
  break: KeywordType.KeywordBreak,
  class: KeywordType.KeywordClass,
  continue: KeywordType.KeywordContinue,
  def: KeywordType.KeywordDef,
  del: KeywordType.KeywordDel,
  elif: KeywordType.KeywordElif,
  else: KeywordType.KeywordElse,
  except: KeywordType.KeywordExcept,
  finally: KeywordType.KeywordFinally,
  for: KeywordType.KeywordFor,
  from: KeywordType.KeywordFrom,
  global: KeywordType.KeywordGlobal,
  if: KeywordType.KeywordIf,
  import: KeywordType.KeywordImport,
  in: KeywordType.KeywordIn,
  is: KeywordType.KeywordIs,
  lambda: KeywordType.KeywordLambda,
  nonlocal: KeywordType.KeywordNonlocal,
  not: KeywordType.KeywordNot,
  or: KeywordType.KeywordOr,
  pass: KeywordType.KeywordPass,
  raise: KeywordType.KeywordRaise,
  return: KeywordType.KeywordReturn,
  try: KeywordType.KeywordTry,
  while: KeywordType.KeywordWhile,
  with: KeywordType.KeywordWith,
  yield: KeywordType.KeywordYield,
};

export class Keyword {
  public static getKeywordType(text: string): KeywordType {
    const keyword = KEYWORDS[text];
    return keyword !== undefined ? keyword : KeywordType.InvalidKeyword;
  }

  public static getCompositeKeyword(first: KeywordType, second: KeywordType): KeywordType {
    if (first === KeywordType.KeywordNot && second === KeywordType.KeywordIn) {
      return KeywordType.KeywordNotIn;
    }
    if (first === KeywordType.KeywordIs && second === KeywordType.KeywordNot) {
      return KeywordType.KeywordIsNot;
    }
    if (first === KeywordType.KeywordAsync && second === KeywordType.KeywordFor) {
      return KeywordType.KeywordAsyncFor;
    }
    return KeywordType.InvalidKeyword;
  }
}
