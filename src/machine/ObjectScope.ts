import { BaseObject } from './objects/BaseObject';
import { getEmbeddedType } from './embedded/index';

export class ObjectScope {
  private static idGen = 1;
  public constructor(name: string, parent: ObjectScope = null) {
    this.parent = parent;
    this.name = name;
    this.id = ObjectScope.idGen++;
  }

  public readonly parent: ObjectScope;
  public objects: { [key: string]: BaseObject } = {};
  public readonly id: number;
  public readonly name: string;
  public getObjectHook: (name: string) => BaseObject;

  public getObject(name: string): BaseObject {
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

  public getObjectParent(name: string): ObjectScope {
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
  public getObject(name: string): BaseObject {
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
