import { BaseObject } from './objects/BaseObject';
import { Instruction } from '../common/Instructions';
import { GlobalScope, ObjectScope } from './ObjectScope';
import { StackEntry, StackEntryType } from './objects/StackEntry';
import { IntegerObject } from './objects/IntegerObject';
import { RealObject } from './objects/RealObject';
import { FunctionRunContext } from './FunctionRunContext';
import { NoneObject } from './objects/NoneObject';
import { FunctionObject } from './objects/FunctionObject';
import { ListObject } from './objects/ListObject';
import { CallableObject } from './objects/CallableObject';
import { ExceptionObject, ExceptionType } from './objects/ExceptionObject';
import { StringObject } from './objects/StringObject';
import { BytesObject } from './objects/BytesObject';
import { CompiledModule } from '../compiler/CompiledModule';
import { ArgumentType, FunctionArgument, FunctionBody, FunctionType } from '../common/FunctionBody';
import { LiteralType } from '../compiler/Literal';
import { InstructionType } from '../common/InstructionType';
import { ContinueContext, ContinueContextType } from './ContinueContext';
import { ModuleObject } from './objects/ModuleObject';
import { ReferenceObject, ReferenceScope, ReferenceType } from './objects/ReferenceObject';
import { TupleObject } from './objects/TupleObject';
import { SetObject } from './objects/SetObject';
import { DictionaryObject } from './objects/DictionaryObject';
import { BooleanObject } from './objects/BooleanObject';
import { InstanceMethodObject } from './objects/InstanceMethodObject';
import { ClassInheritance, ClassObject } from './objects/ClassObject';
import { ClassInstanceObject } from './objects/ClassInstanceObject';
import { SuperProxyObject } from './objects/SuperProxyObject';
import { GeneratorObject } from './objects/GeneratorObject';
import { calculateResolutionOrder } from './CalculateResolutionOrder';
import { ExceptionClassObject } from './objects/ExceptionClassObject';
import { PyMachine } from '../api/Machine';
import { PyMachinePosition } from '../api/MachinePosition';
import { PyBreakpoint } from '../api/Breakpoint';
import { ObjectType } from '../api/ObjectType';

export class RunContext implements PyMachine {
  private readonly _compiledModules: { [key: string]: CompiledModule };
  private _breakpoints: { [key: string]: boolean } = {};
  private _functions: { [id: string]: FunctionRunContext } = {};
  private _importedModules: { [id: string]: ModuleObject } = {};
  private _globalScope: GlobalScope;
  private _noneObject: BaseObject;
  private _currentStack: StackEntry;
  private _stackCounter = 1;
  private _currentInstruction = -1;
  private _continueContext: ContinueContext;
  private _unhandledException: ExceptionObject;
  private _currentException: BaseObject;
  private _output: string[] = [];
  private _finished = true;
  private _locationId: string;
  private _position: PyMachinePosition;
  public onWriteLine: (line: string) => void = null;
  public onLeaveFunction: (stack: StackEntry) => void = () => {};
  private _finishedCallback: (returnValue: BaseObject, error: ExceptionObject) => void = null;
  private _cachedOutputLine = '';

  private prepareStart() {
    this._finished = false;
    this._currentStack = undefined;
    this._output = [];
    this._locationId = undefined;
    this._currentInstruction = -1;
    this._continueContext = undefined;
    this._unhandledException = undefined;
    this._currentException = undefined;
    this._position = undefined;
  }

  public getGlobalScope() {
    return this._globalScope;
  }

  public getUnhandledException() {
    return this._unhandledException;
  }

  public getCurrentScope() {
    return this.getCurrentFunctionStack().scope;
  }

  public constructor(modules: { [key: string]: CompiledModule } = {}, breakpoints: PyBreakpoint[] = []) {
    this._compiledModules = modules;
    this.updateBreakpoints(breakpoints);
    this.initializeFunctions();
    this.createGlobalScope();
  }

  public updateBreakpoints(breakpoints: PyBreakpoint[]) {
    this._breakpoints = {};
    for (const breakpoint of breakpoints) {
      const key = `${breakpoint.moduleId}_${breakpoint.row}`;
      this._breakpoints[key] = true;
    }
  }

  public getPosition(): PyMachinePosition {
    if (this._position) {
      return this._position;
    }
    if (this._currentInstruction === -1) {
      return;
    }
    const functionStack = this.getCurrentFunctionStack();
    if (!functionStack) {
      return;
    }
    const func = functionStack.func.func;
    const instruction = functionStack.code[this._currentInstruction];
    this._position = {
      module: func.module,
      func,
      column: instruction.column,
      row: instruction.row,
      position: instruction.position,
    };
    return this._position;
  }

  public run() {
    while (this.step()) {}
  }

  public stop() {
    this.onFinished();
  }

  public debug() {
    this.debugUntilCondition();
  }

  public debugIn() {
    this.debugUntilCondition(() => true);
  }

  public setStackEntry(stackEntry: StackEntry) {
    this._currentStack = stackEntry;
  }

  public getStackEntry(): StackEntry {
    return this._currentStack;
  }

  public debugOut() {
    const currentStack = this.getCurrentFunctionStack();
    const parentStack = currentStack && currentStack.parent && currentStack.parent.functionEntry;
    if (!parentStack) {
      this.debug();
    } else {
      this.debugUntilCondition(() => this.getCurrentFunctionStack() === parentStack);
    }
  }

  public debugOver() {
    const currentStack = this.getCurrentFunctionStack();
    if (!currentStack) {
      return;
    }
    const parentStack = currentStack.parent && currentStack.parent.functionEntry;
    this.debugUntilCondition(() => {
      const current = this.getCurrentFunctionStack();
      return current === currentStack || current === parentStack;
    });
  }

  public isFinished(): boolean {
    return !!(this._finished || this._unhandledException || !this._currentStack);
  }

  private getModuleFunction(module: CompiledModule) {
    return Object.values(module.functions).find(f => f.type === FunctionType.FunctionTypeModule);
  }

  public startCallModule(name: string, finishCallback: (returnValue: BaseObject, error: ExceptionObject) => void = undefined) {
    if (!this._finished) {
      throw Error('Run context is not finished');
    }
    const module = this._compiledModules[name];
    if (!module) {
      this.raiseUnknownIdentifier(name);
      return;
    }
    const moduleFunction = this.getModuleFunction(module);
    /* istanbul ignore next */
    if (moduleFunction === undefined) {
      // should never happen in correctly compiled code
      this.onRuntimeError();
      return;
    }

    this.prepareStart();

    this._finishedCallback = finishCallback;
    const startModule = this.createFunction(moduleFunction);
    const args: BaseObject[] = [];
    this.enterFunction(startModule, 0, args, null);
  }

  public startCallFunction(moduleName: string, funcName: string, args: BaseObject[] = [], finishCallback: (returnValue: BaseObject, error: ExceptionObject) => void = undefined) {
    if (!this._finished) {
      throw Error('Run context is not finished');
    }
    const module = this._importedModules[moduleName];
    if (!module) {
      this.onRuntimeError();
      return;
    }
    const functionObject: FunctionObject = module.getAttribute(funcName) as FunctionObject;
    if (!functionObject) {
      this.onRuntimeError();
      return;
    }

    this.prepareStart();
    this._finishedCallback = finishCallback;
    const func = this._functions[functionObject.context.func.id];
    this.enterFunction(func, 0, args, null);
  }

  public write(output: string) {
    this._cachedOutputLine += output;
  }

  public writeLine(output: string) {
    output = this._cachedOutputLine + output;
    this._cachedOutputLine = '';
    if (this.onWriteLine) {
      this.onWriteLine(output);
    } else {
      this._output.push(output);
    }
  }

  public getOutput(): string[] {
    return this._output;
  }

  public getOutputText() {
    return this._output.join('\n');
  }

  private initializeFunctions() {
    let id = 1;
    for (const m of Object.values(this._compiledModules)) {
      for (const f of m.functions) {
        if (f.type === FunctionType.FunctionTypeModule) {
          f.id = `${id}.${m.name}`;
        } else {
          f.id = `${id}.${m.name}.${f.name}`;
        }
        id++;
        f.module = m;
      }
    }
  }

  private debugUntilCondition(callback?: () => boolean) {
    while (!this.isFinished()) {
      const current = this._locationId;
      while (!this.isFinished() && this._locationId === current) {
        this.step();
      }
      if (this.isFinished()) {
        break;
      }
      if (this._breakpoints[this._locationId]) {
        break;
      }
      if (callback && callback()) {
        break;
      }
    }
  }

  private onCodeBlockFinished(functionStack: StackEntry) {
    let retObject: BaseObject;
    const { module, type } = functionStack.func.func;
    if (type === FunctionType.FunctionTypeModule) {
      const moduleInstance = new ModuleObject();
      moduleInstance.name = module.name;
      for (const propName of Object.keys(functionStack.scope.objects)) {
        const obj = functionStack.scope.objects[propName];
        if (obj.type === ObjectType.Function) {
          moduleInstance.setAttribute(propName, obj);
        }
      }
      this._importedModules[module.name] = moduleInstance;
      retObject = moduleInstance;
    } else {
      retObject = this.getNoneObject();
    }
    this.exitFunction(retObject);
  }

  private step(): boolean {
    if (this.isFinished()) {
      return false;
    }
    this._position = undefined;
    const functionStack = this.getCurrentFunctionStack();
    const code = functionStack.code;
    if (functionStack.instruction >= code.length) {
      this.onCodeBlockFinished(functionStack);
      return true;
    }
    const current = code[functionStack.instruction];
    this._currentInstruction = functionStack.instruction;
    this.updateLocation(current);
    functionStack.instruction++;
    this.stepInternal(current);
    return !this._unhandledException;
  }

  public onRuntimeError(): void {
    const exception = new ExceptionObject(ExceptionType.RuntimeError);
    this.onUnhandledException(exception);
  }

  private stepLeaveCycle() {
    if (!this._currentStack.endInstruction) {
      // should never happen in correctly compiled code
      /* istanbul ignore next */
      this.onRuntimeError();
    } else {
      this.leaveStack();
    }
  }

  private createClassWithHierarchy(func: FunctionBody, scope: ObjectScope): ClassObject {
    const inheritsFrom: ClassInheritance[] = [];
    let isException = false;
    let exceptionType: ExceptionType;
    for (const id of func.inheritsFrom) {
      const obj = this.getObject(id, scope);
      if (!obj) {
        return;
      }
      if (obj.type !== ObjectType.Class && obj.type !== ObjectType.ExceptionClass) {
        this.raiseTypeConversion();
        return;
      }
      if (obj.type === ObjectType.ExceptionClass) {
        isException = true;
        exceptionType = (obj as ExceptionClassObject).exceptionType;
      }
      inheritsFrom.push(new ClassInheritance(id, obj));
    }
    if (isException) {
      return new ExceptionClassObject(exceptionType, inheritsFrom);
    } else {
      return new ClassObject(inheritsFrom);
    }
  }

  private stepCreateFunc(current: Instruction, module: CompiledModule, functionStack: StackEntry) {
    const funcContext: FunctionRunContext = this.createFunction(module.functions[current.arg1]);
    let funcObject: CallableObject;
    switch (funcContext.func.type) {
      case FunctionType.FunctionTypeClass:
        funcObject = this.createClassWithHierarchy(funcContext.func, this._currentStack.scope);
        if (!funcObject) {
          return;
        }
        if (!funcObject.name) {
          funcObject.name = funcContext.func.name;
        }
        const stackEntry = this.enterFunction(funcContext, current.arg2, [], null);
        stackEntry.onReturn = (): BaseObject => {
          for (const key of Object.keys(stackEntry.scope.objects)) {
            const value = stackEntry.scope.objects[key];
            funcObject.setAttribute(key, value);
          }
          return funcObject;
        };
        return;
      case FunctionType.FunctionTypeClassMember:
        funcObject = new InstanceMethodObject();
        break;
      default:
        funcObject = new FunctionObject();
        break;
    }
    funcObject.context = funcContext;
    functionStack.setReg(current.arg2, funcObject);
    if (!funcObject.name) {
      funcObject.name = funcContext.func.name;
    }
  }

  private stepLiteral(current: Instruction, functionStack: StackEntry) {
    const literal = this.createLiteral(current.arg2);
    functionStack.setReg(current.arg1, literal);
  }

  private stepCreateArrayIndexRef(current: Instruction, functionStack: StackEntry) {
    const arrayValue = functionStack.getReg(current.arg1, true, this);
    const indexValue = functionStack.getReg(current.arg2, true, this);
    const ref = new ReferenceObject(arrayValue, indexValue, ReferenceType.Index, ReferenceScope.Default, this);
    functionStack.setReg(current.arg3, ref);
  }

  private stepCreatePropertyRef(current: Instruction, functionStack: StackEntry) {
    const parentValue = functionStack.getReg(current.arg1, true, this);
    const nameValue = functionStack.getReg(current.arg2, true, this);
    const ref = new ReferenceObject(parentValue, nameValue, ReferenceType.Property, ReferenceScope.Default, this);
    functionStack.setReg(current.arg3, ref);
  }

  private stepIdentifier(current: Instruction, module: CompiledModule, functionStack: StackEntry) {
    const id = module.identifiers[current.arg2];
    const obj = new StringObject(id);
    functionStack.setReg(current.arg1, obj);
  }

  private getObject(identifier: string, scope?: ObjectScope, dontThrowException?: boolean): BaseObject {
    const identifiers = identifier.split('.');
    if (!scope) {
      scope = this._currentStack.scope;
    }
    let object = scope.getObject(identifiers[0]);
    if (!object) {
      if (!dontThrowException) {
        this.raiseUnknownIdentifier(identifiers[0]);
      }
      return;
    }
    for (let i = 1; i < identifiers.length; i++) {
      const prop = object.getAttribute(identifiers[i]);
      if (!prop) {
        if (!dontThrowException) {
          this.raiseUnknownIdentifier(identifiers.slice(0, i + 1).join('.'));
        }
        return;
      }
      object = prop;
    }
    return object;
  }

  private stepReadObject(current: Instruction, functionStack: StackEntry) {
    const identifierId = current.arg1;
    const module = this.getCurrentModule();
    const object = this.getObject(module.identifiers[identifierId]);
    if (!object) {
      return;
    }
    functionStack.setReg(current.arg2, object);
  }

  private stepReadProperty(current: Instruction, module: CompiledModule, functionStack: StackEntry) {
    const object = functionStack.getReg(current.arg2, true, this);
    if (!object) {
      return;
    }
    const id = module.identifiers[current.arg1];
    functionStack.setReg(current.arg3, object.getAttribute(id));
  }

  private stepMathOperation(current: Instruction, functionStack: StackEntry) {
    const left = functionStack.getReg(current.arg1, true, this);
    if (!left) {
      return;
    }
    const right = functionStack.getReg(current.arg2, true, this);
    if (!right) {
      return;
    }
    const ret = this.mathOperation(left, right, current);
    if (!ret) {
      return;
    }
    functionStack.setReg(current.arg3, ret);
  }

  private stepInvert(current: Instruction, functionStack: StackEntry) {
    const arg = functionStack.getReg(current.arg1, true, this);
    if (!arg) {
      return;
    }
    const ret = this.unaryOperation(arg, current.iType);
    if (!ret) {
      return;
    }
    functionStack.setReg(current.arg2, ret);
  }

  private stepRegArg(current: Instruction, functionStack: StackEntry) {
    const arg = functionStack.getReg(current.arg1, true, this);
    if (!arg) {
      return;
    }
    functionStack.callContext.setIndexedArg(current.arg2, arg);
  }

  private stepRegArgName(current: Instruction, module: CompiledModule, functionStack: StackEntry) {
    const arg = functionStack.getReg(current.arg1, true, this);
    if (!arg) {
      return;
    }
    functionStack.callContext.setNamedArg(module.identifiers[current.arg2], arg);
  }

  private stepCallFunc(current: Instruction, module: CompiledModule, functionStack: StackEntry) {
    const functionObj = functionStack.getReg(current.arg1, true, this);
    if (!functionObj) {
      return;
    }
    if (!functionObj.isCallable()) {
      this.raiseNotAFunction();
      return;
    }
    this.callFunction(functionObj as CallableObject, null, current.arg2);
  }

  private stepCallMethod(current: Instruction, module: CompiledModule, functionStack: StackEntry) {
    const functionObj = functionStack.getReg(current.arg2, true, this);
    if (!functionObj) {
      return;
    }
    if (!functionObj.isCallable()) {
      this.raiseNotAFunction();
      return;
    }
    const parentObj = functionStack.getReg(current.arg1, true, this);
    if (!parentObj) {
      return;
    }
    this.callFunction(functionObj as CallableObject, parentObj, current.arg3);
  }

  private stepRet(current: Instruction, functionStack: StackEntry) {
    let arg: BaseObject;
    if (current.arg1 !== -1) {
      arg = functionStack.getReg(current.arg1, true, this);
      if (!arg) {
        return;
      }
    } else {
      arg = this.getNoneObject();
    }
    this.exitFunction(arg);
  }

  private stepRaise(current: Instruction, functionStack: StackEntry) {
    const arg = functionStack.getReg(current.arg1, true, this);
    if (!arg) {
      return;
    }
    if (arg.type !== ObjectType.ExceptionInstance) {
      this.raiseTypeConversion();
      return;
    }
    this.raiseException(arg as ExceptionObject);
  }

  private stepForCycle(current: Instruction, module: CompiledModule, functionStack: StackEntry) {
    const stack = this.enterStack(StackEntryType.StackEntryForCycle, 'for');
    stack.nextPosition = 0;
    stack.startInstruction = this._currentInstruction;
    stack.noBreakInstruction = current.arg2 === -1 ? -1 : functionStack.findLabel(current.arg2);
    stack.endInstruction = functionStack.findLabel(current.arg1);
  }

  private stepWhileCycle(current: Instruction, functionStack: StackEntry) {
    const stack = this.enterStack(StackEntryType.StackEntryWhileCycle, 'while');
    stack.startInstruction = functionStack.instruction;
    stack.endInstruction = functionStack.findLabel(current.arg1);
  }

  private stepList(current: Instruction, functionStack: StackEntry) {
    functionStack.setReg(current.arg1, new ListObject());
  }

  private stepListAdd(current: Instruction, functionStack: StackEntry) {
    const obj = functionStack.getReg(current.arg2, true, this);
    const listObject = obj as ListObject;
    const listItem = functionStack.getReg(current.arg1, true, this);
    if (!listItem) {
      return;
    }
    listObject.addItem(listItem);
  }

  private stepGoTo(current: Instruction, functionStack: StackEntry) {
    functionStack.instruction = functionStack.findLabel(current.arg1);
  }

  private stepEnterTry(current: Instruction, functionStack: StackEntry) {
    const entry = this.enterStack(StackEntryType.StackEntryTry, 'try');
    entry.trySection = true;
    entry.endInstruction = functionStack.instruction - 1 + current.arg1;
    entry.startInstruction = functionStack.instruction;
  }

  private stepEnterExcept(current: Instruction, module: CompiledModule, functionStack: StackEntry) {
    if (current.arg1 >= 0) {
      const id = module.identifiers[current.arg1];
      functionStack.scope.objects[id] = this._currentException;
      this._currentStack.exceptionVariable = id;
    }
    this._currentStack.exceptHandled = true;
  }

  private stepEnterFinally() {
    this._currentStack.finallyHandled = true;
  }

  private stepLeaveFinally() {
    if (this._continueContext) {
      this.leaveStack();
      this.runContinueContext();
      return;
    }
  }

  private stepBreakContinue(current: Instruction) {
    let entry = this._currentStack;
    while (entry) {
      if (entry.type === StackEntryType.StackEntryFunction || entry.type === StackEntryType.StackEntryWhileCycle || entry.type === StackEntryType.StackEntryForCycle) {
        break;
      }
      entry = entry.parent;
    }
    if (!entry || (entry.type !== StackEntryType.StackEntryWhileCycle && entry.type !== StackEntryType.StackEntryForCycle)) {
      this.raiseException(new ExceptionObject(ExceptionType.BreakOrContinueOutsideOfCycle));
      return;
    }
    const context = new ContinueContext();
    context.type = ContinueContextType.ContinueCycleRelated;
    context.instruction = current.iType === InstructionType.IBreak ? entry.endInstruction : entry.startInstruction;
    context.stack = entry;
    this.setContinueContext(context);
    this.runContinueContext();
  }

  private stepCondition(current: Instruction, functionStack: StackEntry) {
    const condition = functionStack.getReg(current.arg1, true, this);
    if (!condition) {
      return;
    }
    if (!condition.toBoolean()) {
      functionStack.instruction = functionStack.findLabel(current.arg2);
    }
  }

  private stepAugmentedCopy(current: Instruction, functionStack: StackEntry) {
    const sourceObject = functionStack.getReg(current.arg1, true, this);
    if (!sourceObject) {
      return;
    }
    const targetObject = functionStack.getReg(current.arg2, false, this);
    if (!targetObject) {
      return;
    }
    if (targetObject.type !== ObjectType.Reference) {
      this.raiseException(new ExceptionObject(ExceptionType.ExpectedReference));
      return;
    }
    const targetReference = targetObject as ReferenceObject;
    const targetValue = targetReference.getValue(this);
    if (!targetValue) {
      return;
    }
    const newValue = this.mathOperation(targetValue, sourceObject, current);
    if (!newValue) {
      return;
    }
    targetReference.setValue(newValue, this);
  }

  private stepCopyValue(current: Instruction, functionStack: StackEntry) {
    const sourceObject = functionStack.getReg(current.arg1, true, this);
    if (!sourceObject) {
      return;
    }
    const targetObject = functionStack.getReg(current.arg2, false, this);
    if (!targetObject) {
      return;
    }
    if (targetObject.type === ObjectType.Tuple) {
      // special case of unpacking source sequence into tuple values which should be references
      const targetTuple = targetObject as TupleObject;
      if (targetTuple.count() === 0) {
        this.raiseException(new ExceptionObject(ExceptionType.CannotUnpackToEmptyTuple));
        return;
      }
      if (!sourceObject.isContainer()) {
        this.raiseException(new ExceptionObject(ExceptionType.UnpackSourceIsNotSequence));
        return;
      }
      if (sourceObject.count() !== targetTuple.count()) {
        this.raiseException(new ExceptionObject(ExceptionType.UnpackCountDoesntMatch));
        return;
      }
      for (let i = 0; i < sourceObject.count(); i++) {
        const targetItem = targetTuple.getItem(i);
        if (targetItem.type !== ObjectType.Reference) {
          this.raiseException(new ExceptionObject(ExceptionType.ExpectedReference));
          return;
        }
        const targetRef = targetItem as ReferenceObject;
        let sourceValue = sourceObject.getItem(i);
        if (sourceValue.type === ObjectType.Reference) {
          sourceValue = (sourceValue as ReferenceObject).getValue(this);
        }
        targetRef.setValue(sourceValue, this);
      }
    } else {
      if (targetObject.type !== ObjectType.Reference) {
        this.raiseException(new ExceptionObject(ExceptionType.ExpectedReference));
        return;
      }
      (targetObject as ReferenceObject).setValue(sourceObject, this);
    }
  }

  private stepTuple(current: Instruction, functionStack: StackEntry) {
    functionStack.setReg(current.arg1, new TupleObject([]));
  }

  private stepTupleAdd(current: Instruction, functionStack: StackEntry) {
    const obj = functionStack.getReg(current.arg2, true, this);
    const tuple = obj as TupleObject;
    const value = functionStack.getReg(current.arg1, false, this);
    if (!value) {
      return;
    }
    tuple.addItem(value);
  }

  private stepSet(current: Instruction, functionStack: StackEntry) {
    functionStack.setReg(current.arg1, new SetObject());
  }

  private stepSetAdd(current: Instruction, functionStack: StackEntry) {
    const obj = functionStack.getReg(current.arg2, true, this);
    const set = obj as SetObject;
    const value = functionStack.getReg(current.arg1, true, this);
    if (!value) {
      return;
    }
    set.addItem(value);
  }

  private stepDictionary(current: Instruction, functionStack: StackEntry) {
    functionStack.setReg(current.arg1, new DictionaryObject());
  }

  private stepDictionaryAdd(current: Instruction, module: CompiledModule, functionStack: StackEntry) {
    const id = module.identifiers[current.arg2];
    const obj = functionStack.getReg(current.arg3, true, this);
    const dictionary = obj as DictionaryObject;
    const value = functionStack.getReg(current.arg1, false, this);
    if (!value) {
      return;
    }
    dictionary.setDictionaryItem(id, value);
  }

  private stepCreateVarRef(current: Instruction, module: CompiledModule, functionStack: StackEntry) {
    const id = module.identifiers[current.arg1];
    const idObj = new StringObject(id);
    const ref = new ReferenceObject(idObj, undefined, ReferenceType.Variable, current.arg3, this);
    functionStack.setReg(current.arg2, ref);
  }

  private stepLogicalNot(current: Instruction, functionStack: StackEntry) {
    const obj = functionStack.getReg(current.arg1, true, this);
    if (!obj) {
      return;
    }
    const value = obj.toBoolean();
    const invertedValue = value ? 0 : 1;
    functionStack.setReg(current.arg2, new BooleanObject(invertedValue));
  }

  private ensureAtModuleLevel(functionStack: StackEntry) {
    if (functionStack.func.func.type !== FunctionType.FunctionTypeModule) {
      this.raiseException(new ExceptionObject(ExceptionType.ImportAllowedOnlyOnModuleLevel));
      return false;
    }
    return true;
  }

  private stepImport(current: Instruction, currentModule: CompiledModule, functionStack: StackEntry) {
    if (!this.ensureAtModuleLevel(functionStack)) {
      return;
    }
    const name = currentModule.identifiers[current.arg1];
    this.importModule(name, importedModule => {
      functionStack.scope.objects[name] = importedModule;
    });
  }

  private stepImportAs(current: Instruction, currentModule: CompiledModule, functionStack: StackEntry) {
    if (!this.ensureAtModuleLevel(functionStack)) {
      return;
    }
    const rename = currentModule.identifiers[current.arg2];
    const name = currentModule.identifiers[current.arg1];
    this.importModule(name, importedModule => {
      functionStack.scope.objects[rename] = importedModule;
    });
  }

  private stepImportFrom(current: Instruction, currentModule: CompiledModule, functionStack: StackEntry) {
    if (!this.ensureAtModuleLevel(functionStack)) {
      return;
    }
    const id = currentModule.identifiers[current.arg1];
    const module = currentModule.identifiers[current.arg2];
    this.importModule(module, importedModule => {
      functionStack.scope.objects[id] = importedModule.getAttribute(id);
    });
  }

  private importModule(name: string, onFinished: (module: ModuleObject) => void) {
    const importedModule = this._importedModules[name];
    if (importedModule) {
      onFinished(importedModule);
      return;
    }

    const compiledModule = this._compiledModules[name];
    if (!compiledModule) {
      this.raiseUnknownIdentifier(name);
      return;
    }

    const moduleFunction = this.getModuleFunction(compiledModule);

    const startModule = this.createFunction(moduleFunction);
    this.enterFunction(startModule, 0, [], null);

    this.getCurrentFunctionStack().onReturn = (ret: BaseObject) => {
      const moduleObject = ret as ModuleObject;
      onFinished(moduleObject);
      return ret;
    };
  }

  private stepGetBool(current: Instruction, functionStack: StackEntry) {
    const obj = functionStack.getReg(current.arg1, true, this);
    if (!obj) {
      return;
    }
    const boolFunc = obj.getAttribute('__bool__');
    if (boolFunc && boolFunc.isCallable()) {
      this.callFunction(boolFunc as CallableObject, obj, current.arg2);
      return;
    }
    const lenFunc = obj.getAttribute('__len__');
    if (lenFunc && lenFunc.isCallable()) {
      this.callFunction(lenFunc as CallableObject, obj, current.arg2);
      return;
    }
    functionStack.setReg(current.arg2, new BooleanObject(obj.toBoolean() ? 1 : 0));
  }

  private stepLogicalOr(current: Instruction, functionStack: StackEntry) {
    const obj = functionStack.getReg(current.arg1, true, this);
    if (!obj) {
      return;
    }
    if (obj.toBoolean()) {
      functionStack.setReg(current.arg2, new BooleanObject(1));
      functionStack.instruction += current.arg3;
    }
  }

  private stepLogicalAnd(current: Instruction, functionStack: StackEntry) {
    const obj = functionStack.getReg(current.arg1, true, this);
    if (!obj) {
      return;
    }
    if (!obj.toBoolean()) {
      functionStack.setReg(current.arg2, new BooleanObject(0));
      functionStack.instruction += current.arg3;
    }
  }

  private stepBool(current: Instruction, functionStack: StackEntry) {
    const obj = new BooleanObject(current.arg1);
    functionStack.setReg(current.arg2, obj);
  }

  private stepNone(current: Instruction, functionStack: StackEntry) {
    const obj = new NoneObject();
    functionStack.setReg(current.arg2, obj);
  }

  private stepIn(current: Instruction, functionStack: StackEntry, invert: boolean) {
    const container = functionStack.getReg(current.arg2, true, this);
    if (!container) {
      return;
    }
    const value = functionStack.getReg(current.arg1, true, this);
    if (!value) {
      return;
    }
    if (container.isContainer()) {
      if (container.contains(value)) {
        functionStack.setReg(current.arg3, new BooleanObject(invert ? 0 : 1));
      } else {
        functionStack.setReg(current.arg3, new BooleanObject(invert ? 1 : 0));
      }
      return;
    }
    const contains = container.getAttribute('__contains__');
    if (contains && contains.isCallable()) {
      const stack = this.getCurrentFunctionStack();
      const savedIndexedArgs = stack.callContext.indexedArgs;
      const savedNamedArgs = stack.callContext.namedArgs;
      stack.callContext.indexedArgs = [value];
      stack.callContext.namedArgs = {};
      this.callFunction(contains as CallableObject, container, current.arg3);
      this.getCurrentFunctionStack().onReturn = ret => {
        if (invert) {
          ret = new BooleanObject(ret.toBoolean() ? 0 : 1);
        }
        stack.callContext.indexedArgs = savedIndexedArgs;
        stack.callContext.namedArgs = savedNamedArgs;
        return ret;
      };
      return;
    }
    this.raiseTypeConversion();
  }

  private stepDel(current: Instruction, currentModule: CompiledModule, functionStack: StackEntry) {
    const obj = functionStack.getReg(current.arg1, true, this);
    if (!obj) {
      return;
    }
    const id = currentModule.identifiers[current.arg2];
    obj.deleteAttribute(id);
  }

  private stepYield(current: Instruction, currentModule: CompiledModule, functionStack: StackEntry) {
    const value = functionStack.getReg(current.arg1, true, this);
    if (!value) {
      return;
    }
    if (functionStack.generatorObject) {
      this._currentStack = functionStack.parent;
      functionStack.parent = null;
      const parentFunctionStack = this._currentStack.functionEntry;
      parentFunctionStack.setReg(functionStack.returnReg, value);
      return;
    }
    const generator = new GeneratorObject();
    functionStack.generatorObject = generator;
    generator.stackHead = functionStack;
    generator.stackTail = this._currentStack;
    generator.pendingValue = value;
    this._currentStack = functionStack.parent;
    functionStack.parent = null;
    this._currentStack.functionEntry.setReg(functionStack.returnReg, generator);
  }

  private stepReadArrayIndex(current: Instruction, functionStack: StackEntry) {
    const obj = functionStack.getReg(current.arg1, true, this);
    if (!obj) {
      return;
    }
    const index = functionStack.getReg(current.arg2, true, this);
    if (!index) {
      return;
    }
    if (obj.type === ObjectType.List) {
      if (!index.canBeInteger()) {
        this.raiseTypeConversion();
        return;
      }
      functionStack.setReg(current.arg3, (obj as ListObject).getItem(index.toInteger()));
      return;
    }
    if (obj.type === ObjectType.Dictionary) {
      if (index.type !== ObjectType.String) {
        this.raiseTypeConversion();
        return;
      }
      functionStack.setReg(current.arg3, (obj as DictionaryObject).getDictionaryItem(index.toString()));
      return;
    }
    this.raiseTypeConversion();
  }

  private stepInternal(current: Instruction) {
    const functionStack = this.getCurrentFunctionStack();
    const module = functionStack.func.func.module;
    switch (current.iType) {
      case InstructionType.ILeaveCycle:
        this.stepLeaveCycle();
        break;
      case InstructionType.IPass:
        break;
      case InstructionType.ICreateFunc:
        this.stepCreateFunc(current, module, functionStack);
        break;
      case InstructionType.ILiteral:
        this.stepLiteral(current, functionStack);
        break;
      case InstructionType.ICreateArrayIndexRef:
        this.stepCreateArrayIndexRef(current, functionStack);
        break;
      case InstructionType.ICreatePropertyRef:
        this.stepCreatePropertyRef(current, functionStack);
        break;
      case InstructionType.IIdentifier:
        this.stepIdentifier(current, module, functionStack);
        break;
      case InstructionType.IReadObject:
        this.stepReadObject(current, functionStack);
        break;
      case InstructionType.IReadProperty:
        this.stepReadProperty(current, module, functionStack);
        break;
      case InstructionType.ICopyValue:
        this.stepCopyValue(current, functionStack);
        break;
      case InstructionType.IAugmentedCopy:
        this.stepAugmentedCopy(current, functionStack);
        break;
      case InstructionType.IAdd:
      case InstructionType.ISub:
      case InstructionType.IMul:
      case InstructionType.IDiv:
      case InstructionType.IPow:
      case InstructionType.IFloor:
      case InstructionType.IMod:
      case InstructionType.IAt:
      case InstructionType.IShl:
      case InstructionType.IShr:
      case InstructionType.IBinAnd:
      case InstructionType.IBinOr:
      case InstructionType.IBinXor:
      case InstructionType.ILess:
      case InstructionType.IGreater:
      case InstructionType.ILessEq:
      case InstructionType.IGreaterEq:
      case InstructionType.IEqual:
      case InstructionType.INotEq:
      case InstructionType.IIsNot:
      case InstructionType.IIs:
        this.stepMathOperation(current, functionStack);
        break;
      case InstructionType.IInvert:
        this.stepInvert(current, functionStack);
        break;
      case InstructionType.IBinInv:
        this.stepInvert(current, functionStack);
        break;
      case InstructionType.IRegArg:
        this.stepRegArg(current, functionStack);
        break;
      case InstructionType.IRegArgName:
        this.stepRegArgName(current, module, functionStack);
        break;
      case InstructionType.ICallFunc:
        this.stepCallFunc(current, module, functionStack);
        break;
      case InstructionType.ICallMethod:
        this.stepCallMethod(current, module, functionStack);
        break;
      case InstructionType.IRet:
        this.stepRet(current, functionStack);
        break;
      case InstructionType.IRaise:
        this.stepRaise(current, functionStack);
        break;
      case InstructionType.IForCycle:
        this.stepForCycle(current, module, functionStack);
        break;
      case InstructionType.IWhileCycle:
        this.stepWhileCycle(current, functionStack);
        break;
      case InstructionType.IList:
        this.stepList(current, functionStack);
        break;
      case InstructionType.IListAdd:
        this.stepListAdd(current, functionStack);
        break;
      case InstructionType.IGoTo:
        this.stepGoTo(current, functionStack);
        break;
      case InstructionType.ILabel:
        break;
      case InstructionType.IEnterTry:
        this.stepEnterTry(current, functionStack);
        break;
      case InstructionType.ILeaveTry:
        this._currentException = null;
        this.leaveStack();
        break;
      case InstructionType.IEnterExcept:
        this.stepEnterExcept(current, module, functionStack);
        break;
      case InstructionType.IEnterFinally:
        this.stepEnterFinally();
        break;
      case InstructionType.ILeaveFinally:
        this.stepLeaveFinally();
        break;
      case InstructionType.IBreak:
      case InstructionType.IContinue:
        this.stepBreakContinue(current);
        break;
      case InstructionType.ICondition:
        this.stepCondition(current, functionStack);
        break;
      case InstructionType.ITuple:
        this.stepTuple(current, functionStack);
        break;
      case InstructionType.ITupleAdd:
        this.stepTupleAdd(current, functionStack);
        break;
      case InstructionType.ISet:
        this.stepSet(current, functionStack);
        break;
      case InstructionType.ISetAdd:
        this.stepSetAdd(current, functionStack);
        break;
      case InstructionType.IDictionary:
        this.stepDictionary(current, functionStack);
        break;
      case InstructionType.IDictionaryAdd:
        this.stepDictionaryAdd(current, module, functionStack);
        break;
      case InstructionType.ICreateVarRef:
        this.stepCreateVarRef(current, module, functionStack);
        break;
      case InstructionType.ILogicalNot:
        this.stepLogicalNot(current, functionStack);
        break;
      case InstructionType.IImport:
        this.stepImport(current, module, functionStack);
        break;
      case InstructionType.IImportAs:
        this.stepImportAs(current, module, functionStack);
        break;
      case InstructionType.IImportFrom:
        this.stepImportFrom(current, module, functionStack);
        break;
      case InstructionType.IGetBool:
        this.stepGetBool(current, functionStack);
        break;
      case InstructionType.ILogicalOr:
        this.stepLogicalOr(current, functionStack);
        break;
      case InstructionType.ILogicalAnd:
        this.stepLogicalAnd(current, functionStack);
        break;
      case InstructionType.IBool:
        this.stepBool(current, functionStack);
        break;
      case InstructionType.INone:
        this.stepNone(current, functionStack);
        break;
      case InstructionType.IIn:
      case InstructionType.INotIn:
        this.stepIn(current, functionStack, current.iType === InstructionType.INotIn);
        break;
      case InstructionType.IDel:
        this.stepDel(current, module, functionStack);
        break;
      case InstructionType.IYield:
        this.stepYield(current, module, functionStack);
        break;
      case InstructionType.IReadArrayIndex:
        this.stepReadArrayIndex(current, functionStack);
        break;
      default:
        this.onRuntimeError();
        break;
    }
  }

  private createFunction(functionDef: FunctionBody): FunctionRunContext {
    let currentScope: ObjectScope;
    if (!this._currentStack || !this._currentStack.functionEntry || functionDef.type === FunctionType.FunctionTypeModule) {
      currentScope = this._globalScope;
    } else {
      currentScope = this._currentStack.functionEntry.func.scope;
    }

    const context = new FunctionRunContext();
    context.defaultValues = [];
    context.scope = new ObjectScope(functionDef.type === FunctionType.FunctionTypeModule ? `module ${functionDef.module.name}` : `${functionDef.module.name}.${functionDef.name}`, currentScope);
    context.func = functionDef;
    this._functions[functionDef.id] = context;
    for (let i = 0; i < functionDef.arguments.length; i++) {
      const arg = functionDef.arguments[i];
      if (arg.initReg < 0) {
        continue;
      }
      context.defaultValues[i] = this.getCurrentFunctionStack().getReg(arg.initReg, true, this);
    }
    return context;
  }

  private enterStack(type: StackEntryType, name: string): StackEntry {
    this._currentStack = new StackEntry(type, this._currentStack, `${name}.${this._stackCounter++}`);
    this._currentStack.scope = this._currentStack.parent && this._currentStack.parent.scope;
    return this._currentStack;
  }

  private leaveStack(returnValue: BaseObject = undefined) {
    if (this._currentStack.exceptionVariable) {
      delete this.getCurrentFunctionStack().scope.objects[this._currentStack.exceptionVariable];
    }
    this._currentStack = this._currentStack.parent;
    if (!this._currentStack) {
      this.onFinished(returnValue);
    }
  }

  private createSuperFunction(instance: ClassInstanceObject) {
    const func = new FunctionObject();
    let superInstance: SuperProxyObject;
    func.internalFunction = () => {
      // TODO: handle arguments
      if (!superInstance) {
        superInstance = new SuperProxyObject(instance);
      }
      return superInstance;
    };
    return func;
  }

  private enterFunction(func: FunctionRunContext, returnReg: number, args: BaseObject[], parent: BaseObject): StackEntry {
    const stackEntry = this.enterStack(StackEntryType.StackEntryFunction, func.func.name);
    this._currentInstruction = 0;
    stackEntry.func = func;
    stackEntry.instruction = 0;
    stackEntry.trySection = false;
    stackEntry.code = func.func.code;
    stackEntry.returnReg = returnReg;
    if (func.func.type === FunctionType.FunctionTypeModule) {
      // we enter module function only once so no need to create scope per call
      stackEntry.scope = func.scope;
    } else {
      stackEntry.scope = new ObjectScope(`${func.scope.name}.__internal`, func.scope);
      if (
        func.func.type === FunctionType.FunctionTypeClassMember &&
        parent &&
        (parent.type === ObjectType.ClassInstance || parent.type === ObjectType.ExceptionInstance || parent.type === ObjectType.SuperProxy)
      ) {
        let superFunction: FunctionObject;
        let instance: ClassInstanceObject;
        if (parent.type === ObjectType.ClassInstance) {
          instance = parent as ClassInstanceObject;
        } else {
          instance = (parent as SuperProxyObject).classInstance;
        }
        stackEntry.scope.getObjectHook = (name: string): BaseObject => {
          if (name === 'super') {
            if (!superFunction) {
              superFunction = this.createSuperFunction(instance);
            }
            return superFunction;
          }
        };
      }
    }
    if (func.func.arguments) {
      for (let i = 0; i < func.func.arguments.length; i++) {
        const argName = func.func.module.identifiers[func.func.arguments[i].id];
        stackEntry.scope.objects[argName] = args[i];
      }
    }
    if (stackEntry.code.length > 0) {
      this.updateLocation(stackEntry.code[0]);
    }
    return stackEntry;
  }

  private updateLocation(instruction: Instruction) {
    if (instruction.row >= 0) {
      const module = this.getCurrentModule();
      this._locationId = `${module.id}_${instruction.row}`;
    }
  }

  public getNoneObject(): BaseObject {
    if (this._noneObject) {
      return this._noneObject;
    }
    this._noneObject = new NoneObject();
    return this._noneObject;
  }

  public getCurrentFunctionStack(): StackEntry {
    return this._currentStack && this._currentStack.functionEntry;
  }

  public getStackEntries(): StackEntry[] {
    const ret: StackEntry[] = [];
    let entry = this.getCurrentFunctionStack();
    while (entry) {
      ret.push(entry);
      if (!entry.parent) {
        break;
      }
      entry = entry.parent.functionEntry;
    }
    return ret;
  }

  private getCurrentModule(): CompiledModule {
    return this.getCurrentFunctionStack().func.func.module;
  }

  private createLiteral(literalId: number): BaseObject {
    const module = this.getCurrentModule();
    const literalDef = module.literals[literalId];
    switch (literalDef.type & LiteralType.LiteralMask) {
      case LiteralType.String:
        return new StringObject(literalDef.string);
      case LiteralType.FormattedString:
        return new StringObject(this.applyFormat(literalDef.string));
      case LiteralType.Bytes:
        return new BytesObject(literalDef.string);
      case LiteralType.Integer:
        return new IntegerObject(literalDef.integer);
      case LiteralType.FloatingPoint:
        return new RealObject(literalDef.integer);
    }

    // TODO: implement all other types
    this.raiseException(new ExceptionObject(ExceptionType.NotImplementedError));
  }

  private getFunctionRunContext(func: CallableObject): FunctionRunContext {
    return this._functions[func.context.func.id];
  }

  private instantiateClass(classObject: ClassObject): ClassInstanceObject {
    const inherits = calculateResolutionOrder(new ClassInheritance(classObject.name, classObject));
    if (!inherits) {
      this.raiseException(new ExceptionObject(ExceptionType.ResolutionOrder));
      return;
    }
    const coreExceptions = inherits.filter(c => c.object.type === ObjectType.ExceptionClass && c.object.inheritsFrom.length === 0);
    if (coreExceptions.length > 1) {
      this.raiseException(new ExceptionObject(ExceptionType.CannotDeriveFromMultipleException));
      return;
    }
    if (coreExceptions.length) {
      const exception = coreExceptions[0].object as ExceptionClassObject;
      return new ExceptionObject(exception.exceptionType, inherits);
    } else {
      return new ClassInstanceObject(inherits);
    }
  }

  private callFunction(func: CallableObject, parent: BaseObject, resultReg: number) {
    const currentStack = this.getCurrentFunctionStack();

    if (parent && parent.type === ObjectType.SuperProxy) {
      parent = (parent as SuperProxyObject).classInstance;
    }

    if (func.internalFunction) {
      let ret = func.internalFunction(this, currentStack.callContext, parent, resultReg);
      currentStack.callContext.indexedArgs = [];
      currentStack.callContext.namedArgs = {};
      if (ret === true) {
        return;
      }
      if (!ret) {
        ret = this.getNoneObject();
      }
      currentStack.setReg(resultReg, ret);
      return;
    }

    let indexedArgs = currentStack.callContext.indexedArgs;
    const namedArgs = currentStack.callContext.namedArgs;

    let returnParent = false;
    if (func.type === ObjectType.Class || func.type === ObjectType.ExceptionClass) {
      const initFunc = func.getAttribute('__init__');
      const classInstance = this.instantiateClass(func as ClassObject);
      if (!classInstance) {
        return;
      }
      if (!initFunc || !initFunc.isCallable()) {
        if (indexedArgs.length > 0 || Object.keys(namedArgs).length > 0) {
          this.raiseFunctionTooManyArgumentsError();
          return;
        }
        currentStack.setReg(resultReg, classInstance);
        return;
      }
      parent = classInstance;
      func = initFunc as CallableObject;
      returnParent = true;
    }

    if (func.type === ObjectType.InstanceMethod) {
      indexedArgs = [parent, ...indexedArgs];
    }

    const runContext = this.getFunctionRunContext(func);
    const args: BaseObject[] = [];
    const functionBody = runContext.func;
    if (func.type !== ObjectType.Class) {
      args.length = functionBody.arguments.length;
    }
    let i: number;
    for (i = 0; i < indexedArgs.length; i++) {
      if (i >= args.length) {
        if (func.type === ObjectType.Class) {
          // function class initializer (called before __init__) has no arguments
          break;
        }
        this.raiseFunctionTooManyArgumentsError();
        return;
      }
      const argDef = functionBody.arguments[i];
      if (argDef.type === ArgumentType.ArbitraryArguments) {
        args[i] = new TupleObject(indexedArgs.slice(i));
        i++;
        break;
      } else if (argDef.type === ArgumentType.KeywordArguments) {
        this.raiseFunctionArgumentError();
        return;
      }
      args[i] = indexedArgs[i];
    }
    while (i < args.length && functionBody.arguments[i].type === ArgumentType.ArbitraryArguments) {
      args[i++] = new TupleObject([]);
    }
    let keywordArgument: DictionaryObject;
    for (i = 0; i < functionBody.arguments.length; i++) {
      if (functionBody.arguments[i].type === ArgumentType.KeywordArguments) {
        keywordArgument = new DictionaryObject();
        args[i] = keywordArgument;
      }
    }
    for (const namedArgKey of Object.keys(namedArgs)) {
      let arg: FunctionArgument;
      for (i = 0; i < functionBody.arguments.length; i++) {
        const argName = functionBody.module.identifiers[functionBody.arguments[i].id];
        if (argName === namedArgKey) {
          arg = functionBody.arguments[i];
          break;
        }
      }
      if (!arg) {
        if (keywordArgument) {
          keywordArgument.setDictionaryItem(namedArgKey, namedArgs[namedArgKey]);
          continue;
        } else {
          this.raiseUnknownIdentifier(namedArgKey);
          return;
        }
      }
      if (args[i]) {
        this.raiseFunctionDuplicateArgumentError();
        return;
      }
      args[i] = namedArgs[namedArgKey];
    }
    for (i = 0; i < args.length; i++) {
      if (!args[i]) {
        if (runContext.defaultValues[i]) {
          args[i] = runContext.defaultValues[i];
        } else {
          this.raiseFunctionMissingArgumentError();
          return;
        }
      }
    }
    const stack = this.enterFunction(runContext, resultReg, args, parent);
    if (returnParent) {
      stack.onReturn = () => parent;
    }
  }

  private exitFunction(value: BaseObject) {
    const context = new ContinueContext();
    context.stack = this.getCurrentFunctionStack();
    context.instruction = context.stack.code.length;
    context.returnValue = value;
    if (value.type === ObjectType.None && context.stack.defaultReturnValue) {
      context.returnValue = context.stack.defaultReturnValue;
    }
    context.type = ContinueContextType.ContinueExitFunction;
    this.setContinueContext(context);
    this.runContinueContext();
  }

  private runContinueContext() {
    while (this._currentStack !== this._continueContext.stack) {
      if (this._currentStack.trySection && this.goToFinally()) {
        return;
      }
      this.leaveStack();
      if (!this._currentStack) {
        this.onRuntimeError();
        return;
      }
    }

    if (this._currentStack !== this._continueContext.stack) {
      return;
    }

    let raiseStopIteration = false;

    switch (this._continueContext.type) {
      case ContinueContextType.ContinueExitFunction: {
        const reg = this._currentStack.returnReg;
        this.onLeaveFunction(this._currentStack);
        const previousStack = this._currentStack;
        this.leaveStack(this._continueContext.returnValue);
        const currentFunctionStack = this.getCurrentFunctionStack();
        if (currentFunctionStack) {
          currentFunctionStack.callContext.namedArgs = {};
          currentFunctionStack.callContext.indexedArgs = [];
          if (previousStack.onReturn) {
            const ret = previousStack.onReturn(this._continueContext.returnValue);
            if (ret) {
              this._continueContext.returnValue = ret;
            }
            previousStack.onReturn = undefined;
          }
          if (previousStack.generatorObject) {
            previousStack.generatorObject.finished = true;
            raiseStopIteration = true;
          } else {
            currentFunctionStack.setReg(reg, this._continueContext.returnValue);
          }
        }
        break;
      }
      case ContinueContextType.ContinueCycleRelated: {
        this.getCurrentFunctionStack().instruction = this._continueContext.instruction;
        break;
      }
      case ContinueContextType.ContinueException: {
        this._currentException = this._continueContext.exception;
        this.getCurrentFunctionStack().instruction = this._continueContext.instruction;
        break;
      }
    }

    this.setContinueContext(null);

    if (raiseStopIteration) {
      this.raiseStopIteration();
    }
  }

  private goToFinally(): boolean {
    const functionStack = this.getCurrentFunctionStack();
    if (!this._currentStack.trySection || this._currentStack.finallyHandled) {
      return false;
    }
    const instruction = functionStack.code[this._currentStack.endInstruction];
    if (instruction.iType !== InstructionType.IGotoFinally) {
      return false;
    }
    this._currentStack.finallyHandled = true;
    functionStack.instruction = this._currentStack.endInstruction + 1;
    return true;
  }

  public raiseException(exception: ExceptionObject) {
    let exceptionEntry: StackEntry;
    let exceptionInstruction: number;
    for (let entry = this._currentStack; ; entry = entry.parent) {
      if (!entry) {
        this.onUnhandledException(exception);
        return;
      }
      if (exception.exceptionType === ExceptionType.StopIteration && entry.type === StackEntryType.StackEntryForCycle) {
        exceptionEntry = entry.parent;
        if (entry.noBreakInstruction !== -1) {
          exceptionInstruction = entry.noBreakInstruction;
        } else {
          exceptionInstruction = entry.endInstruction;
        }
        break;
      }
      if (!entry.trySection || entry.exceptHandled) {
        continue;
      }
      const functionStack = entry.functionEntry;
      const code = functionStack.code;
      let from = entry.endInstruction;
      if (code[from].iType === InstructionType.IGotoFinally) {
        from++;
      }
      let suitableLabel = -1;
      while (from < code.length && code[from].iType === InstructionType.IGotoExcept) {
        const id = code[from].arg1;
        if (id === -1) {
          suitableLabel = code[from].arg2;
          break;
        }
        const classObject = this.getObject(functionStack.func.func.module.identifiers[id], undefined, true);
        if (!classObject) {
          // cannot get object from the stack, better is to ignore the exception handler otherwise it is easy to get into infinite loop
          from++;
          continue;
        }
        if (classObject.type === ObjectType.ExceptionClass && exception.matchesTo(classObject as ExceptionClassObject)) {
          suitableLabel = code[from].arg2;
          break;
        }
        from++;
      }
      if (suitableLabel === -1) {
        continue;
      }
      const instruction = functionStack.findLabel(suitableLabel);
      exceptionEntry = entry;
      exceptionInstruction = instruction;
      break;
    }

    const context = new ContinueContext();
    context.type = ContinueContextType.ContinueException;
    context.exception = exception;
    context.stack = exceptionEntry;
    context.instruction = exceptionInstruction;
    this.setContinueContext(context);
    this.runContinueContext();
  }

  private applyFormat(format: string): string {
    let ret = '';
    let pos = 0;
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
      const obj = this.getCurrentFunctionStack().func.scope.getObject(id);
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

  private unaryOperation(obj: BaseObject, op: InstructionType): BaseObject {
    switch (op) {
      case InstructionType.IInvert:
        if (obj.canBeReal()) {
          let val = obj.toReal();
          val = -val;
          return this.realToObject(val);
        }
        break;
      case InstructionType.IBinInv:
        if (obj.canBeInteger()) {
          let val = obj.toInteger();
          val = ~val;
          return new IntegerObject(val);
        }
        break;
    }

    this.raiseTypeConversion();
    return null;
  }

  private mathOperation(leftObj: BaseObject, rightObj: BaseObject, instruction: Instruction): BaseObject {
    const op = instruction.iType === InstructionType.IAugmentedCopy ? instruction.arg3 : instruction.iType;
    switch (op) {
      case InstructionType.IIs:
        return new BooleanObject(leftObj === rightObj ? 1 : 0);
      case InstructionType.IIsNot:
        return new BooleanObject(leftObj === rightObj ? 0 : 1);
    }
    if (leftObj.canBeReal() && rightObj.canBeReal()) {
      const left = leftObj.toReal();
      const right = rightObj.toReal();
      switch (op) {
        case InstructionType.IAdd:
          return this.realToObject(left + right);
        case InstructionType.ISub:
          return this.realToObject(left - right);
        case InstructionType.IMul:
          return this.realToObject(left * right);
        case InstructionType.IDiv:
          return this.realToObject(left / right);
        case InstructionType.IPow:
          return this.realToObject(Math.pow(left, right));
        case InstructionType.IFloor:
          return this.realToObject(Math.floor(left / right));
        case InstructionType.IMod:
          return this.realToObject(left % right);
        case InstructionType.IShl:
          return this.realToObject(left << right);
        case InstructionType.IShr:
          return this.realToObject(left >> right);
        case InstructionType.IBinAnd:
          return this.realToObject(left & right);
        case InstructionType.IBinOr:
          return this.realToObject(left | right);
        case InstructionType.IBinXor:
          return this.realToObject(left ^ right);
        case InstructionType.ILess:
          return new BooleanObject(left < right ? 1 : 0);
        case InstructionType.IGreater:
          return new BooleanObject(left > right ? 1 : 0);
        case InstructionType.ILessEq:
          return new BooleanObject(left <= right ? 1 : 0);
        case InstructionType.IGreaterEq:
          return new BooleanObject(left >= right ? 1 : 0);
        case InstructionType.IEqual:
          // eslint-disable-next-line eqeqeq
          return new BooleanObject(left == right ? 1 : 0);
        case InstructionType.INotEq:
          // eslint-disable-next-line eqeqeq
          return new BooleanObject(left != right ? 1 : 0);
        default:
          break;
      }
    }
    if (leftObj.type === ObjectType.String && rightObj.type === ObjectType.String) {
      const left = (leftObj as StringObject).value;
      const right = (rightObj as StringObject).value;
      switch (op) {
        case InstructionType.IEqual:
          return new BooleanObject(left === right ? 1 : 0);
        case InstructionType.INotEq:
          return new BooleanObject(left !== right ? 1 : 0);
        case InstructionType.IAdd:
          return new StringObject(left + right);
      }
    }
    switch (op) {
      case InstructionType.IEqual:
      case InstructionType.INotEq: {
        let compare: CallableObject;
        let self: BaseObject;
        let other: BaseObject;
        let invert: boolean;
        let func = leftObj.getAttribute('__eq__');
        if (func && func.isCallable()) {
          compare = func as CallableObject;
          self = leftObj;
          other = rightObj;
          invert = op === InstructionType.INotEq;
        }
        if (!compare) {
          func = rightObj.getAttribute('__eq__');
          if (func && func.isCallable()) {
            compare = func as CallableObject;
            self = rightObj;
            other = leftObj;
            invert = op === InstructionType.INotEq;
          }
        }
        if (compare) {
          const currentStack = this.getCurrentFunctionStack();
          const savedIndexedArgs = currentStack.callContext.indexedArgs;
          const savedNamedArgs = currentStack.callContext.namedArgs;
          currentStack.callContext.indexedArgs = [other];
          currentStack.callContext.namedArgs = {};
          this.callFunction(compare, self, instruction.arg3);
          this.getCurrentFunctionStack().onReturn = ret => {
            currentStack.callContext.indexedArgs = savedIndexedArgs;
            currentStack.callContext.namedArgs = savedNamedArgs;
            if (invert) {
              ret = new BooleanObject(ret.toBoolean() ? 0 : 1);
            }
            return ret;
          };
        }
        break;
      }
    }
    switch (op) {
      case InstructionType.IEqual:
        return new BooleanObject(leftObj === rightObj ? 1 : 0);
      case InstructionType.INotEq:
        return new BooleanObject(leftObj !== rightObj ? 1 : 0);
    }
    this.raiseTypeConversion();
    return null;
  }

  private setContinueContext(context: ContinueContext) {
    this._continueContext = context;
  }

  public onUnhandledException(exception: ExceptionObject) {
    // console.log('Unhandled exception', exception);
    this._unhandledException = exception;
  }

  private onFinished(returnValue: BaseObject = undefined) {
    this._finished = true;
    if (this._cachedOutputLine) {
      this.writeLine('');
    }
    if (this._finishedCallback) {
      if (this._unhandledException) {
        this._finishedCallback(undefined, this._unhandledException);
      } else {
        this._finishedCallback(returnValue, undefined);
      }
      this._finishedCallback = undefined;
    }
  }

  private realToObject(value: number): BaseObject {
    return new RealObject(value);
  }

  public raiseNullException() {
    const exception = new ExceptionObject(ExceptionType.ReferenceError);
    this.raiseException(exception);
  }

  public raiseUnknownIdentifier(identifier: string) {
    const exception = new ExceptionObject(ExceptionType.UnknownIdentifier, [], identifier);
    this.raiseException(exception);
  }

  public raiseNotAFunction() {
    const exception = new ExceptionObject(ExceptionType.NotAFunction);
    this.raiseException(exception);
  }

  public raiseTypeConversion() {
    const exception = new ExceptionObject(ExceptionType.TypeError);
    this.raiseException(exception);
  }

  public raiseFunctionArgumentError() {
    const exception = new ExceptionObject(ExceptionType.FunctionArgumentError);
    this.raiseException(exception);
  }

  public raiseFunctionMissingArgumentError() {
    const exception = new ExceptionObject(ExceptionType.FunctionMissingArgument);
    this.raiseException(exception);
  }

  public raiseFunctionDuplicateArgumentError() {
    const exception = new ExceptionObject(ExceptionType.FunctionDuplicateArgumentError);
    this.raiseException(exception);
  }

  public raiseFunctionArgumentCountMismatch() {
    const exception = new ExceptionObject(ExceptionType.FunctionArgumentCountMismatch);
    this.raiseException(exception);
  }

  public raiseFunctionTooManyArgumentsError() {
    const exception = new ExceptionObject(ExceptionType.FunctionTooManyArguments);
    this.raiseException(exception);
  }

  public raiseStopIteration() {
    this.raiseException(new ExceptionObject(ExceptionType.StopIteration));
  }

  private createGlobalScope() {
    this._globalScope = new GlobalScope('global');
  }
}
