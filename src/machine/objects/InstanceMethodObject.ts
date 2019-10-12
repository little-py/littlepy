import { CallableObject } from './CallableObject';
import { FunctionRunContext } from '../FunctionRunContext';
import { BaseObject } from './BaseObject';
import { MemberWithMetadata, NativeFunction } from '../NativeTypes';
import { nativeWrapper } from '../embedded/NativeWrapper';

export class InstanceMethodObject extends CallableObject {
  public constructor(context: FunctionRunContext, nativeFunction: Function = null, newNativeFunction: NativeFunction = null) {
    super(context, nativeFunction, newNativeFunction);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static createNativeMethod(func: Function, instance: any, name: string): BaseObject {
    if (!func) {
      return null;
    }
    const method = func as MemberWithMetadata;
    if (!method.pythonMethod) {
      return null;
    }
    if (!method.pythonWrapper) {
      method.pythonWrapper = nativeWrapper(instance, method);
    }
    const ret = new InstanceMethodObject(null, null, method.pythonWrapper.bind(instance));
    ret.name = name;
    return ret;
  }

  public static setCreateNativeMethod() {
    BaseObject.createNativeMethod = InstanceMethodObject.createNativeMethod;
  }
}

InstanceMethodObject.setCreateNativeMethod();
