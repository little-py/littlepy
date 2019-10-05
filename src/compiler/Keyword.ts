export enum KeywordType {
  Invalid = 'Invalid',
  False = 'False',
  None = 'None',
  True = 'True',
  And = 'And',
  As = 'As',
  Assert = 'Assert',
  Async = 'Async',
  Await = 'Await',
  Break = 'Break',
  Class = 'Class',
  Continue = 'Continue',
  Def = 'Def',
  Del = 'Del',
  Elif = 'Elif',
  Else = 'Else',
  Except = 'Except',
  Finally = 'Finally',
  For = 'For',
  From = 'From',
  Global = 'Global',
  If = 'If',
  Import = 'Import',
  In = 'In',
  Is = 'Is',
  Lambda = 'Lambda',
  NonLocal = 'NonLocal',
  Not = 'Not',
  Or = 'Or',
  Pass = 'Pass',
  Raise = 'Raise',
  Return = 'Return',
  Try = 'Try',
  While = 'While',
  With = 'With',
  Yield = 'Yield',

  // composite keywords
  NotIn = 'NotIn',
  IsNot = 'IsNot',
  AsyncFor = 'AsyncFor',
}

const KEYWORDS = {
  False: KeywordType.False,
  None: KeywordType.None,
  True: KeywordType.True,
  and: KeywordType.And,
  as: KeywordType.As,
  assert: KeywordType.Assert,
  async: KeywordType.Async,
  await: KeywordType.Await,
  break: KeywordType.Break,
  class: KeywordType.Class,
  continue: KeywordType.Continue,
  def: KeywordType.Def,
  del: KeywordType.Del,
  elif: KeywordType.Elif,
  else: KeywordType.Else,
  except: KeywordType.Except,
  finally: KeywordType.Finally,
  for: KeywordType.For,
  from: KeywordType.From,
  global: KeywordType.Global,
  if: KeywordType.If,
  import: KeywordType.Import,
  in: KeywordType.In,
  is: KeywordType.Is,
  lambda: KeywordType.Lambda,
  nonlocal: KeywordType.NonLocal,
  not: KeywordType.Not,
  or: KeywordType.Or,
  pass: KeywordType.Pass,
  raise: KeywordType.Raise,
  return: KeywordType.Return,
  try: KeywordType.Try,
  while: KeywordType.While,
  with: KeywordType.With,
  yield: KeywordType.Yield,
};

export class Keyword {
  public static getKeywordType(text: string): KeywordType {
    const keyword = KEYWORDS[text];
    return keyword !== undefined ? keyword : KeywordType.Invalid;
  }

  public static getCompositeKeyword(first: KeywordType, second: KeywordType): KeywordType {
    if (first === KeywordType.Not && second === KeywordType.In) {
      return KeywordType.NotIn;
    }
    if (first === KeywordType.Is && second === KeywordType.Not) {
      return KeywordType.IsNot;
    }
    if (first === KeywordType.Async && second === KeywordType.For) {
      return KeywordType.AsyncFor;
    }
    return KeywordType.Invalid;
  }
}
