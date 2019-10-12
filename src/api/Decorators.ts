import { MemberWithMetadata } from '../machine/NativeTypes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pyParam(name: string, type: any = undefined, defaultValue: any = undefined, callback = false, args = false, kwargs = false) {
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pyFunction(target: any, propertyKey: string) {
  const member = target[propertyKey] as MemberWithMetadata;
  member.pythonMethod = {
    name: '',
  };
}

export const pyParamCallback = pyParam(undefined, undefined, undefined, true);
export const pyParamArgs = pyParam(undefined, undefined, undefined, false, true);
export const pyParamKwargs = pyParam(undefined, undefined, undefined, false, false, true);
