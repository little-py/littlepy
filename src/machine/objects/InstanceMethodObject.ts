import { CallableObject } from './CallableObject';
import { FunctionRunContext } from '../FunctionRunContext';
import { BaseObject } from './BaseObject';
import { MemberWithMetadata, NativeFunction } from '../NativeTypes';

export class InstanceMethodObject extends CallableObject {
  public constructor(context: FunctionRunContext, nativeFunction: Function = null, newNativeFunction: NativeFunction = null) {
    super(context, nativeFunction, newNativeFunction);
  }

  public static createNativeMethod(func: Function, instance: any, name: string): BaseObject {
    if (!func) {
      return null;
    }
    const method = func as MemberWithMetadata;
    if (!method.pythonWrapper) {
      return null;
    }
    const ret = new InstanceMethodObject(null, null, method.pythonWrapper().bind(instance));
    ret.name = name;
    return ret;
  }

  public static setCreateNativeMethod() {
    BaseObject.createNativeMethod = InstanceMethodObject.createNativeMethod;
  }
}

InstanceMethodObject.setCreateNativeMethod();
