import { ExceptionObject } from './objects/ExceptionObject';
import { PyObject } from '../api/Object';

interface IndexedArg {
  object: PyObject;
  expand: boolean;
}

export class CallableContext {
  public setIndexedArg(index: number, object: PyObject, expand: boolean) {
    this.indexedArgs[index] = {
      object,
      expand,
    };
  }

  public setNamedArg(name: string, obj: PyObject) {
    this.namedArgs[name] = obj;
  }

  public indexedArgs: IndexedArg[] = [];
  public namedArgs: { [key: string]: PyObject } = {};
  public onFinish: (ret: PyObject, exception: ExceptionObject) => boolean | void | undefined;
}
