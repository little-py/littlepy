/* eslint-disable @typescript-eslint/no-explicit-any */

import { nativeFunctionImpl, paramImpl } from './embedded/NativeFunction';

export abstract class RunContextBase {
  abstract raiseException(exception: any): void;
  abstract getNoneObject(): any;
}

export type NativeReturnType = any | void | boolean;
export type NativeFunction = (callContext: any, runContext: any) => NativeReturnType;
export type NativeFinishCallback = (ret: any, exception: any) => void;

export class CallableIgnore {}

export interface NativeParam {
  name: string;
  type: any;
  defaultValue: any;
  isCallback: boolean;
  args: boolean;
  kwargs: boolean;
}

export interface MemberWithMetadata extends Function {
  pythonParams: NativeParam[];
  pythonWrapper: () => NativeFunction;
}

export function param(name: string, type: any = undefined, defaultValue: any = undefined, callback = false, args = false, kwargs = false) {
  return paramImpl(name, type, defaultValue, callback, args, kwargs);
}

export function nativeFunction(target: any, propertyKey: string) {
  return nativeFunctionImpl(target, propertyKey);
}

export const paramCallback = param(undefined, undefined, undefined, true);
export const paramArgs = param(undefined, undefined, undefined, false, true);
export const paramKwargs = param(undefined, undefined, undefined, false, false, true);
