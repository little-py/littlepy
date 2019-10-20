import { CallContext } from '../api/CallContext';
import { InstructionType } from '../common/InstructionType';
import { RunContext } from './RunContext';
import { ReferenceObject } from './objects/ReferenceObject';
import { GeneratorObject } from './objects/GeneratorObject';
import { ExceptionObject } from './objects/ExceptionObject';
import { ExceptionType } from '../api/ExceptionType';
import { PyObject } from '../api/Object';
import { PyStackEntry } from '../api/StackEntry';
import { FunctionBody } from '../common/FunctionBody';
import { PyScope } from '../api/Scope';
import { FunctionContext } from '../api/FunctionContext';

export enum StackEntryType {
  WhileCycle = 'While',
  ForCycle = 'For',
  Try = 'Try',
  Function = 'Function',
}

export class StackEntry implements PyStackEntry {
  public constructor(t: StackEntryType, parent: StackEntry, name: string) {
    this.type = t;
    this.parent = parent;
    this.name = name;
    this.functionEntry = t === StackEntryType.Function ? this : parent && parent.functionEntry;
  }

  public setIndexedArg(index: number, object: PyObject, expand: boolean) {
    this.callContext.indexedArgs[index] = {
      object,
      expand,
    };
  }

  public setNamedArg(name: string, obj: PyObject) {
    this.callContext.namedArgs[name] = obj;
  }

  public setReg(num: number, value: PyObject) {
    this.regs[num] = value;
  }

  public getReg(num: number, extractRef: boolean, runContext: RunContext): PyObject {
    let reg = this.regs[num];
    if (!reg) {
      // safety check
      /* istanbul ignore next */
      throw new ExceptionObject(ExceptionType.ReferenceError);
    }
    if (extractRef && reg instanceof ReferenceObject) {
      reg = reg.getValue(runContext);
    }
    return reg;
  }

  public findLabel(label: number): number {
    for (let i = 0; i < this.functionBody.code.length; i++) {
      if (this.functionBody.code[i].type === InstructionType.Label && this.functionBody.code[i].arg1 === label) {
        return i + 1;
      }
    }
    // safety check
    /* istanbul ignore next */
    throw new ExceptionObject(ExceptionType.SystemError);
  }

  public name: string;
  public readonly type: StackEntryType;
  public parent: StackEntry;
  public functionEntry: StackEntry;
  public scope: PyScope;
  public functionContext: FunctionContext;
  public functionBody: FunctionBody;
  public instruction: number;
  public startInstruction: number;
  public endInstruction: number;
  public noBreakInstruction: number;
  public nextPosition: number;
  public trySection: boolean;
  private regs: PyObject[] = [];
  public onFinish: (ret: PyObject, exception: ExceptionObject) => boolean | void | undefined;
  public callContext: CallContext = new CallContext();
  public finallyHandled: boolean;
  public exceptHandled: boolean;
  public defaultReturnValue: PyObject;
  public generatorObject: GeneratorObject;
  public exceptionVariable: string;
}
