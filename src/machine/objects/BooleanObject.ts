import { NumberObject } from './NumberObject';

export class BooleanObject extends NumberObject {
  public constructor(value: number | boolean) {
    super(typeof value === 'boolean' ? (value ? 1 : 0) : value);
  }

  public toString(): string {
    return this.value !== 0 ? 'True' : 'False';
  }

  public readonly value: number;
}
