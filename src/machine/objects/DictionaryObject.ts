import { BaseObject } from './BaseObject';
import { ContainerObject } from './ContainerObject';
import { StringObject } from './StringObject';
import { ExceptionType } from '../../api/ExceptionType';
import { TupleObject } from './TupleObject';
import { SetObject } from './SetObject';

export class DictionaryObject extends ContainerObject {
  public constructor() {
    super();
  }

  private readonly keys: StringObject[] = [];
  private readonly values: BaseObject[] = [];

  public getCount(): number {
    return this.keys.length;
  }

  public getItem(index: string): BaseObject {
    if (typeof index === 'number') {
      return this.keys[index];
    }
    const pos = this.keys.findIndex(k => k.value === index);
    if (pos < 0) {
      BaseObject.throwException(ExceptionType.IndexError);
    }
    return this.values[pos];
  }

  public contains(value: BaseObject): boolean {
    const name = value.toString();
    return this.keys.findIndex(n => n.value === name) >= 0;
  }

  public setItem(key: string, value: BaseObject) {
    const pos = this.keys.findIndex(k => k.value === key);
    if (pos < 0) {
      this.keys.push(new StringObject(key));
      this.values.push(value);
    } else {
      this.values[pos] = value;
    }
  }

  public toString(): string {
    return `{${this.keys
      .map((key, index) => {
        const value = this.values[index];
        return `'${key.value}': ${value instanceof StringObject ? `'${value.toString()}'` : value.toString()}`;
      })
      .join(', ')}}`;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_pop(key: BaseObject, def: BaseObject) {
    const keyValue = StringObject.toString(key, 'key');
    const pos = this.keys.findIndex(k => k.value === keyValue);
    if (pos < 0) {
      if (def) {
        return def;
      }
      BaseObject.throwException(ExceptionType.KeyError);
    }
    const ret = this.values[pos];
    this.keys.splice(pos, 1);
    this.values.splice(pos, 1);
    return ret;
  }

  public removeItem(key: string) {
    const pos = this.keys.findIndex(k => k.value === key);
    if (pos < 0) {
      BaseObject.throwException(ExceptionType.KeyError);
    }
    this.keys.splice(pos, 1);
    this.values.splice(pos, 1);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_keys() {
    return new SetObject(this.keys);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_values() {
    return new SetObject(this.values);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_get(key: BaseObject, def: BaseObject) {
    const keyValue = StringObject.toString(key, 'key');
    const pos = this.keys.findIndex(k => k.value === keyValue);
    if (pos < 0) {
      if (def) {
        return def;
      }
      BaseObject.throwException(ExceptionType.KeyError);
    }
    return this.values[pos];
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_clear() {
    this.keys.splice(0, this.keys.length);
    this.values.splice(0, this.values.length);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_popitem() {
    const pos = this.keys.length - 1;
    const key = this.keys[pos];
    if (!key) {
      BaseObject.throwException(ExceptionType.KeyError);
    }
    const value = this.values[pos];
    this.keys.splice(pos, 1);
    this.values.splice(pos, 1);
    return new TupleObject([key, value]);
  }
}
