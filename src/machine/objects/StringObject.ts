import { BaseObject } from './BaseObject';
import { ContainerObject } from './ContainerObject';
import { ExceptionType } from '../../api/ExceptionType';
import { IntegerObject } from './IntegerObject';
import { BooleanObject } from './BooleanObject';
import { CallableContext } from '../CallableContext';
import { IterableObject } from './IterableObject';
import { nativeFunction, param } from '../NativeTypes';

function isSpace(c: string): boolean {
  return c === ' ' || c === '\t' || c === '\r' || c === '\n';
}

export class StringObject extends ContainerObject {
  public readonly value: string;

  public static toString(value: BaseObject, name = ''): string {
    if (!(value instanceof StringObject)) {
      BaseObject.throwException(ExceptionType.TypeError, name);
      /* istanbul ignore next */
      return;
    }
    return value.value;
  }

  public constructor(value: string) {
    super();
    this.value = value;
  }

  getCount(): number {
    return this.value.length;
  }

  getItem(index: number | string): BaseObject {
    if (typeof index !== 'number') {
      BaseObject.throwException(ExceptionType.TypeError, 'index');
    }
    return new StringObject(this.value[index]);
  }

  public toBoolean(): boolean {
    return this.value && this.value.length > 0;
  }

  public toString(): string {
    return this.value;
  }

  public equals(to: BaseObject): boolean | boolean {
    if (to instanceof StringObject) {
      return this.value === to.value;
    }
    return super.equals(to);
  }

  public contains(value: BaseObject): boolean {
    const substr = value.toString();
    return this.value.indexOf(substr) >= 0;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_capitalize(): StringObject {
    const val = this.value ? this.value[0].toUpperCase() + this.value.substr(1) : '';
    return new StringObject(val);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_center(width: BaseObject, fillchar: BaseObject) {
    const count: number = IntegerObject.toInteger(width, 'width');
    const chr = fillchar ? StringObject.toString(fillchar, 'fillchar') : ' ';
    if (this.value.length >= count) {
      return this;
    }
    const left = Math.floor((count - this.value.length) / 2);
    return new StringObject(chr.repeat(left) + this.value + chr.repeat(count - left - this.value.length));
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_count(sub: BaseObject, start: BaseObject, end: BaseObject) {
    const subValue = StringObject.toString(sub, 'sub');
    const fromValue = start ? IntegerObject.toInteger(start, 'start') : 0;
    const toValue = (end ? IntegerObject.toInteger(end, 'end') : this.value.length) - subValue.length;
    let count = 0;
    for (let i = fromValue; i < toValue; i++) {
      if (this.value.substr(i, subValue.length) === subValue) {
        count++;
      }
    }
    return new IntegerObject(count);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_endswith(sub: BaseObject) {
    const subValue = StringObject.toString(sub, 'sub');
    return new BooleanObject(this.value.substr(this.value.length - subValue.length) === subValue);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_startswith(sub: BaseObject) {
    const subValue = StringObject.toString(sub, 'sub');
    return new BooleanObject(this.value.substr(0, subValue.length) === subValue);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_find(sub: BaseObject, start: BaseObject, end: BaseObject) {
    const subValue = StringObject.toString(sub, 'sub');
    const startValue = start ? IntegerObject.toInteger(start, 'start') : 0;
    const endValue = (end ? IntegerObject.toInteger(end, 'end') : this.value.length) - subValue.length;
    const ret = this.value.indexOf(subValue, startValue);
    if (ret < startValue || ret > endValue) {
      return new IntegerObject(-1);
    } else {
      return new IntegerObject(ret);
    }
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_format(callContext: CallableContext) {
    const ret = StringObject.applyFormat(
      this.value,
      i => {
        const v = callContext.indexedArgs[i];
        if (!v) {
          BaseObject.throwException(ExceptionType.FunctionArgumentError);
        } else {
          return v.object;
        }
      },
      key => {
        const v = callContext.namedArgs[key];
        if (!v) {
          BaseObject.throwException(ExceptionType.FunctionArgumentError);
        } else {
          return v;
        }
      },
    );
    return new StringObject(ret);
  }

  public static applyFormat(format: string, index: (i: number) => BaseObject, key: (k: string) => BaseObject): string {
    let ret = '';
    let pos = 0;
    let defaultIndex = 0;
    while (pos < format.length) {
      const open = format.indexOf('{', pos);
      if (open < 0) {
        ret += format.substr(pos);
        break;
      }
      if (open > pos) {
        ret += format.substr(pos, open - pos);
        pos = open;
      }
      const close = format.indexOf('}', pos + 1);
      if (close < 0) {
        ret += format.substr(pos);
        break;
      }
      const nextOpen = format.indexOf('{', pos + 1);
      if (nextOpen >= 0 && nextOpen < close) {
        ret += '{';
        pos++;
        continue;
      }
      const id = format.substr(open + 1, close - open - 1);
      let obj: BaseObject;
      if (!id) {
        obj = index(defaultIndex++);
      } else if (id.match(/^[0-9]+$/)) {
        obj = index(Number(id));
      } else {
        obj = key(id);
      }
      if (obj) {
        ret += obj.toString();
        pos = close + 1;
      } else {
        ret += '{';
        pos++;
      }
    }
    return ret;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_index(sub: BaseObject, start: BaseObject, end: BaseObject) {
    const subValue = StringObject.toString(sub, 'sub');
    const startValue = start ? IntegerObject.toInteger(start, 'start') : 0;
    const endValue = end ? IntegerObject.toInteger(end, 'end') : this.getCount() - subValue.length;
    const pos = this.value.indexOf(subValue, startValue);
    if (pos >= startValue && pos <= endValue) {
      return new IntegerObject(pos);
    }
    BaseObject.throwException(ExceptionType.ValueError, 'cannot find element');
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_isalnum() {
    return new BooleanObject(/^[A-Za-z0-9]+$/.test(this.value));
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_isalpha() {
    return new BooleanObject(/^[A-Za-z]+$/.test(this.value));
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_isascii() {
    if (!this.value) {
      return new BooleanObject(false);
    }
    for (let i = 0; i < this.value.length; i++) {
      if (this.value.charCodeAt(i) > 127) {
        return new BooleanObject(false);
      }
    }
    return new BooleanObject(true);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_isdecimal() {
    return new BooleanObject(/^[0-9]+$/.test(this.value));
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_isidentifier() {
    return new BooleanObject(/^[A-Za-z_][A-Za-z_0-9]*$/.test(this.value));
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_lower() {
    return new StringObject(this.value.toLowerCase());
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_islower() {
    if (!this.value) {
      return new BooleanObject(false);
    }
    return new BooleanObject(this.value === this.value.toLowerCase());
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_isnumeric() {
    return new BooleanObject(/^[0-9]+$/.test(this.value));
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_isprintable() {
    if (!this.value) {
      return new BooleanObject(false);
    }
    for (let i = 0; i < this.value.length; i++) {
      if (this.value.charCodeAt(i) < 20) {
        return new BooleanObject(false);
      }
    }
    return new BooleanObject(true);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_isspace() {
    if (!this.value) {
      return new BooleanObject(false);
    }
    for (let i = 0; i < this.value.length; i++) {
      switch (this.value[i]) {
        case ' ':
        case '\t':
          continue;
        default:
          return false;
      }
    }
    return new BooleanObject(true);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_istitle() {
    if (!this.value) {
      return new BooleanObject(false);
    }
    let waitUpper = true;
    for (let i = 0; i < this.value.length; i++) {
      switch (this.value[i]) {
        case ' ':
        case '\t':
        case '\r':
        case '\n':
          waitUpper = true;
          continue;
      }
      const c = this.value[i];
      if (waitUpper) {
        const upper = c.toUpperCase() === c;
        if (!upper) {
          return new BooleanObject(false);
        }
        waitUpper = false;
      } else {
        const lower = c.toLowerCase() === c;
        if (!lower) {
          return new BooleanObject(false);
        }
      }
    }
    return new BooleanObject(true);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_isupper() {
    for (let i = 0; i < this.value.length; i++) {
      const c = this.value[i];
      if (c.toUpperCase() !== c) {
        return new BooleanObject(false);
      }
    }
    return new BooleanObject(true);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_join(list: BaseObject) {
    if (!(list instanceof IterableObject)) {
      BaseObject.throwException(ExceptionType.TypeError, 'list');
      return;
    }
    if (list.getCount() === 0) {
      return new StringObject('');
    }
    let ret = list.getItem(0).toString();
    for (let i = 1; i < list.getCount(); i++) {
      ret += this.value + list.getItem(i).toString();
    }
    return new StringObject(ret);
  }

  private justify(width: BaseObject, separator: BaseObject, left: boolean) {
    const widthVal = IntegerObject.toInteger(width, 'width');
    const sepVal = separator ? StringObject.toString(separator, 'separator') : ' ';
    const repeat = sepVal.repeat(Math.max(0, widthVal - this.value.length));
    return new StringObject(left ? this.value + repeat : repeat + this.value);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_ljust(width: BaseObject, separator: BaseObject) {
    return this.justify(width, separator, true);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_rjust(width: BaseObject, separator: BaseObject) {
    return this.justify(width, separator, false);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_upper() {
    return new StringObject(this.value.toUpperCase());
  }

  private strip(value: string, sep: string, left: boolean) {
    let ret = value;
    while (ret.length > 0) {
      const c = left ? ret[0] : ret[ret.length - 1];
      if (sep.indexOf(c) < 0) {
        break;
      }
      ret = left ? ret.substr(1) : ret.substr(0, ret.length - 1);
    }
    return ret;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_lstrip(sep: BaseObject) {
    const sepVal = sep ? StringObject.toString(sep, 'sep') : ' \t\r\n';
    return new StringObject(this.strip(this.value, sepVal, true));
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_rstrip(sep: BaseObject) {
    const sepVal = sep ? StringObject.toString(sep, 'sep') : ' \t\r\n';
    return new StringObject(this.strip(this.value, sepVal, false));
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_strip(sep: BaseObject) {
    const sepVal = sep ? StringObject.toString(sep, 'sep') : ' \t\r\n';
    return new StringObject(this.strip(this.strip(this.value, sepVal, false), sepVal, true));
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public partitionBoth(part: string, left: boolean) {
    const pos = left ? this.value.indexOf(part) : this.value.lastIndexOf(part);
    if (pos <= 0) {
      if (left) {
        return BaseObject.createTuple([this, new StringObject(''), new StringObject('')]);
      } else {
        return BaseObject.createTuple([new StringObject(''), new StringObject(''), this]);
      }
    }
    return BaseObject.createTuple([
      new StringObject(this.value.substr(0, pos)),
      new StringObject(part),
      new StringObject(this.value.substr(pos + part.length)),
    ]);
  }

  @nativeFunction
  public partition(@param('part', StringObject) part: string) {
    return this.partitionBoth(part, true);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_rpartition(part: BaseObject) {
    const partVal = StringObject.toString(part, 'part');
    return this.partitionBoth(partVal, false);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_replace(from: BaseObject, to: BaseObject, count: BaseObject) {
    const fromVal = StringObject.toString(from, 'from');
    const toVal = StringObject.toString(to, 'to');
    const countVal = count ? IntegerObject.toInteger(count, 'count') : 1;
    let newValue = this.value;
    let replaced = 0;
    for (let pos = 0; pos < newValue.length; ) {
      const next = newValue.indexOf(fromVal, pos);
      if (next < 0) {
        break;
      }
      newValue = newValue.substr(0, next) + toVal + newValue.substr(next + fromVal.length);
      pos = next + toVal.length;
      replaced++;
      if (replaced >= countVal) {
        break;
      }
    }
    return new StringObject(newValue);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_rfind(sub: BaseObject, start: BaseObject, end: BaseObject): IntegerObject {
    const subVal = StringObject.toString(sub, 'sub');
    const startVal = start ? IntegerObject.toInteger(start, 'start') : 0;
    const endVal = (end ? IntegerObject.toInteger(end, 'end') : this.value.length) - subVal.length;
    const newPos = this.value.lastIndexOf(subVal, endVal);
    if (newPos < 0 || newPos < startVal) {
      return new IntegerObject(-1);
    }
    return new IntegerObject(newPos);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_rindex(sub: BaseObject, start: BaseObject, end: BaseObject) {
    const pos = this.native_rfind(sub, start, end);
    if (pos.value === -1) {
      BaseObject.throwException(ExceptionType.ValueError);
    }
    return pos;
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  private split(sep: BaseObject, maxsplit: BaseObject, left: boolean) {
    const sepVal = sep ? StringObject.toString(sep, 'sep') : '';
    const maxCount = maxsplit ? IntegerObject.toInteger(maxsplit, 'maxsplit') : -1;
    let last = left ? 0 : this.value.length;
    const values: string[] = [];
    for (let count = 0; ; count++) {
      let from: number, to: number;
      if (maxCount > 0 && count >= maxCount) {
        from = -1;
      } else {
        if (sepVal) {
          if (left) {
            from = this.value.indexOf(sepVal, last);
          } else {
            from = this.value.lastIndexOf(sepVal, last);
          }
          if (from >= 0) {
            to = from + sepVal.length;
          }
        } else {
          if (left) {
            for (from = last; from < this.value.length; from++) {
              if (isSpace(this.value[from])) {
                break;
              }
            }
            if (from >= this.value.length) {
              from = -1;
            } else {
              for (to = from; to < this.value.length; to++) {
                if (!isSpace(this.value[to])) {
                  break;
                }
              }
            }
          } else {
            for (from = last; from > 0; from--) {
              if (isSpace(this.value[from - 1])) {
                break;
              }
            }
            if (from === 0) {
              from = -1;
            } else {
              to = from;
              for (; from > 0; from--) {
                if (!isSpace(this.value[from - 1])) {
                  break;
                }
              }
            }
          }
        }
      }

      if (from < 0) {
        if (left) {
          if (last < (sepVal ? this.value.length + 1 : this.value.length)) {
            values.push(this.value.substr(last));
          }
        } else {
          if (last > (sepVal ? -1 : 0)) {
            values.unshift(this.value.substr(0, last));
          }
        }
        break;
      }

      if (left) {
        if (sepVal || from !== last) {
          values.push(this.value.substr(last, from - last));
        }
        last = to;
      } else {
        if (sepVal || from !== last) {
          values.unshift(this.value.substr(to, last - to));
        }
        last = from;
      }
    }

    return BaseObject.createList(values.map(v => new StringObject(v)));
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_split(sep: BaseObject, maxsplit: BaseObject) {
    return this.split(sep, maxsplit, true);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_rsplit(sep: BaseObject, maxsplit: BaseObject) {
    return this.split(sep, maxsplit, false);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_splitlines() {
    const ret: StringObject[] = [];
    let last = 0;
    for (let i = 0; ; ) {
      const c = this.value[i];
      if (c === '\r' || c === '\n' || i >= this.value.length) {
        if (i < this.value.length || i - last > 0) {
          ret.push(new StringObject(this.value.substr(last, i - last)));
        }
        i++;
        if (i > this.value.length) {
          break;
        }
        const n = this.value[i];
        if ((c === '\r' && n === '\n') || (c === '\n' && n === '\r')) {
          i++;
        }
        last = i;
      } else {
        i++;
      }
    }

    return BaseObject.createList(ret);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_swapcase() {
    const lower = this.value.toLowerCase();
    const upper = this.value.toUpperCase();
    let ret = '';
    for (let i = 0; i < this.value.length; i++) {
      const c = this.value[i];
      if (c !== lower[i]) {
        ret += lower[i];
      } else if (ret !== upper[i]) {
        ret += upper[i];
      } else {
        ret += c;
      }
    }
    return new StringObject(ret);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_title() {
    let ret = '';
    let upper = true;
    for (let i = 0; i < this.value.length; i++) {
      const c = this.value[i];
      if (c === ' ' || c === '\t' || c === '\r' || c === '\n') {
        upper = true;
        ret += c;
        continue;
      }
      if (upper) {
        ret += c.toUpperCase();
        upper = false;
      } else {
        ret += c.toLowerCase();
      }
    }
    return new StringObject(ret);
  }

  // eslint-disable-next-line @typescript-eslint/camelcase
  public native_zfill(width: BaseObject) {
    const widthVal = IntegerObject.toInteger(width, 'width');
    if (widthVal <= this.value.length) {
      return this;
    }
    let pos = 0;
    if (this.value[0] === '-' || this.value[0] === '+') {
      pos = 1;
    }
    const ret = this.value.substr(0, pos) + '0'.repeat(widthVal - this.value.length) + this.value.substr(pos);
    return new StringObject(ret);
  }
}
