/* eslint-disable @typescript-eslint/no-explicit-any */

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

export interface NativeMethod {
  name: string;
}

export interface MemberWithMetadata extends Function {
  pythonParams: NativeParam[];
  pythonMethod: NativeMethod;
  pythonWrapper: NativeFunction;
}

export function param(name: string, type: any = undefined, defaultValue: any = undefined, callback = false, args = false, kwargs = false) {
  // eslint-disable-next-line
  return (target: any, propertyKey: string, parameterIndex: number) => {
    const member = target[propertyKey] as MemberWithMetadata;
    member.pythonParams = member.pythonParams || [];
    member.pythonParams[parameterIndex] = {
      name,
      type,
      defaultValue,
      isCallback: callback,
      args,
      kwargs,
    };
  };
}

export function nativeFunction(target: any, propertyKey: string) {
  const member = target[propertyKey] as MemberWithMetadata;
  member.pythonMethod = {
    name: '',
  };
}

export const paramCallback = param(undefined, undefined, undefined, true);
export const paramArgs = param(undefined, undefined, undefined, false, true);
export const paramKwargs = param(undefined, undefined, undefined, false, false, true);
