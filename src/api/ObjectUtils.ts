import { ExceptionType } from './ExceptionType';
import { PyObject } from './Object';
import { NativeProperty } from '../machine/NativeTypes';

export interface ObjectUtils {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createNativeMethod(func: Function, instance: any, name: string): PyObject;
  throwException(type: ExceptionType, ...args: string[]): void;
  createTuple(items: PyObject[]): PyObject;
  createList(items: PyObject[]): PyObject;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fromPyObject(val: PyObject): any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toPyObject(val: any, useObjectWrapper);
  readNativeProperty(instance: PyObject, property: NativeProperty): PyObject;
  writeNativeProperty(instance: PyObject, property: NativeProperty, value: PyObject);
}

let objectUtils: ObjectUtils;

export function setObjectUtils(utils: ObjectUtils) {
  objectUtils = utils;
}

export function getObjectUtils(): ObjectUtils {
  return objectUtils;
}
