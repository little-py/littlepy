import { MemberWithMetadata, NativeProperty } from '../machine/NativeTypes';
import { PropertyType } from './Native';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pyGetterSetter(name: string | undefined, isGetter: boolean, type?: PropertyType) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (target: any, propertyKey: string) => {
    const member = target[propertyKey];
    if (!name) {
      const match = propertyKey.match(isGetter ? /^get(.+)$/ : /^set(.+)$/);
      if (!match) {
        throw Error('Unrecognized getter name format');
      }
      name = match[1].substr(0, 1).toLowerCase() + match[1].substr(1);
    }
    target[name] = target[name] || {
      type: PropertyType.Object,
    };
    const property = target[name] as NativeProperty;
    if (isGetter) {
      property.getter = member;
    } else {
      property.setter = member;
      property.type = type;
    }
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const pySetter = (type: PropertyType, name?: string) => pyGetterSetter(name, false, type);
export const pyGetter = (name?: string) => pyGetterSetter(name, true);
