import { ClassObject } from '../objects/ClassObject';
import { BaseObject } from '../objects/BaseObject';
import { SetObject } from '../objects/SetObject';
import { IterableObject } from '../objects/IterableObject';
import { ExceptionObject } from '../objects/ExceptionObject';
import { ExceptionType } from '../../api/ExceptionType';
import { ListObject } from '../objects/ListObject';

class ListClassObject extends ClassObject {}

const listClass = new ListClassObject(null, [], function(source: BaseObject) {
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

  return new ListObject(values);
});

export const listFactory = () => listClass;
