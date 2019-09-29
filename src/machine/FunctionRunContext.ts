import { FunctionBody } from '../common/FunctionBody';
import { ObjectScope } from './ObjectScope';
import { BaseObject } from './objects/BaseObject';

export class FunctionRunContext {
  public scope: ObjectScope;
  public func: FunctionBody;
  public defaultValues: BaseObject[];
}
