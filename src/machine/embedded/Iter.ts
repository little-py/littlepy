import { BaseObject } from '../objects/BaseObject';
import { IterableObject } from '../objects/IterableObject';
import { ExceptionObject } from '../objects/ExceptionObject';
import { ExceptionType } from '../../api/ExceptionType';
import { IteratorObject } from '../objects/IteratorObject';

export function iter(object: BaseObject) {
  if (!(object instanceof IterableObject)) {
    throw new ExceptionObject(ExceptionType.TypeError);
  }
  return new IteratorObject(object);
}
