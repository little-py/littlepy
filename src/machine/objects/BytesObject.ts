import { PyObject } from '../../api/Object';

export class BytesObject extends PyObject {
  public constructor(value: string) {
    super();
    this.value = value;
  }

  public value: string;

  public toString(): string {
    return `b'${this.value}'`;
  }
}
