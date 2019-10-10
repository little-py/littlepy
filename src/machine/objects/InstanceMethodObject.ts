import { CallableObject } from './CallableObject';
import { FunctionRunContext } from '../FunctionRunContext';
import { BaseObject } from './BaseObject';
import { MemberWithMetadata, NativeFunction } from '../NativeTypes';

export class InstanceMethodObject extends CallableObject {
  public constructor(context: FunctionRunContext, nativeFunction: Function = null, newNativeFunction: NativeFunction = null) {
    super(context, nativeFunction, newNativeFunction);
  }

  public static setCreateNativeMethod() {
    BaseObject.createNativeMethod = (func: Function): BaseObject => new InstanceMethodObject(null, func);
    BaseObject.createNewNativeMethod = (func: Function, instance: any): BaseObject => {
      if (!func) {
        return null;
      }
      const method = func as MemberWithMetadata;
      if (!method.pythonWrapper) {
        return null;
      }
      return new InstanceMethodObject(null, null, method.pythonWrapper().bind(instance));
    };
  }
}

InstanceMethodObject.setCreateNativeMethod();
