import { ClassObject } from '../objects/ClassObject';
import { BaseObject } from '../objects/BaseObject';
import { IterableObject } from '../objects/IterableObject';
import { ExceptionObject } from '../objects/ExceptionObject';
import { ExceptionType } from '../../api/ExceptionType';
import { FrozenSetObject } from '../objects/FrozenSetObject';

class FrozenSetClassObject extends ClassObject {}

const frozenSetClass = new FrozenSetClassObject(null, [], function(source: BaseObject) {
  if (!source) {
    return new FrozenSetObject();
  }
  if (!(source instanceof IterableObject)) {
    throw new ExceptionObject(ExceptionType.ValueError);
  }
  const values: BaseObject[] = [];
  for (let i = 0; i < source.getCount(); i++) {
    values.push(source.getItem(i));
  }

  return new FrozenSetObject(values);
});

export const frozenSetFactory = () => frozenSetClass;
