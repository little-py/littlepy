import { BaseObject } from './objects/BaseObject';
import { StackEntry } from './objects/StackEntry';
import { ExceptionObject } from './objects/ExceptionObject';

export enum ContinueContextType {
  Exception = 'Exception',
  Cycle = 'Cycle',
  Exit = 'Exit',
}

export class ContinueContext {
  public exception: ExceptionObject = null;
  public instruction = -1;
  public returnValue: BaseObject = null;
  public stack: StackEntry = null;
  public type: ContinueContextType = ContinueContextType.Exception;
}
