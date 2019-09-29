import { ExceptionType } from '../objects/ExceptionObject';
import { BaseObject } from '../objects/BaseObject';
import { ExceptionClassObject } from '../objects/ExceptionClassObject';

export function exceptions(type: ExceptionType, name: string) {
  return (): BaseObject => {
    const obj = new ExceptionClassObject(type);
    obj.name = name;
    return obj;
  };
}
