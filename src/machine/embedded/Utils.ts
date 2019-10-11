import { ClassObject } from '../objects/ClassObject';
import { ModuleObject } from '../objects/ModuleObject';
import { InstanceMethodObject } from '../objects/InstanceMethodObject';

export function getClassObject(object: ClassObject, name: string): ClassObject {
  object.name = name;
  return object;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createNativeModule(object: any, name: string): ModuleObject {
  const ret = new ModuleObject();
  ret.name = name;

  const keys = Object.getOwnPropertyNames(Object.getPrototypeOf(object));

  for (const key of keys) {
    const func = object[key];
    const newMethod = InstanceMethodObject.createNativeMethod(func, object, key);
    if (newMethod) {
      ret.setAttribute(key, newMethod);
    }
  }

  return ret;
}
