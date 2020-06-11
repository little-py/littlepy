/* eslint-disable @typescript-eslint/no-explicit-any */

import { PyMachine } from '../api/Machine';
import { PropertyType } from '../api/Native';
import { PyObject } from '../api/Object';

export abstract class RunContextBase extends PyMachine {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  abstract raiseException(exception: any): void;
  abstract getNoneObject(): any;
}

export type NativeReturnType = any | void | boolean;
export type NativeFunction = (callContext: any, runContext: any) => NativeReturnType;
export type NativeFinishCallback = (ret: any, exception: any) => void;

export class CallableIgnore extends PyObject {}

export interface NativeParam {
  name: string;
  type: PropertyType;
  defaultValue: any;
  isCallback: boolean;
  args: boolean;
  kwargs: boolean;
}

export interface NativeMethod {
  name: string;
}

export interface NativeProperty {
  // eslint-disable-next-line @typescript-eslint/ban-types
  getter: Function;
  // eslint-disable-next-line @typescript-eslint/ban-types
  setter: Function;
  type: PropertyType;
}

export interface MemberWithMetadata extends Function {
  pythonParams: NativeParam[];
  pythonMethod: NativeMethod;
  pythonWrapper: NativeFunction;
}
