import { BaseObject } from './BaseObject';

export class BooleanObject extends BaseObject {
  public constructor(value: number | boolean) {
    super();
    if (typeof value === 'boolean') {
      this.value = value ? 1 : 0;
    } else {
      this.value = value;
    }
  }

  public toBoolean(): boolean {
    return this.value !== 0;
  }

  public canBeReal(): boolean {
    return true;
  }

  public canBeInteger(): boolean {
    return true;
  }

  public toInteger(): number {
    return this.value;
  }

  public toReal(): number {
    return this.value;
  }

  public toString(): string {
    return this.value ? 'True' : 'False';
  }

  public readonly value: number;
}
