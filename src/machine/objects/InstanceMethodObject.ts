import { CallableObject } from './CallableObject';
import { FunctionRunContext } from '../FunctionRunContext';
import { NativeFunction } from '../NativeTypes';

export class InstanceMethodObject extends CallableObject {
  public constructor(context: FunctionRunContext, nativeFunction: Function = null, newNativeFunction: NativeFunction = null) {
    super(context, nativeFunction, newNativeFunction);
  }
}
