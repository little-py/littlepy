export interface PyObject {
  getAttribute(name: string): PyObject;
  setAttribute(name: string, value: PyObject): void;
  deleteAttribute(name: string): void;
  toString(): string;
}
