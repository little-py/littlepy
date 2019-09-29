import { BaseObject } from './objects/BaseObject';
import { StackEntry } from './objects/StackEntry';

export enum ContinueContextType {
  ContinueException,
  ContinueCycleRelated,
  ContinueExitFunction,
}

export class ContinueContext {
  public exception: BaseObject = null;
  public instruction = -1;
  public returnValue: BaseObject = null;
  public stack: StackEntry = null;
  public type: ContinueContextType = ContinueContextType.ContinueException;
}
