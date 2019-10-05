import { CallableObject } from './CallableObject';
import { FunctionRunContext } from '../FunctionRunContext';

export class FunctionObject extends CallableObject {
  public constructor(context: FunctionRunContext = null, nativeFunction: Function = null) {
    super(context, nativeFunction);
  }
}
