export enum LiteralType {
  String = 0,
  FormattedString,
  Bytes,
  Unicode,
  Integer,
  FloatingPoint,
  Imaginary,
  Raw = 0x8000,
  Long = 0x4000,
  LiteralMask = 0x0fff,
}

export class Literal {
  public type: LiteralType;
  public string: string;
  public integer: number;
}
