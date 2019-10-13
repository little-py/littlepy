import { Callable } from '../../api/Callable';
import { FunctionContext } from '../../api/FunctionContext';
import { FunctionBody } from '../../common/FunctionBody';

export class FunctionObject extends Callable {
  public constructor(body: FunctionBody = null, context: FunctionContext = null, nativeFunction: Function = null) {
    super(body, context, nativeFunction);
  }
}
