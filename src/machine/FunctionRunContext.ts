import { FunctionBody } from '../common/FunctionBody';
import { ObjectScope } from './ObjectScope';
import { PyObject } from '../api/Object';

export class FunctionRunContext {
  public scope: ObjectScope;
  public func: FunctionBody;
  public defaultValues: PyObject[];
}
