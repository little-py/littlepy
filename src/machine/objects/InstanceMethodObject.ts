import { Callable } from '../../api/Callable';
import { FunctionContext } from '../../api/FunctionContext';
import { NativeFunction } from '../NativeTypes';
import { FunctionBody } from '../../api/FunctionBody';

export class InstanceMethodObject extends Callable {
  // eslint-disable-next-line @typescript-eslint/ban-types
  public constructor(body: FunctionBody, context: FunctionContext, nativeFunction: Function = null, newNativeFunction: NativeFunction = null) {
    super(body, context, nativeFunction, newNativeFunction);
  }
}
