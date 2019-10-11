// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { MemberWithMetadata } from '../NativeTypes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function paramImpl(name: string, type: any, defaultValue: any, callback, args, kwargs) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
let nativeWrapper: (instance: any, member: MemberWithMetadata) => any;

export function setNativeWrapper(wrapper) {
  nativeWrapper = wrapper;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function nativeFunctionImpl(target: any, propertyKey: string) {
  const member = target[propertyKey] as MemberWithMetadata;
  member.pythonWrapper = () => nativeWrapper(target, member);
}
