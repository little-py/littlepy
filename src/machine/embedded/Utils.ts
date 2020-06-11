import { ModuleObject } from '../objects/ModuleObject';
import { getObjectUtils } from '../../api/ObjectUtils';
import { PyClass } from '../../api/Class';

export function getClassObject(object: PyClass, name: string): PyClass {
  object.name = name;
  return object;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
export function createNativeModule(object: any, name: string): ModuleObject {
  const ret = new ModuleObject();
  ret.name = name;

  const keys = Object.getOwnPropertyNames(Object.getPrototypeOf(object));

  for (const key of keys) {
    const func = object[key];
    const newMethod = getObjectUtils().createNativeMethod(func, object, key);
    if (newMethod) {
      ret.setAttribute(key, newMethod);
    }
  }

  return ret;
}
