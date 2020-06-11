import { Callable } from '../../api/Callable';
import { FunctionContext } from '../../api/FunctionContext';
import { FunctionBody } from '../../api/FunctionBody';

/* istanbul ignore next */
export class FunctionObject extends Callable {
  // eslint-disable-next-line @typescript-eslint/ban-types
  public constructor(body: FunctionBody = null, context: FunctionContext = null, nativeFunction: Function = null) {
    super(body, context, nativeFunction);
  }
}
