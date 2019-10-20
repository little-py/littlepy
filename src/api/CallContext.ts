import { PyObject } from './Object';
import { PyException } from './Exception';

interface IndexedArg {
  object: PyObject;
  expand: boolean;
}

export class CallContext {
  public indexedArgs: IndexedArg[] = [];
  public namedArgs: { [key: string]: PyObject } = {};
  public onFinish: (ret: PyObject, exception: PyException) => boolean | void | undefined;
}
