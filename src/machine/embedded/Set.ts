import { ClassObject } from '../objects/ClassObject';
import { BaseObject } from '../objects/BaseObject';
import { SetObject } from '../objects/SetObject';
import { IterableObject } from '../objects/IterableObject';
import { ExceptionObject } from '../objects/ExceptionObject';
import { ExceptionType } from '../../api/ExceptionType';

class SetClassObject extends ClassObject {}

const setClass = new SetClassObject(null, [], function(source: BaseObject) {
  if (!source) {
    return new SetObject();
  }
  if (!(source instanceof IterableObject)) {
    throw new ExceptionObject(ExceptionType.ValueError);
  }
  const values: BaseObject[] = [];
  for (let i = 0; i < source.getCount(); i++) {
    values.push(source.getItem(i));
  }

  return new SetObject(values);
});

export const setFactory = () => setClass;
