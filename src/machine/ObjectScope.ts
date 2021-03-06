import { PyScope } from '../api/Scope';
import { getEmbeddedType } from './embedded/EmbeddedTypes';
import { PyObject } from '../api/Object';

export class ObjectScope implements PyScope {
  private static idGen = 1;
  public constructor(name: string, parent: PyScope = null) {
    this.parent = parent;
    this.name = name;
    this.id = ObjectScope.idGen++;
  }

  public readonly parent: PyScope;
  public readonly objects: { [key: string]: PyObject } = {};
  public readonly id: number;
  public readonly name: string;

  public getObjectHook: (name: string) => PyObject;

  public getObject(name: string): PyObject {
    if (this.getObjectHook) {
      const ret = this.getObjectHook(name);
      if (ret) {
        return ret;
      }
    }
    if (this.objects.hasOwnProperty(name)) {
      return this.objects[name];
    }
    if (this.parent) {
      return this.parent.getObject(name);
    }
    return null;
  }

  public getObjectParent(name: string): PyScope {
    if (this.objects.hasOwnProperty(name)) {
      return this;
    }
    if (this.parent) {
      return this.parent.getObjectParent(name);
    }
    return null;
  }
}

export class GlobalScope extends ObjectScope {
  public getObject(name: string): PyObject {
    let ret = super.getObject(name);
    if (!ret) {
      ret = getEmbeddedType(name);
      if (ret) {
        this.objects[name] = ret;
      }
    }
    return ret;
  }
}
