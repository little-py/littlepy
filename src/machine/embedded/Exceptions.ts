import { ExceptionClassObject } from '../objects/ExceptionClassObject';
import { ExceptionType } from '../../api/ExceptionType';
import { PyObject } from '../../api/Object';

export function exceptions(type: ExceptionType, name: string) {
  return (): PyObject => {
    const obj = new ExceptionClassObject(null, type);
    obj.name = name;
    return obj;
  };
}
