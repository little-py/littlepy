import { ObjectScope } from '../ObjectScope';
import { BaseObject } from './BaseObject';
import { FunctionRunContext } from '../FunctionRunContext';
import { CallableContext } from '../CallableContext';
import { Instruction } from '../../common/Instructions';
import { InstructionType } from '../../common/InstructionType';
import { RunContext } from '../RunContext';
import { ReferenceObject } from './ReferenceObject';
import { GeneratorObject } from './GeneratorObject';
import { ObjectType } from '../../api/ObjectType';

export enum StackEntryType {
  StackEntryWhileCycle,
  StackEntryForCycle,
  StackEntryTry,
  StackEntryFunction,
}

export class StackEntry {
  public constructor(t: StackEntryType, parent: StackEntry, name: string) {
    this.type = t;
    this.parent = parent;
    this.name = name;
    this.functionEntry = t === StackEntryType.StackEntryFunction ? this : parent && parent.functionEntry;
  }

  public setReg(num: number, value: BaseObject) {
    this.regs[num] = value;
  }

  public getReg(num: number, extractRef: boolean, runContext: RunContext): BaseObject {
    let reg = this.regs[num];
    if (!reg) {
      runContext.raiseNullException();
      return;
    }
    if (extractRef && reg.type === ObjectType.Reference) {
      reg = (reg as ReferenceObject).getValue(runContext);
    }
    return reg;
  }

  public findLabel(label: number): number {
    for (let i = 0; i < this.code.length; i++) {
      if (this.code[i].iType === InstructionType.ILabel && this.code[i].arg1 === label) {
        return i + 1;
      }
    }
    return -1;
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
  public returnReg: number;
  public callContext: CallableContext = new CallableContext();
  public finallyHandled: boolean;
  public exceptHandled: boolean;
  public defaultReturnValue: BaseObject;
  public onReturn: (ret: BaseObject) => BaseObject;
  public generatorObject: GeneratorObject;
  public exceptionVariable: string;
}
