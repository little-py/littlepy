import { FunctionObject } from '../objects/FunctionObject';
import { ClassObject } from '../objects/ClassObject';

export function getFunctionObject(func: Function, name: string): FunctionObject {
  const ret = new FunctionObject(null, func);
  ret.name = name;
  return ret;
}

export function getClassObject(object: ClassObject, name: string): ClassObject {
  object.name = name;
  return object;
}
