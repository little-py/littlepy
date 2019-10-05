import { CallableObject } from './CallableObject';
import { FunctionRunContext } from '../FunctionRunContext';
import { BaseObject } from './BaseObject';

export class InstanceMethodObject extends CallableObject {
  public constructor(context: FunctionRunContext, nativeFunction: Function = null) {
    super(context, nativeFunction);
  }

  public static setCreateNativeMethod() {
    BaseObject.createNativeMethod = (func: Function): BaseObject => new InstanceMethodObject(null, func);
  }
}

InstanceMethodObject.setCreateNativeMethod();
