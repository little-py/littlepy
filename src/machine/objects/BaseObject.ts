import { PyObject } from '../../api/Object';
import { ExceptionType } from '../../api/ExceptionType';

export class BaseObject implements PyObject {
  private static idCounter = 1;
  private static _nativeMethods: { [name: string]: BaseObject } = {};
  protected static createNativeMethod: (func: Function) => BaseObject;
  protected static throwException: (type: ExceptionType, ...args: string[]) => void;

  protected attributes: { [key: string]: BaseObject } = {};
  public id: number = BaseObject.idCounter++;
  public name: string;

  public getClassName() {
    return this.constructor.name;
  }

  public equals(to: BaseObject) {
    if (this === to) {
      return true;
    }
    if (this.canBeReal() && to.canBeReal()) {
      return this.toReal() === to.toReal();
    }
  }

  public toBoolean() {
    return true;
  }

  public canBeInteger(): boolean {
    return false;
  }

  public canBeReal(): boolean {
    return false;
  }

  public toInteger(): number {
    return 0;
  }

  public toReal(): number {
    return 0;
  }

  public toString(): string {
    return '(object)';
  }

  public getAttribute(name: string): BaseObject {
    const ret = this.attributes[name];
    return ret || this.getNativeMethod(name);
  }

  public setAttribute(name: string, value: BaseObject) {
    this.attributes[name] = value;
  }

  public deleteAttribute(name: string) {
    delete this.attributes[name];
  }

  private getNativeMethod(name: string): BaseObject {
    const fullName = `${this.getClassName()}.${name}`;
    if (!BaseObject._nativeMethods[fullName]) {
      const func = this['native_' + name];
      if (!func) {
        return null;
      }
      BaseObject._nativeMethods[fullName] = BaseObject.createNativeMethod(func);
    }
    return BaseObject._nativeMethods[fullName];
  }
}
