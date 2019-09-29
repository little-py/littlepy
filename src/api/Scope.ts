import { PyObject } from './Object';

export interface PyScope {
  getObject(name: string): PyObject;
  getObjectParent(name: string): PyScope;

  readonly objects: { [key: string]: PyObject };
  readonly name: string;
  readonly id: number;
  readonly parent: PyScope;
}
