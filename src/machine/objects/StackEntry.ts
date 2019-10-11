import { ObjectScope } from '../ObjectScope';
import { BaseObject } from './BaseObject';
import { FunctionRunContext } from '../FunctionRunContext';
import { CallableContext } from '../CallableContext';
import { Instruction } from '../../common/Instructions';
import { InstructionType } from '../../common/InstructionType';
import { RunContext } from '../RunContext';
import { ReferenceObject } from './ReferenceObject';
import { GeneratorObject } from './GeneratorObject';
import { ExceptionObject } from './ExceptionObject';
import { ExceptionType } from '../../api/ExceptionType';

export enum StackEntryType {
  WhileCycle = 'While',
  ForCycle = 'For',
  Try = 'Try',
  Function = 'Function',
}

export class StackEntry {
  public constructor(t: StackEntryType, parent: StackEntry, name: string) {
    this.type = t;
    this.parent = parent;
    this.name = name;
    this.functionEntry = t === StackEntryType.Function ? this : parent && parent.functionEntry;
  }

  public setReg(num: number, value: BaseObject) {
    this.regs[num] = value;
  }

  public getReg(num: number, extractRef: boolean, runContext: RunContext): BaseObject {
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
    for (let i = 0; i < this.code.length; i++) {
      if (this.code[i].type === InstructionType.Label && this.code[i].arg1 === label) {
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
  public scope: ObjectScope;
  public func: FunctionRunContext;
  public instruction: number;
  public startInstruction: number;
  public endInstruction: number;
  public noBreakInstruction: number;
  public nextPosition: number;
  public trySection: boolean;
  public code: Instruction[];
  private regs: BaseObject[] = [];
  public onFinish: (ret: BaseObject, exception: ExceptionObject) => boolean | void | undefined;
  public callContext: CallableContext = new CallableContext();
  public finallyHandled: boolean;
  public exceptHandled: boolean;
  public defaultReturnValue: BaseObject;
  public generatorObject: GeneratorObject;
  public exceptionVariable: string;
}
