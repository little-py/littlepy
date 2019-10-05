import { BaseObject } from './BaseObject';
import { ContainerObject } from './ContainerObject';
import { ExceptionType } from '../../api/ExceptionType';

export class StringObject extends ContainerObject {
  getCount(): number {
    return this.value.length;
  }

  getItem(index: number | string): BaseObject {
    if (typeof index !== 'number') {
      BaseObject.throwException(ExceptionType.TypeError, 'index');
    }
    return new StringObject(this.value[index]);
  }
  public constructor(value: string) {
    super();
    this.value = value;
  }

  public toBoolean(): boolean {
    return this.value && this.value.length > 0;
  }

  public toString(): string {
    return this.value;
  }

  public equals(to: BaseObject): boolean | boolean {
    if (to instanceof StringObject) {
      return this.value === to.value;
    }
    return super.equals(to);
  }

  public contains(value: BaseObject): boolean {
    const substr = value.toString();
    return this.value.indexOf(substr) >= 0;
  }

  public readonly value: string;
}
