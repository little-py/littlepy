import { ContainerObject } from './ContainerObject';
import { StringObject } from './StringObject';
import { ExceptionType } from '../../api/ExceptionType';
import { TupleObject } from './TupleObject';
import { SetObject } from './SetObject';
import { PyObject } from '../../api/Object';
import { getObjectUtils } from '../../api/ObjectUtils';
import { pyFunction, pyParam } from '../../api/Decorators';
import { PropertyType } from '../../api/Native';
import { UniqueErrorCode } from '../../api/UniqueErrorCode';

export class DictionaryObject extends ContainerObject {
  public constructor() {
    super();
  }

  private readonly _keys: StringObject[] = [];
  private readonly _values: PyObject[] = [];

  public getCount(): number {
    return this._keys.length;
  }

  public getItem(index: string): PyObject {
    if (typeof index === 'number') {
      return this._keys[index];
    }
    const pos = this._keys.findIndex(k => k.value === index);
    if (pos < 0) {
      getObjectUtils().throwException(ExceptionType.IndexError, UniqueErrorCode.CannotFindDictionaryKey, index);
    }
    return this._values[pos];
  }

  public contains(value: PyObject): boolean {
    const name = value.toString();
    return this._keys.findIndex(n => n.value === name) >= 0;
  }

  public setItem(key: string, value: PyObject) {
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

  @pyFunction
  public pop(@pyParam('key', PropertyType.String) key: string, @pyParam('def', PropertyType.Object, null) def: PyObject) {
    const pos = this._keys.findIndex(k => k.value === key);
    if (pos < 0) {
      if (def) {
        return def;
      }
      getObjectUtils().throwException(ExceptionType.KeyError, UniqueErrorCode.CannotFindDictionaryKey, key);
    }
    const ret = this._values[pos];
    this._keys.splice(pos, 1);
    this._values.splice(pos, 1);
    return ret;
  }

  public removeItem(key: string) {
    const pos = this._keys.findIndex(k => k.value === key);
    if (pos < 0) {
      getObjectUtils().throwException(ExceptionType.KeyError, UniqueErrorCode.CannotFindDictionaryKey, key);
    }
    this._keys.splice(pos, 1);
    this._values.splice(pos, 1);
  }

  @pyFunction
  public keys() {
    return new SetObject(this._keys);
  }

  @pyFunction
  public values() {
    return new SetObject(this._values);
  }

  @pyFunction
  public get(@pyParam('key', PropertyType.String) key: string, @pyParam('default', PropertyType.Object, null) def: PyObject) {
    const pos = this._keys.findIndex(k => k.value === key);
    if (pos < 0) {
      if (def) {
        return def;
      }
      getObjectUtils().throwException(ExceptionType.KeyError, UniqueErrorCode.CannotFindDictionaryKey, key);
    }
    return this._values[pos];
  }

  @pyFunction
  public clear() {
    this._keys.splice(0, this._keys.length);
    this._values.splice(0, this._values.length);
  }

  @pyFunction
  public popitem() {
    const pos = this._keys.length - 1;
    const key = this._keys[pos];
    if (!key) {
      getObjectUtils().throwException(ExceptionType.KeyError, UniqueErrorCode.DictionaryIsEmpty);
    }
    const value = this._values[pos];
    this._keys.splice(pos, 1);
    this._values.splice(pos, 1);
    return new TupleObject([key, value]);
  }
}
