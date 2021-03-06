import { ContainerObject } from './ContainerObject';
import { ExceptionType } from '../../api/ExceptionType';
import { IterableObject } from './IterableObject';
import { PyObject } from '../../api/Object';
import { getObjectUtils } from '../../api/ObjectUtils';
import { pyFunction, pyParam, pyParamArgs, pyParamKwargs } from '../../api/Decorators';
import { PropertyType } from '../../api/Native';
import { UniqueErrorCode } from '../../api/UniqueErrorCode';

function isSpace(c: string): boolean {
  return c === ' ' || c === '\t' || c === '\r' || c === '\n';
}

export class StringObject extends ContainerObject {
  public readonly value: string;

  public constructor(value: string) {
    super();
    this.value = value;
  }

  getCount(): number {
    return this.value.length;
  }

  getItem(index: number | string): PyObject {
    if (typeof index !== 'number') {
      getObjectUtils().throwException(ExceptionType.TypeError, UniqueErrorCode.ExpectedNumericIndexer, 'index');
    }
    return new StringObject(this.value[index]);
  }

  public toBoolean(): boolean {
    return this.value && this.value.length > 0;
  }

  public toString(): string {
    return this.value;
  }

  public equals(to: PyObject): boolean {
    if (to instanceof StringObject) {
      return this.value === to.value;
    }
    return super.equals(to);
  }

  public compare(to: PyObject): number {
    if (to instanceof StringObject) {
      if (this.value < to.value) {
        return -1;
      } else if (this.value === to.value) {
        return 0;
      } else {
        return 1;
      }
    }
    return super.compare(to);
  }

  public contains(value: PyObject): boolean {
    const substr = value.toString();
    return this.value.indexOf(substr) >= 0;
  }

  @pyFunction
  public capitalize(): string {
    return this.value ? this.value[0].toUpperCase() + this.value.substr(1) : '';
  }

  @pyFunction
  public center(
    @pyParam('width', PropertyType.Number) width: number, //
    @pyParam('fillchar', PropertyType.String, ' ') fillchar: string,
  ): string {
    if (this.value.length >= width) {
      return this.value;
    }
    const left = Math.floor((width - this.value.length) / 2);
    return fillchar.repeat(left) + this.value + fillchar.repeat(width - left - this.value.length);
  }

  @pyFunction
  public count(
    @pyParam('sub', PropertyType.String) sub: string,
    @pyParam('start', PropertyType.Number, 0) start: number,
    @pyParam('end', PropertyType.Number, -1) end: number,
  ): number {
    const from = start;
    const to = (end < 0 ? this.value.length : end) - sub.length;
    let count = 0;
    for (let i = from; i < to; i++) {
      if (this.value.substr(i, sub.length) === sub) {
        count++;
      }
    }
    return count;
  }

  @pyFunction
  public endswith(@pyParam('sub', PropertyType.String) sub: string): boolean {
    return this.value.substr(this.value.length - sub.length) === sub;
  }

  @pyFunction
  public startswith(@pyParam('sub', PropertyType.String) sub: string): boolean {
    return this.value.substr(0, sub.length) === sub;
  }

  @pyFunction
  public find(
    @pyParam('sub', PropertyType.String) sub: string,
    @pyParam('start', PropertyType.Number, 0) start: number,
    @pyParam('end', PropertyType.Number, -1) end: number,
  ): number {
    if (end === -1) {
      end = this.value.length;
    }
    end -= sub.length;
    const ret = this.value.indexOf(sub, start);
    if (ret < start || ret > end) {
      return -1;
    } else {
      return ret;
    }
  }

  @pyFunction
  public format(@pyParamArgs indexed: PyObject[], @pyParamKwargs named: { [key: string]: PyObject }): string {
    return StringObject.applyFormat(
      this.value,
      (i) => {
        const v = indexed[i];
        if (!v) {
          getObjectUtils().throwException(ExceptionType.FunctionArgumentError, UniqueErrorCode.IndexerIsOutOfRange, i.toString());
        } else {
          return v;
        }
      },
      (key) => {
        const v = named[key];
        if (!v) {
          getObjectUtils().throwException(ExceptionType.FunctionArgumentError, UniqueErrorCode.IndexerIsOutOfRange, key);
        } else {
          return v;
        }
      },
    );
  }

  public static applyFormat(format: string, index: (i: number) => PyObject, key: (k: string) => PyObject): string {
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
      let obj: PyObject;
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

  @pyFunction
  public index(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/explicit-module-boundary-types
    @pyParam('sub', PropertyType.String) sub: any,
    @pyParam('start', PropertyType.Number, 0) start: number,
    @pyParam('end', PropertyType.Number, -1) end: number,
  ): number {
    if (end === -1) {
      end = this.value.length;
    }
    end -= sub.length;
    const pos = this.value.indexOf(sub, start);
    if (pos >= start && pos <= end) {
      return pos;
    }
    getObjectUtils().throwException(ExceptionType.ValueError, UniqueErrorCode.CannotFindObjectInIterator, sub);
  }

  @pyFunction
  public isalnum(): boolean {
    return /^[A-Za-z0-9]+$/.test(this.value);
  }

  @pyFunction
  public isalpha(): boolean {
    return /^[A-Za-z]+$/.test(this.value);
  }

  @pyFunction
  public isascii(): boolean {
    if (!this.value) {
      return false;
    }
    for (let i = 0; i < this.value.length; i++) {
      if (this.value.charCodeAt(i) > 127) {
        return false;
      }
    }
    return true;
  }

  @pyFunction
  public isdecimal(): boolean {
    return /^[0-9]+$/.test(this.value);
  }

  @pyFunction
  public isidentifier(): boolean {
    return /^[A-Za-z_][A-Za-z_0-9]*$/.test(this.value);
  }

  @pyFunction
  public lower(): string {
    return this.value.toLowerCase();
  }

  @pyFunction
  public islower(): boolean {
    if (!this.value) {
      return false;
    }
    return this.value === this.value.toLowerCase();
  }

  @pyFunction
  public isnumeric(): boolean {
    return /^[0-9]+$/.test(this.value);
  }

  @pyFunction
  public isprintable(): boolean {
    if (!this.value) {
      return false;
    }
    for (let i = 0; i < this.value.length; i++) {
      if (this.value.charCodeAt(i) < 20) {
        return false;
      }
    }
    return true;
  }

  @pyFunction
  public isspace(): boolean {
    if (!this.value) {
      return false;
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
    return true;
  }

  @pyFunction
  public istitle(): boolean {
    if (!this.value) {
      return false;
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
          return false;
        }
        waitUpper = false;
      } else {
        const lower = c.toLowerCase() === c;
        if (!lower) {
          return false;
        }
      }
    }
    return true;
  }

  @pyFunction
  public isupper(): boolean {
    for (let i = 0; i < this.value.length; i++) {
      const c = this.value[i];
      if (c.toUpperCase() !== c) {
        return false;
      }
    }
    return true;
  }

  @pyFunction
  public join(@pyParam('list', PropertyType.Iterable) list: IterableObject): string {
    if (list.getCount() === 0) {
      return '';
    }
    let ret = list.getItem(0).toString();
    for (let i = 1; i < list.getCount(); i++) {
      ret += this.value + list.getItem(i).toString();
    }
    return ret;
  }

  private justifyAny(width: number, separator: string, left: boolean): string {
    const repeat = separator.repeat(Math.max(0, width - this.value.length));
    return left ? this.value + repeat : repeat + this.value;
  }

  @pyFunction
  public ljust(@pyParam('width', PropertyType.Number) width: number, @pyParam('separator', PropertyType.String, ' ') separator: string): string {
    return this.justifyAny(width, separator, true);
  }

  @pyFunction
  public rjust(@pyParam('width', PropertyType.Number) width: number, @pyParam('separator', PropertyType.String, ' ') separator: string): string {
    return this.justifyAny(width, separator, false);
  }

  @pyFunction
  public upper(): string {
    return this.value.toUpperCase();
  }

  private stripAny(value: string, sep: string, left: boolean) {
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

  @pyFunction
  public lstrip(@pyParam('sep', PropertyType.String, ' \t\r\n') sep: string): string {
    return this.stripAny(this.value, sep, true);
  }

  @pyFunction
  public rstrip(@pyParam('sep', PropertyType.String, ' \t\r\n') sep: string): string {
    return this.stripAny(this.value, sep, false);
  }

  @pyFunction
  public strip(@pyParam('sep', PropertyType.String, ' \t\r\n') sep: string): string {
    return this.stripAny(this.stripAny(this.value, sep, false), sep, true);
  }

  public partitionAny(part: string, left: boolean): PyObject {
    const pos = left ? this.value.indexOf(part) : this.value.lastIndexOf(part);
    if (pos <= 0) {
      if (left) {
        return getObjectUtils().createTuple([this, new StringObject(''), new StringObject('')]);
      } else {
        return getObjectUtils().createTuple([new StringObject(''), new StringObject(''), this]);
      }
    }
    return getObjectUtils().createTuple([
      new StringObject(this.value.substr(0, pos)),
      new StringObject(part),
      new StringObject(this.value.substr(pos + part.length)),
    ]);
  }

  @pyFunction
  public partition(@pyParam('part', PropertyType.String) part: string): PyObject {
    return this.partitionAny(part, true);
  }

  @pyFunction
  public rpartition(@pyParam('part', PropertyType.String) part: string): PyObject {
    return this.partitionAny(part, false);
  }

  @pyFunction
  public replace(
    @pyParam('from', PropertyType.String) from: string,
    @pyParam('to', PropertyType.String) to: string,
    @pyParam('count', PropertyType.Number, 1) count: number,
  ): string {
    let newValue = this.value;
    let replaced = 0;
    for (let pos = 0; pos < newValue.length; ) {
      const next = newValue.indexOf(from, pos);
      if (next < 0) {
        break;
      }
      newValue = newValue.substr(0, next) + to + newValue.substr(next + from.length);
      pos = next + to.length;
      replaced++;
      if (replaced >= count) {
        break;
      }
    }
    return newValue;
  }

  @pyFunction
  public rfind(
    @pyParam('sub', PropertyType.String) sub: string,
    @pyParam('start', PropertyType.Number, 0) start: number,
    @pyParam('end', PropertyType.Number, -1) end: number,
  ): number {
    end = (end === -1 ? this.value.length : end) - sub.length;
    const newPos = this.value.lastIndexOf(sub, end);
    if (newPos < 0 || newPos < start) {
      return -1;
    }
    return newPos;
  }

  @pyFunction
  public rindex(
    @pyParam('sub', PropertyType.String) sub: string,
    @pyParam('start', PropertyType.Number, 0) start: number,
    @pyParam('end', PropertyType.Number, -1) end: number,
  ): number {
    const pos = this.rfind(sub, start, end);
    if (pos === -1) {
      getObjectUtils().throwException(ExceptionType.ValueError, UniqueErrorCode.CannotFindObjectInIterator, sub);
    }
    return pos;
  }

  private splitAny(sep: string, maxCount: number, left: boolean): PyObject {
    let last = left ? 0 : this.value.length;
    const values: string[] = [];
    for (let count = 0; ; count++) {
      let from: number, to: number;
      if (maxCount > 0 && count >= maxCount) {
        from = -1;
      } else {
        if (sep) {
          if (left) {
            from = this.value.indexOf(sep, last);
          } else {
            from = this.value.lastIndexOf(sep, last);
          }
          if (from >= 0) {
            to = from + sep.length;
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
          if (last < (sep ? this.value.length + 1 : this.value.length)) {
            values.push(this.value.substr(last));
          }
        } else {
          if (last > (sep ? -1 : 0)) {
            values.unshift(this.value.substr(0, last));
          }
        }
        break;
      }

      if (left) {
        if (sep || from !== last) {
          values.push(this.value.substr(last, from - last));
        }
        last = to;
      } else {
        if (sep || from !== last) {
          values.unshift(this.value.substr(to, last - to));
        }
        last = from;
      }
    }

    return getObjectUtils().createList(values.map((v) => new StringObject(v)));
  }

  @pyFunction
  public split(@pyParam('sep', PropertyType.String, '') sep: string, @pyParam('maxsplit', PropertyType.Number, -1) maxsplit: number): PyObject {
    return this.splitAny(sep, maxsplit, true);
  }

  @pyFunction
  public rsplit(@pyParam('sep', PropertyType.String, '') sep: string, @pyParam('maxsplit', PropertyType.Number, -1) maxsplit: number): PyObject {
    return this.splitAny(sep, maxsplit, false);
  }

  @pyFunction
  public splitlines(): PyObject {
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

    return getObjectUtils().createList(ret);
  }

  @pyFunction
  public swapcase(): StringObject {
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

  @pyFunction
  public title(): StringObject {
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

  @pyFunction
  public zfill(@pyParam('width', PropertyType.Number) width: number): string {
    if (width <= this.value.length) {
      return this.value;
    }
    let pos = 0;
    if (this.value[0] === '-' || this.value[0] === '+') {
      pos = 1;
    }
    return this.value.substr(0, pos) + '0'.repeat(width - this.value.length) + this.value.substr(pos);
  }
}
