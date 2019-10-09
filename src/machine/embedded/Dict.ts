import { ClassObject } from '../objects/ClassObject';
import { ExceptionObject } from '../objects/ExceptionObject';
import { ExceptionType } from '../../api/ExceptionType';
import { CallableContext } from '../CallableContext';
import { DictionaryObject } from '../objects/DictionaryObject';

class DictClassObject extends ClassObject {}

const dictClass = new DictClassObject(null, [], function(callContext: CallableContext) {
  if (callContext.indexedArgs.length > 0) {
    throw new ExceptionObject(ExceptionType.IndexError);
  }
  const dict = new DictionaryObject();
  for (const key of Object.keys(callContext.namedArgs)) {
    dict.setItem(key, callContext.namedArgs[key]);
  }
  return dict;
});

export const dictFactory = () => dictClass;
