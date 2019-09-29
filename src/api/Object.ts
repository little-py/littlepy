import { ObjectType } from './ObjectType';

export interface PyObject {
  readonly type: ObjectType;
  getAttribute(name: string): PyObject;
  setAttribute(name: string, value: PyObject): void;
  deleteAttribute(name: string): void;
  toString(): string;
}
