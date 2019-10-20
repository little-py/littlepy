import { ExceptionObject } from '../objects/ExceptionObject';
import { ExceptionType } from '../../api/ExceptionType';
import { NumberObject } from '../objects/NumberObject';
import { IterableObject } from '../objects/IterableObject';
import { CallableIgnore } from '../NativeTypes';
import { RunContext } from '../RunContext';
import { ReferenceObject } from '../objects/ReferenceObject';
import { Callable } from '../../api/Callable';
import { CallContext } from '../../api/CallContext';
import { IteratorObject } from '../objects/IteratorObject';
import { SetObject } from '../objects/SetObject';
import { ListObject } from '../objects/ListObject';
import { FrozenSetObject } from '../objects/FrozenSetObject';
import { DictionaryObject } from '../objects/DictionaryObject';
import { PyObject } from '../../api/Object';
import { pyFunction, pyParam, pyParamArgs, pyParamKwargs } from '../../api/Decorators';
import { PropertyType } from '../../api/Native';
import { getObjectUtils } from '../../api/ObjectUtils';

class RangeObject extends IterableObject {
  private readonly items: number[];

  constructor(items: number[]) {
    super();
    this.items = items;
  }

  getCount(): number {
    return this.items.length;
  }

  getItem(index: number | string): PyObject {
    return new NumberObject(this.items[index]);
  }
}

class ExportedFunctions {
  @pyFunction
  abs(@pyParam('x') x: PyObject) {
    if (!(x instanceof NumberObject)) {
      throw new ExceptionObject(ExceptionType.TypeError, [], 'x');
    }
    return new NumberObject(Math.abs(x.value));
  }

  @pyFunction
  all(@pyParam('x', PropertyType.Iterable) x: IterableObject): boolean {
    let ret = true;
    for (let i = 0; i < x.getCount(); i++) {
      if (!x.getItem(i).toBoolean()) {
        ret = false;
        break;
      }
    }
    return ret;
  }

  @pyFunction
  any(@pyParam('x', PropertyType.Iterable) x: IterableObject): boolean {
    let ret = false;
    for (let i = 0; i < x.getCount(); i++) {
      if (x.getItem(i).toBoolean()) {
        ret = true;
        break;
      }
    }
    return ret;
  }

  @pyFunction
  chr(@pyParam('x', PropertyType.Number) x: number) {
    return String.fromCharCode(x);
  }

  @pyFunction
  min(@pyParamArgs args: PyObject[]) {
    if (args.length === 0) {
      throw new ExceptionObject(ExceptionType.ValueError);
    }
    let ret = getObjectUtils().toNumber(args[0], 'args');
    for (let i = 1; i < args.length; i++) {
      const next = getObjectUtils().toNumber(args[i], 'args');
      if (next < ret) {
        ret = next;
      }
    }
    return new NumberObject(ret);
  }

  @pyFunction
  max(@pyParamArgs args: PyObject[]) {
    if (args.length === 0) {
      throw new ExceptionObject(ExceptionType.ValueError);
    }
    let ret = getObjectUtils().toNumber(args[0], 'args');
    for (let i = 1; i < args.length; i++) {
      const next = getObjectUtils().toNumber(args[i], 'args');
      if (next > ret) {
        ret = next;
      }
    }
    return new NumberObject(ret);
  }

  @pyFunction
  sum(@pyParamArgs args: PyObject[]) {
    if (args.length === 0) {
      throw new ExceptionObject(ExceptionType.ValueError);
    }
    let ret = 0;
    for (let i = 0; i < args.length; i++) {
      const next = getObjectUtils().toNumber(args[i], 'args');
      ret += next;
    }
    return new NumberObject(ret);
  }

  @pyFunction
  print(
    @pyParamArgs args: PyObject[],
    @pyParamKwargs kwargs: { [key: string]: PyObject },
    @pyParam('', PropertyType.Machine) runContext: RunContext,
  ) {
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

  @pyFunction
  range(
    @pyParam('start', PropertyType.Number) start: number,
    @pyParam('end', PropertyType.Number, null) end: number,
    @pyParam('step', PropertyType.Number, null) step: number,
  ): PyObject {
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

  @pyFunction
  len(
    @pyParam('object') obj: PyObject,
    @pyParam('', PropertyType.CallContext) callContext: CallContext,
    @pyParam('', PropertyType.Machine) runContext: RunContext,
  ) {
    if (obj instanceof IterableObject) {
      return obj.getCount();
    }
    const len = obj.getAttribute('__len__');
    if (!len || !(len instanceof Callable)) {
      throw new ExceptionObject(ExceptionType.TypeError);
    } else {
      callContext.indexedArgs = [];
      runContext.callFunction(len, obj, (ret, exception) => {
        callContext.onFinish(ret, exception);
      });
    }
    return new CallableIgnore();
  }

  @pyFunction
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hash(@pyParam('object', PropertyType.Object) object: PyObject) {
    throw new ExceptionObject(ExceptionType.NotImplementedError, [], 'hash');
  }

  @pyFunction
  iter(@pyParam('object', PropertyType.Iterable) object: IterableObject) {
    return new IteratorObject(object);
  }

  @pyFunction
  set(@pyParam('source', PropertyType.Object, null) source: PyObject) {
    if (!source) {
      return new SetObject();
    }
    if (!(source instanceof IterableObject)) {
      throw new ExceptionObject(ExceptionType.ValueError);
    }
    const values: PyObject[] = [];
    for (let i = 0; i < source.getCount(); i++) {
      values.push(source.getItem(i));
    }

    return new SetObject(values);
  }

  @pyFunction
  frozenset(@pyParam('source', PropertyType.Object, null) source: PyObject) {
    if (!source) {
      return new FrozenSetObject();
    }
    if (!(source instanceof IterableObject)) {
      throw new ExceptionObject(ExceptionType.ValueError);
    }
    const values: PyObject[] = [];
    for (let i = 0; i < source.getCount(); i++) {
      values.push(source.getItem(i));
    }

    return new FrozenSetObject(values);
  }

  @pyFunction
  dict(@pyParamKwargs named: { [key: string]: PyObject }) {
    const dict = new DictionaryObject();
    for (const key of Object.keys(named)) {
      dict.setItem(key, named[key]);
    }
    return dict;
  }

  @pyFunction
  list(@pyParam('source', PropertyType.Object, null) source: PyObject) {
    if (!source) {
      return new SetObject();
    }
    if (!(source instanceof IterableObject)) {
      throw new ExceptionObject(ExceptionType.ValueError);
    }
    const values: PyObject[] = [];
    for (let i = 0; i < source.getCount(); i++) {
      values.push(source.getItem(i));
    }

    return new ListObject(values);
  }

  @pyFunction
  input(@pyParam('', PropertyType.CallContext) callContext: CallContext, @pyParam('', PropertyType.Machine) machine: RunContext) {
    machine.onReadLine(callContext.indexedArgs[0] ? getObjectUtils().toString(callContext.indexedArgs[0].object, 'prompt') : '', (result: string) => {
      callContext.onFinish(getObjectUtils().toPyObject(result, false), null);
    });
    return new CallableIgnore();
  }
}

export const exportedFunctions = new ExportedFunctions();
