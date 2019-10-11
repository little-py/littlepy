import { BaseObject } from '../objects/BaseObject';
import { ExceptionObject } from '../objects/ExceptionObject';
import { ExceptionType } from '../../api/ExceptionType';
import { RealObject } from '../objects/RealObject';
import { IntegerObject } from '../objects/IntegerObject';
import { IterableObject } from '../objects/IterableObject';
import { CallableIgnore, nativeFunction, param, paramArgs, paramKwargs, RunContextBase } from '../NativeTypes';
import { RunContext } from '../RunContext';
import { ReferenceObject } from '../objects/ReferenceObject';
import { CallableObject } from '../objects/CallableObject';
import { CallableContext } from '../CallableContext';
import { IteratorObject } from '../objects/IteratorObject';
import { SetObject } from '../objects/SetObject';
import { ListObject } from '../objects/ListObject';
import { FrozenSetObject } from '../objects/FrozenSetObject';
import { DictionaryObject } from '../objects/DictionaryObject';

class RangeObject extends IterableObject {
  private readonly items: number[];

  constructor(items: number[]) {
    super();
    this.items = items;
  }

  getCount(): number {
    return this.items.length;
  }

  getItem(index: number | string): BaseObject {
    return new IntegerObject(this.items[index]);
  }
}

class ExportedFunctions {
  @nativeFunction
  abs(@param('x') x: BaseObject) {
    if (x instanceof IntegerObject) {
      return new IntegerObject(Math.abs(x.value));
    }
    if (!x.canBeReal()) {
      throw new ExceptionObject(ExceptionType.TypeError, [], 'x');
    }
    return new RealObject(Math.abs(x.toReal()));
  }

  @nativeFunction
  all(@param('x', IterableObject) x: IterableObject): boolean {
    let ret = true;
    for (let i = 0; i < x.getCount(); i++) {
      if (!x.getItem(i).toBoolean()) {
        ret = false;
        break;
      }
    }
    return ret;
  }

  @nativeFunction
  any(@param('x', IterableObject) x: IterableObject): boolean {
    let ret = false;
    for (let i = 0; i < x.getCount(); i++) {
      if (x.getItem(i).toBoolean()) {
        ret = true;
        break;
      }
    }
    return ret;
  }

  @nativeFunction
  chr(@param('x', IntegerObject) x: number) {
    return String.fromCharCode(x);
  }

  @nativeFunction
  min(@paramArgs args: BaseObject[]) {
    if (args.length === 0) {
      throw new ExceptionObject(ExceptionType.ValueError);
    }
    let ret = args[0].toReal();
    for (let i = 1; i < args.length; i++) {
      const next = args[i].toReal();
      if (next < ret) {
        ret = next;
      }
    }
    return new RealObject(ret);
  }

  @nativeFunction
  max(@paramArgs args: BaseObject[]) {
    if (args.length === 0) {
      throw new ExceptionObject(ExceptionType.ValueError);
    }
    let ret = args[0].toReal();
    for (let i = 1; i < args.length; i++) {
      const next = args[i].toReal();
      if (next > ret) {
        ret = next;
      }
    }
    return new RealObject(ret);
  }

  @nativeFunction
  sum(@paramArgs args: BaseObject[]) {
    if (args.length === 0) {
      throw new ExceptionObject(ExceptionType.ValueError);
    }
    let ret = 0;
    for (let i = 0; i < args.length; i++) {
      const next = args[i].toReal();
      ret += next;
    }
    return new RealObject(ret);
  }

  @nativeFunction
  print(@paramArgs args: BaseObject[], @paramKwargs kwargs: { [key: string]: BaseObject }, @param('', RunContextBase) runContext: RunContext) {
    let output = '';
    for (let i = 0; i < args.length; i++) {
      if (i > 0) {
        output += ' ';
      }
      let arg = args[i];
      if (arg instanceof ReferenceObject) {
        arg = arg.getValue(runContext);
      }
      output += arg.toString();
    }
    if (kwargs.end) {
      runContext.write(output);
      let end = kwargs.end.toString();
      for (;;) {
        const returnPos = end.indexOf('\n');
        if (returnPos < 0) {
          break;
        }
        runContext.writeLine(output + end.substr(0, returnPos));
        end = end.substr(returnPos + 1);
      }
      if (end) {
        runContext.write(end);
      }
    } else {
      runContext.writeLine(output);
    }
  }

  @nativeFunction
  range(
    @param('start', IntegerObject) start: number,
    @param('end', IntegerObject, null) end: number,
    @param('step', IntegerObject, null) step: number,
  ): BaseObject {
    if (step === null) {
      step = 1;
    } else {
      if (step === 0) {
        throw new ExceptionObject(ExceptionType.FunctionArgumentError);
      }
    }
    if (end === null) {
      end = start;
      start = 0;
    }
    // TODO: should be dynamically generated sequence
    const items: number[] = [];
    if (step < 0) {
      for (let i = start; i > end; i += step) {
        items.push(i);
      }
    } else {
      for (let i = start; i < end; i += step) {
        items.push(i);
      }
    }
    return new RangeObject(items);
  }

  @nativeFunction
  len(@param('object') obj: BaseObject, @param('', CallableContext) callContext: CallableContext, @param('', RunContextBase) runContext: RunContext) {
    if (obj instanceof IterableObject) {
      return obj.getCount();
    }
    const len = obj.getAttribute('__len__');
    if (!len || !(len instanceof CallableObject)) {
      throw new ExceptionObject(ExceptionType.TypeError);
    } else {
      callContext.indexedArgs = [];
      runContext.callFunction(len, obj, (ret, exception) => {
        callContext.onFinish(ret, exception);
      });
    }
    return new CallableIgnore();
  }

  @nativeFunction
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hash(@param('object', BaseObject) object: BaseObject) {
    throw new ExceptionObject(ExceptionType.NotImplementedError, [], 'hash');
  }

  @nativeFunction
  iter(@param('object', IterableObject) object: IterableObject) {
    return new IteratorObject(object);
  }

  @nativeFunction
  set(@param('source', BaseObject, null) source: BaseObject) {
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
  }

  @nativeFunction
  frozenset(@param('source', BaseObject, null) source: BaseObject) {
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
  }

  @nativeFunction
  dict(@paramKwargs named: { [key: string]: BaseObject }) {
    const dict = new DictionaryObject();
    for (const key of Object.keys(named)) {
      dict.setItem(key, named[key]);
    }
    return dict;
  }

  @nativeFunction
  list(@param('source', BaseObject, null) source: BaseObject) {
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
  }
}

export const exportedFunctions = new ExportedFunctions();
