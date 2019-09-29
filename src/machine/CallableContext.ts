import { BaseObject } from './objects/BaseObject';

export class CallableContext {
  public setIndexedArg(index: number, obj: BaseObject) {
    this.indexedArgs[index] = obj;
  }

  public setNamedArg(name: string, obj: BaseObject) {
    this.namedArgs[name] = obj;
  }

  public indexedArgs: BaseObject[] = [];
  public namedArgs: { [key: string]: BaseObject } = {};
}
