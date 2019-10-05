import { BaseObject } from './objects/BaseObject';
import { ExceptionObject } from './objects/ExceptionObject';

interface IndexedArg {
  object: BaseObject;
  expand: boolean;
}

export class CallableContext {
  public setIndexedArg(index: number, object: BaseObject, expand: boolean) {
    this.indexedArgs[index] = {
      object,
      expand,
    };
  }

  public setNamedArg(name: string, obj: BaseObject) {
    this.namedArgs[name] = obj;
  }

  public indexedArgs: IndexedArg[] = [];
  public namedArgs: { [key: string]: BaseObject } = {};
  public onFinish: (ret: BaseObject, exception: ExceptionObject) => boolean | void | undefined;
}
