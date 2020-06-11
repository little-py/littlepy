import { CallContext } from '../api/CallContext';
import { RunContext } from './RunContext';
import { ReferenceObject } from './objects/ReferenceObject';
import { GeneratorObject } from './objects/GeneratorObject';
import { ExceptionObject } from './objects/ExceptionObject';
import { ExceptionType } from '../api/ExceptionType';
import { PyObject } from '../api/Object';
import { PyStackEntry } from '../api/StackEntry';
import { PyScope } from '../api/Scope';
import { FunctionContext } from '../api/FunctionContext';
import { UniqueErrorCode } from '../api/UniqueErrorCode';
import { InstructionType } from '../generator/InstructionType';
import { FunctionBody } from '../api/FunctionBody';
import { FullCodeInst } from '../generator/FullCodeInst';

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

  public setIndexedArg(index: number, object: PyObject, expand: boolean): void {
    this.callContext.indexedArgs[index] = {
      object,
      expand,
    };
  }

  public setNamedArg(name: string, obj: PyObject): void {
    this.callContext.namedArgs[name] = obj;
  }

  public setReg(num: number, value: PyObject): void {
    this.regs[num] = value;
  }

  public getReg(num: number, extractRef: boolean, runContext: RunContext): PyObject {
    let reg = this.regs[num];
    if (!reg) {
      // safety check
      /* istanbul ignore next */
      throw new ExceptionObject(ExceptionType.ReferenceError, UniqueErrorCode.RegisterIsNotSet, [], num.toString());
    }
    if (extractRef && reg instanceof ReferenceObject) {
      reg = reg.getValue(runContext);
    }
    return reg;
  }

  public findLabel(label: number): number {
    const code = this.functionBody.code as FullCodeInst;
    for (let i = 0; i < code.instructions.length; i++) {
      if (code.instructions[i].type === InstructionType.Label && code.instructions[i].arg1 === label) {
        return i + 1;
      }
    }
    // safety check
    /* istanbul ignore next */
    throw new ExceptionObject(ExceptionType.SystemError, UniqueErrorCode.CannotFindLabel, [], label.toString());
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
