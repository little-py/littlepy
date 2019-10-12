import { ExceptionType } from './ExceptionType';
import { PyObject } from './Object';

export interface ObjectUtils {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createNativeMethod(func: Function, instance: any, name: string): PyObject;
  throwException(type: ExceptionType, ...args: string[]): void;
  createTuple(items: PyObject[]): PyObject;
  createList(items: PyObject[]): PyObject;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromPyObject(val: PyObject, useObjectWrapper): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toPyObject(val: any, useObjectWrapper);
}

let objectUtils: ObjectUtils;

export function setObjectUtils(utils: ObjectUtils) {
  objectUtils = utils;
}

export function getObjectUtils(): ObjectUtils {
  return objectUtils;
}
