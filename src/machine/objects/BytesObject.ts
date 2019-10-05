import { BaseObject } from './BaseObject';

export class BytesObject extends BaseObject {
  public constructor(value: string) {
    super();
    this.value = value;
  }

  public value: string;

  public toString(): string {
    return `b'${this.value}'`;
  }
}
