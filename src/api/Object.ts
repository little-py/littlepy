import { getObjectUtils } from './ObjectUtils';
import { NativeProperty } from '../machine/NativeTypes';

export class PyObject {
  protected attributes: { [key: string]: PyObject };
  private _nativeMethods: { [name: string]: PyObject };
  private static idCounter = 1;
  public id: number = PyObject.idCounter++;
  public name: string;

  public getAttribute(name: string): PyObject {
    const property = this[name] as NativeProperty;
    if (property && property.getter) {
      return getObjectUtils().readNativeProperty(this, property);
    }
    const ret = this.attributes && this.attributes[name];
    return ret || this.getNativeMethod(name);
  }

  public setAttribute(name: string, value: PyObject) {
    const property = this[name] as NativeProperty;
    if (property && property.setter) {
      getObjectUtils().writeNativeProperty(this, property, value);
      return;
    }
    this.attributes = this.attributes || {};
    this.attributes[name] = value;
  }

  public deleteAttribute(name: string) {
    delete this.attributes[name];
  }

  public equals(to: PyObject): boolean {
    return this === to;
  }

  toString(): string {
    return '(object)';
  }

  public toBoolean() {
    return true;
  }

  private getNativeMethod(name: string) {
    if (!this[name]) {
      return;
    }
    if (!this._nativeMethods || !this._nativeMethods[name]) {
      this._nativeMethods = this._nativeMethods || {};
      const newNativeMethod = getObjectUtils().createNativeMethod(this[name], this, name);
      /* istanbul ignore next */
      if (newNativeMethod) {
        this._nativeMethods[name] = newNativeMethod;
      }
    }
    return this._nativeMethods[name];
  }
}
