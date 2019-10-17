import { DictionaryObject } from './objects/DictionaryObject';
import { IterableObject } from './objects/IterableObject';
import { ExceptionType } from '../api/ExceptionType';
import { StringObject } from './objects/StringObject';
import { ExceptionObject } from './objects/ExceptionObject';
import { PyObject } from '../api/Object';
import { getObjectUtils } from '../api/ObjectUtils';

export const stringFormat = (self: StringObject, format: PyObject) => {
  let dictionary: DictionaryObject;
  let iterable: IterableObject;
  if (format instanceof DictionaryObject) {
    dictionary = format;
  } else if (format instanceof IterableObject) {
    iterable = format;
  } else {
    throw new ExceptionObject(ExceptionType.TypeError);
  }

  let index = 0;

  const ret = self.value.replace(
    /%(?:\(([^)]+)\))?(#|0|-| |\+)?([0-9]+|\*)?(?:\.([0-9]+))?(d|i|o|u|x|X|e|E|f|F|g|G|c|r|s|a|%)/g,
    (_, mapper: string, modifier: string, length: string, precision: string, format: string) => {
      let arg: PyObject;
      if (mapper) {
        if (!dictionary) {
          throw new ExceptionObject(ExceptionType.TypeError, [], 'format');
        } else {
          arg = dictionary.getItem(mapper);
          if (!arg) {
            throw new ExceptionObject(ExceptionType.UnknownIdentifier, [], mapper);
          }
        }
      } else {
        if (!iterable) {
          throw new ExceptionObject(ExceptionType.TypeError, [], 'format');
        } else {
          arg = iterable.getItem(index);
          if (!arg) {
            throw new ExceptionObject(ExceptionType.IndexError, [], index.toString());
          }
          index++;
        }
      }
      let val = '';
      switch (format) {
        case 's':
        case 'r':
        case 'a': {
          val = arg.toString();
          if (length) {
            const len = Number(length);
            if (len > val.length) {
              val = ' '.repeat(len - val.length) + val;
            }
          }
          break;
        }
        case 'i':
        case 'd':
        case 'e':
        case 'E':
        case 'f':
        case 'F':
        case 'g':
        case 'G': {
          const number = getObjectUtils().toNumber(arg, 'arg');
          const intValue = Math.floor(number);
          const left = intValue.toString();
          let right = (number - intValue).toString().substr(2);
          if (format === 'i' || format === 'd') {
            right = '';
          } else if (precision) {
            const precisionValue = Number(precision);
            if (precisionValue > right.length) {
              right += '0'.repeat(precisionValue - right.length);
            } else if (precisionValue < right.length) {
              right = right.substr(0, precisionValue);
            }
          }
          val = left + (right ? '.' + right : '');
          if ((modifier === ' ' || modifier === '+') && val[0] !== '-') {
            val = modifier + val;
          }
          if (length) {
            const len = Number(length);
            if (val.length < len) {
              val = (modifier === '0' ? '0' : ' ').repeat(len - val.length) + val;
            }
          }
          break;
        }
      }
      return val;
    },
  );
  return new StringObject(ret);
};
