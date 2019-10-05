import { BaseObject } from '../objects/BaseObject';
import { ExceptionClassObject } from '../objects/ExceptionClassObject';
import { ExceptionType } from '../../api/ExceptionType';

export function exceptions(type: ExceptionType, name: string) {
  return (): BaseObject => {
    const obj = new ExceptionClassObject(null, type);
    obj.name = name;
    return obj;
  };
}
