import { StackEntry } from './StackEntry';
import { ExceptionObject } from './objects/ExceptionObject';
import { PyObject } from '../api/Object';

export enum ContinueContextType {
  Exception = 'Exception',
  Cycle = 'Cycle',
  Exit = 'Exit',
}

export class ContinueContext {
  public exception: ExceptionObject = null;
  public instruction = -1;
  public returnValue: PyObject = null;
  public stack: StackEntry = null;
  public type: ContinueContextType = ContinueContextType.Exception;
}
