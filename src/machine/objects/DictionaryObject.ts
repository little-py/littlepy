import { BaseObject } from './BaseObject';
import { ContainerObject } from './ContainerObject';
import { StringObject } from './StringObject';
import { ExceptionType } from '../../api/ExceptionType';
import { TupleObject } from './TupleObject';
import { SetObject } from './SetObject';
import { nativeFunction, param } from '../NativeTypes';

export class DictionaryObject extends ContainerObject {
  public constructor() {
    super();
  }

  private readonly _keys: StringObject[] = [];
  private readonly _values: BaseObject[] = [];

  public getCount(): number {
    return this._keys.length;
  }

  public getItem(index: string): BaseObject {
    if (typeof index === 'number') {
      return this._keys[index];
    }
    const pos = this._keys.findIndex(k => k.value === index);
    if (pos < 0) {
      BaseObject.throwException(ExceptionType.IndexError);
    }
    return this._values[pos];
  }

  public contains(value: BaseObject): boolean {
    const name = value.toString();
    return this._keys.findIndex(n => n.value === name) >= 0;
  }

  public setItem(key: string, value: BaseObject) {
    const pos = this._keys.findIndex(k => k.value === key);
    if (pos < 0) {
      this._keys.push(new StringObject(key));
      this._values.push(value);
    } else {
      this._values[pos] = value;
    }
  }

  public toString(): string {
    return `{${this._keys
      .map((key, index) => {
        const value = this._values[index];
        return `'${key.value}': ${value instanceof StringObject ? `'${value.toString()}'` : value.toString()}`;
      })
      .join(', ')}}`;
  }

  @nativeFunction
  public pop(@param('key', StringObject) key: string, @param('def', BaseObject, null) def: BaseObject) {
    const pos = this._keys.findIndex(k => k.value === key);
    if (pos < 0) {
      if (def) {
        return def;
      }
      BaseObject.throwException(ExceptionType.KeyError);
    }
    const ret = this._values[pos];
    this._keys.splice(pos, 1);
    this._values.splice(pos, 1);
    return ret;
  }

  public removeItem(key: string) {
    const pos = this._keys.findIndex(k => k.value === key);
    if (pos < 0) {
      BaseObject.throwException(ExceptionType.KeyError);
    }
    this._keys.splice(pos, 1);
    this._values.splice(pos, 1);
  }

  @nativeFunction
  public keys() {
    return new SetObject(this._keys);
  }

  @nativeFunction
  public values() {
    return new SetObject(this._values);
  }

  @nativeFunction
  public get(@param('key', StringObject) key: string, @param('default', BaseObject, null) def: BaseObject) {
    const pos = this._keys.findIndex(k => k.value === key);
    if (pos < 0) {
      if (def) {
        return def;
      }
      BaseObject.throwException(ExceptionType.KeyError);
    }
    return this._values[pos];
  }

  @nativeFunction
  public clear() {
    this._keys.splice(0, this._keys.length);
    this._values.splice(0, this._values.length);
  }

  @nativeFunction
  public popitem() {
    const pos = this._keys.length - 1;
    const key = this._keys[pos];
    if (!key) {
      BaseObject.throwException(ExceptionType.KeyError);
    }
    const value = this._values[pos];
    this._keys.splice(pos, 1);
    this._values.splice(pos, 1);
    return new TupleObject([key, value]);
  }
}
