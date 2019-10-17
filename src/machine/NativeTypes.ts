/* eslint-disable @typescript-eslint/no-explicit-any */

import { PyMachine } from '../api/Machine';
import { PropertyType } from '../api/Native';

export abstract class RunContextBase extends PyMachine {
  abstract raiseException(exception: any): void;
  abstract getNoneObject(): any;
}

export type NativeReturnType = any | void | boolean;
export type NativeFunction = (callContext: any, runContext: any) => NativeReturnType;
export type NativeFinishCallback = (ret: any, exception: any) => void;

export class CallableIgnore {}

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
  getter: Function;
  setter: Function;
  type: PropertyType;
}

export interface MemberWithMetadata extends Function {
  pythonParams: NativeParam[];
  pythonMethod: NativeMethod;
  pythonWrapper: NativeFunction;
}
