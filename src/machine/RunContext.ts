import { Instruction } from '../common/Instructions';
import { GlobalScope, ObjectScope } from './ObjectScope';
import { StackEntry, StackEntryType } from './StackEntry';
import { NumberObject } from './objects/NumberObject';
import { FunctionContext } from '../api/FunctionContext';
import { NoneObject } from './objects/NoneObject';
import { FunctionObject } from './objects/FunctionObject';
import { ListObject } from './objects/ListObject';
import { Callable } from '../api/Callable';
import { ExceptionObject } from './objects/ExceptionObject';
import { StringObject } from './objects/StringObject';
import { BytesObject } from './objects/BytesObject';
import { CompiledModule } from '../compiler/CompiledModule';
import { ArgumentType, FunctionArgument, FunctionBody, FunctionType } from '../common/FunctionBody';
import { LiteralType } from '../compiler/Literal';
import { InstructionType } from '../common/InstructionType';
import { ContinueContext, ContinueContextType } from './ContinueContext';
import { ModuleObject } from './objects/ModuleObject';
import { ReferenceObject, ReferenceType } from './objects/ReferenceObject';
import { TupleObject } from './objects/TupleObject';
import { SetObject } from './objects/SetObject';
import { DictionaryObject } from './objects/DictionaryObject';
import { BooleanObject } from './objects/BooleanObject';
import { InstanceMethodObject } from './objects/InstanceMethodObject';
import { PyClass, PyInheritance } from '../api/Class';
import { PyClassInstance } from '../api/Instance';
import { SuperProxyObject } from './objects/SuperProxyObject';
import { GeneratorObject } from './objects/GeneratorObject';
import { calculateResolutionOrder } from './CalculateResolutionOrder';
import { ExceptionClassObject } from './objects/ExceptionClassObject';
import { PyMachinePosition } from '../api/MachinePosition';
import { PyBreakpoint } from '../api/Breakpoint';
import { IterableObject } from './objects/IterableObject';
import { ContainerObject } from './objects/ContainerObject';
import { ExceptionType } from '../api/ExceptionType';
import { ReferenceScope } from '../common/ReferenceScope';
import { FrozenSetObject } from './objects/FrozenSetObject';
import { embeddedModules } from './embedded/EmbeddedModules';
import { stringFormat } from './FormatString';
import { NativeReturnType, RunContextBase } from './NativeTypes';
import { PyScope } from '../api/Scope';
import { PyException } from '../api/Exception';
import { setObjectUtils } from '../api/ObjectUtils';
import { objectUtils } from './ObjectUtilsImpl';
import { PyObject } from '../api/Object';
import { PyFunction } from '../api/Function';
import { UniqueErrorCode } from '../api/UniqueErrorCode';

setObjectUtils(objectUtils);

export class RunContext extends RunContextBase {
  private readonly _compiledModules: { [key: string]: CompiledModule };
  private _breakpoints: { [key: string]: boolean } = {};
  private _importedModules: { [id: string]: ModuleObject } = {};
  private _globalScope: GlobalScope;
  private _noneObject: PyObject;
  private _currentStack: StackEntry;
  private _stackCounter = 1;
  private _currentInstruction = -1;
  private _continueContext: ContinueContext;
  private _unhandledException: ExceptionObject;
  private _currentException: ExceptionObject;
  private _output: string[] = [];
  private _finished = true;
  private _locationId: string;
  private _position: PyMachinePosition;
  private _paused = false;
  private _pausedCallback: () => boolean;
  public onWriteLine: (line: string) => void = null;
  public onLeaveFunction: (name: string, scope: PyScope) => void;
  public onReadLine: (prompt: string, callback: (result: string) => void) => void = (prompt, callback) => callback('');
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
    this._paused = false;
    this._pausedCallback = null;
  }

  public getGlobalScope() {
    return this._globalScope;
  }

  public getUnhandledException() {
    return this._unhandledException;
  }

  // public API
  /* istanbul ignore next */
  public getCurrentScope() {
    return this.getCurrentFunctionStack().scope;
  }

  public constructor(modules: { [key: string]: CompiledModule } = {}, breakpoints: PyBreakpoint[] = []) {
    super();
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
    const func = functionStack.functionBody;
    const instruction = functionStack.functionBody.code[this._currentInstruction];
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
    while (this.step()) {
      if (this._paused) {
        this._pausedCallback = () => false;
        break;
      }
    }
  }

  private onLastStackFinished() {
    if (this._cachedOutputLine) {
      this.writeLine('');
    }
  }

  public stop() {
    this._finished = true;
    while (this._currentStack.parent) {
      this._currentStack = this._currentStack.parent;
    }
    const onFinish = this._currentStack.onFinish;
    this._currentStack = undefined;
    onFinish(undefined, null);
    this.onLastStackFinished();
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
    return Object.values(module.functions).find(f => f.type === FunctionType.Module);
  }

  public startCallModule(name: string, finishCallback: (returnValue: PyObject, error: ExceptionObject) => void = undefined) {
    if (!this._finished) {
      throw Error('Run context is not finished');
    }
    const module = this._compiledModules[name];
    if (!module) {
      this.raiseUnknownIdentifier(name);
      return;
    }
    try {
      const moduleFunction = this.getModuleFunction(module);
      /* istanbul ignore next */
      if (moduleFunction === undefined) {
        // should never happen in correctly compiled code
        this.raiseException(new ExceptionObject(ExceptionType.RuntimeError, UniqueErrorCode.CannotFindModuleFunction));
        return;
      }

      this.prepareStart();

      const moduleContext = this.createFunctionContext(moduleFunction);
      const args: PyObject[] = [];
      this.enterFunction(
        moduleContext,
        moduleFunction,
        (ret, exception) => {
          if (finishCallback) {
            finishCallback(ret, exception);
          }
          this._finished = true;
        },
        args,
        null,
      );
    } catch (e) {
      if (e instanceof ExceptionObject) {
        this.raiseException(e);
      } else {
        throw e;
      }
    }
  }

  public startCallFunction(
    moduleName: string,
    funcName: string,
    args: PyObject[] = [],
    finishCallback: (returnValue: PyObject, error: ExceptionObject) => void = undefined,
  ) {
    if (!this._finished) {
      throw Error('Run context is not finished');
    }
    const module = this._importedModules[moduleName];
    if (!module) {
      this.raiseException(new ExceptionObject(ExceptionType.UnknownIdentifier, UniqueErrorCode.ModuleNotFound, [], moduleName));
      return;
    }
    const functionObject: FunctionObject = module.getAttribute(funcName) as FunctionObject;
    if (!functionObject || !functionObject.context) {
      this.raiseException(new ExceptionObject(ExceptionType.UnknownIdentifier, UniqueErrorCode.FunctionNotFound, [], funcName));
      return;
    }

    const functionContext = functionObject.context;
    const functionBody = functionObject.body;

    try {
      this.prepareStart();
      this.enterFunction(
        functionContext,
        functionBody,
        (ret, exception) => {
          if (finishCallback) {
            finishCallback(ret, exception);
          }
          this._finished = true;
        },
        args,
        null,
      );
    } catch (e) {
      if (e instanceof ExceptionObject) {
        this.raiseException(e);
      } else {
        throw e;
      }
    }
  }

  public write(output: string) {
    this._cachedOutputLine += output;
  }

  public writeLine(output: string) {
    output = this._cachedOutputLine + output;
    this._cachedOutputLine = '';
    for (;;) {
      let line: string;
      const index = output.indexOf('\n');
      if (index < 0) {
        line = output;
        output = '';
      } else {
        line = output.substr(0, index);
        output = output.substr(index + 1);
      }
      if (this.onWriteLine) {
        this.onWriteLine(line);
      } else {
        this._output.push(line);
      }
      if (!output) {
        break;
      }
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
        if (f.type === FunctionType.Module) {
          f.id = `${id}.${m.name}`;
        } else {
          f.id = `${id}.${m.name}.${f.name}`;
        }
        id++;
        f.module = m;
      }
    }
  }

  public isPaused(): boolean {
    return this._paused;
  }

  public pause() {
    this._paused = true;
  }

  public resume() {
    if (!this._paused) {
      return;
    }
    this._paused = false;
    if (this._pausedCallback) {
      this.debugUntilCondition(this._pausedCallback);
    }
  }

  private debugUntilCondition(callback?: () => boolean) {
    if (this._paused) {
      return;
    }
    while (!this.isFinished()) {
      const current = this._locationId;
      while (!this.isFinished() && this._locationId === current && !this._paused) {
        this.step();
      }
      if (this._paused) {
        this._pausedCallback = callback;
        break;
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
    let retObject: PyObject;
    const { module, type } = functionStack.functionBody;
    if (type === FunctionType.Module) {
      const moduleInstance = new ModuleObject();
      moduleInstance.name = module.name;
      for (const propName of Object.keys(functionStack.scope.objects)) {
        const obj = functionStack.scope.objects[propName];
        moduleInstance.setAttribute(propName, obj);
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
    const code = functionStack.functionBody.code;
    try {
      if (functionStack.instruction >= code.length) {
        this.onCodeBlockFinished(functionStack);
        return true;
      }
      const current = code[functionStack.instruction];
      this._currentInstruction = functionStack.instruction;
      this.updateLocation(current);
      functionStack.instruction++;
      this.stepInternal(current);
    } catch (err) {
      if (err instanceof ExceptionObject) {
        this.raiseException(err);
      } else {
        // safety check
        /* istanbul ignore next */
        this.raiseException(new ExceptionObject(ExceptionType.SystemError, UniqueErrorCode.UnexpectedJsException));
      }
    }
    return !this._unhandledException;
  }

  private stepLeaveCycle() {
    if (!this._currentStack.endInstruction) {
      // should never happen in correctly compiled code
      /* istanbul ignore next */
      throw new ExceptionObject(ExceptionType.RuntimeError, UniqueErrorCode.CannotFindEndOfCycle);
    }

    this.leaveStack(null, true);
  }

  private createClassWithHierarchy(context: FunctionContext, body: FunctionBody, scope: PyScope): PyClass {
    const inheritsFrom: PyInheritance[] = [];
    let isException = false;
    let exceptionType: ExceptionType;
    for (const id of body.inheritsFrom) {
      const obj = this.getObject(id, scope);
      if (!obj) {
        return;
      }
      if (!(obj instanceof PyClass)) {
        throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedClass);
      }
      if (obj instanceof ExceptionClassObject) {
        isException = true;
        exceptionType = obj.exceptionType;
      }
      inheritsFrom.push(new PyInheritance(id, obj));
    }
    if (isException) {
      return new ExceptionClassObject(body, context, exceptionType, inheritsFrom);
    } else {
      return new PyClass(body, context, inheritsFrom);
    }
  }

  private stepCreateFunc(current: Instruction, module: CompiledModule, functionStack: StackEntry) {
    const functionBody = module.functions[current.arg1];
    const functionContext = this.createFunctionContext(functionBody);
    let funcObject: Callable;
    switch (functionBody.type) {
      case FunctionType.Class:
        funcObject = this.createClassWithHierarchy(functionContext, functionBody, this._currentStack.scope);
        if (!funcObject) {
          return;
        }
        if (!funcObject.name) {
          funcObject.name = functionBody.name;
        }
        const stackEntry = this.enterFunction(
          functionContext,
          functionBody,
          () => {
            for (const key of Object.keys(stackEntry.scope.objects)) {
              const value = stackEntry.scope.objects[key];
              funcObject.setAttribute(key, value);
            }
            functionStack.setReg(current.arg2, funcObject);
          },
          [],
          null,
        );
        return;
      case FunctionType.ClassMember:
        funcObject = new InstanceMethodObject(functionBody, functionContext);
        break;
      default:
        funcObject = new FunctionObject(functionBody, functionContext);
        break;
    }
    functionStack.setReg(current.arg2, funcObject);
    if (!funcObject.name) {
      funcObject.name = functionBody.name;
    }
  }

  private stepLiteral(current: Instruction, functionStack: StackEntry) {
    const literal = this.createLiteral(current.arg2, functionStack, current.arg1);
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

  private stepCreateArrayRangeReference(current: Instruction, functionStack: StackEntry) {
    const arrayValue = functionStack.getReg(current.arg1, true, this);
    const indexFrom = functionStack.getReg(current.arg2, true, this);
    const indexTo = functionStack.getReg(current.arg3, true, this);
    const indexInterval: PyObject = current.arg5 === -1 ? null : functionStack.getReg(current.arg5, true, this);
    const ref = new ReferenceObject(arrayValue, indexFrom, ReferenceType.Range, ReferenceScope.Default, this, indexTo, indexInterval);
    functionStack.setReg(current.arg6, ref);
  }

  private stepIdentifier(current: Instruction, module: CompiledModule, functionStack: StackEntry) {
    const id = module.identifiers[current.arg2];
    const obj = new StringObject(id);
    functionStack.setReg(current.arg1, obj);
  }

  private getObject(identifier: string, scope?: PyScope, dontThrowException?: boolean): PyObject {
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
    const id = module.identifiers[current.arg1];
    const prop = object.getAttribute(id);
    if (!prop) {
      this.raiseUnknownIdentifier(id);
      return;
    }
    functionStack.setReg(current.arg3, prop);
  }

  private stepMathOperation(current: Instruction, functionStack: StackEntry) {
    const left = functionStack.getReg(current.arg1, true, this);
    const right = functionStack.getReg(current.arg2, true, this);
    const ret = this.mathOperation(left, right, current);
    functionStack.setReg(current.arg3, ret);
  }

  private stepInvert(current: Instruction, functionStack: StackEntry) {
    const arg = functionStack.getReg(current.arg1, true, this);
    const ret = this.unaryOperation(arg, current.type);
    functionStack.setReg(current.arg2, ret);
  }

  private stepRegArg(current: Instruction, functionStack: StackEntry) {
    const arg = functionStack.getReg(current.arg1, true, this);
    functionStack.setIndexedArg(current.arg2, arg, current.arg3 !== 0);
  }

  private stepRegArgName(current: Instruction, module: CompiledModule, functionStack: StackEntry) {
    const arg = functionStack.getReg(current.arg1, true, this);
    functionStack.setNamedArg(module.identifiers[current.arg2], arg);
  }

  private stepCallFunc(current: Instruction, module: CompiledModule, functionStack: StackEntry) {
    const functionObj = functionStack.getReg(current.arg1, true, this);
    // safety check
    /* istanbul ignore next */
    if (!functionObj) {
      return;
    }
    if (!(functionObj instanceof Callable)) {
      throw new ExceptionObject(ExceptionType.NotAFunction, UniqueErrorCode.ExpectedCallableObject, [], functionObj.toString());
    }
    this.callFunction(functionObj, null, (ret, exception) => {
      if (!exception) {
        functionStack.setReg(current.arg2, ret);
      }
    });
  }

  private stepCallMethod(current: Instruction, module: CompiledModule, functionStack: StackEntry) {
    const functionObj = functionStack.getReg(current.arg2, true, this);
    if (!(functionObj instanceof Callable)) {
      throw new ExceptionObject(ExceptionType.NotAFunction, UniqueErrorCode.ExpectedCallableObject, [], functionObj.toString());
    }
    const parentObj = functionStack.getReg(current.arg1, true, this);
    // safety check
    /* istanbul ignore next */
    if (!parentObj) {
      return;
    }
    this.callFunction(functionObj, parentObj, (ret, exception) => {
      if (!exception) {
        functionStack.setReg(current.arg3, ret);
      }
    });
  }

  private stepRet(current: Instruction, functionStack: StackEntry) {
    let arg: PyObject;
    if (current.arg1 !== -1) {
      arg = functionStack.getReg(current.arg1, true, this);
    } else {
      arg = this.getNoneObject();
    }
    this.exitFunction(arg);
  }

  private stepRaise(current: Instruction, functionStack: StackEntry) {
    if (current.arg1 === -1) {
      if (!this._currentException) {
        throw new ExceptionObject(ExceptionType.CannotReRaise, UniqueErrorCode.NoCurrentException);
      } else {
        this.raiseException(this._currentException);
      }
      return;
    }
    const arg = functionStack.getReg(current.arg1, true, this);
    if (!(arg instanceof ExceptionObject)) {
      throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedException, [], arg.toString());
    }
    this.raiseException(arg);
  }

  private stepForCycle(current: Instruction, module: CompiledModule, functionStack: StackEntry) {
    const stack = this.enterStack(StackEntryType.ForCycle, 'for');
    stack.nextPosition = 0;
    stack.startInstruction = this._currentInstruction;
    stack.noBreakInstruction = current.arg2 === -1 ? -1 : functionStack.findLabel(current.arg2);
    stack.endInstruction = functionStack.findLabel(current.arg1);
    // safety check
    /* istanbul ignore next */
    if (stack.endInstruction === -1) {
      throw new ExceptionObject(ExceptionType.SystemError, UniqueErrorCode.CannotFindEndOfCycle);
    }
  }

  private stepWhileCycle(current: Instruction, functionStack: StackEntry) {
    const stack = this.enterStack(StackEntryType.WhileCycle, 'while');
    stack.startInstruction = functionStack.instruction;
    stack.endInstruction = functionStack.findLabel(current.arg1);
  }

  private stepList(current: Instruction, functionStack: StackEntry) {
    functionStack.setReg(current.arg1, new ListObject());
  }

  private stepListAdd(current: Instruction, functionStack: StackEntry) {
    const obj = functionStack.getReg(current.arg2, true, this);
    const listObject = obj as ListObject;
    let listItem = functionStack.getReg(current.arg1, true, this);
    if (listItem instanceof TupleObject && listItem.items.findIndex(t => t instanceof ReferenceObject) >= 0) {
      listItem = new TupleObject(listItem.items.map(r => (r instanceof ReferenceObject ? r.getValue(this) : r)));
    }
    listObject.addItem(listItem);
  }

  private stepGoTo(current: Instruction, functionStack: StackEntry) {
    const next = functionStack.findLabel(current.arg1);
    // safety check
    /* istanbul ignore next */
    if (next === -1) {
      throw new ExceptionObject(ExceptionType.SystemError, UniqueErrorCode.CannotFindLabel, [], current.arg1.toString());
    }
    functionStack.instruction = next;
  }

  private stepEnterTry(current: Instruction, functionStack: StackEntry) {
    const entry = this.enterStack(StackEntryType.Try, 'try');
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
      this.leaveStack(null, false);
      this.runContinueContext();
      return;
    }
  }

  private stepBreakContinue(current: Instruction) {
    let entry = this._currentStack;
    while (entry) {
      if (entry.type === StackEntryType.Function || entry.type === StackEntryType.WhileCycle || entry.type === StackEntryType.ForCycle) {
        break;
      }
      entry = entry.parent;
    }
    if (!entry || (entry.type !== StackEntryType.WhileCycle && entry.type !== StackEntryType.ForCycle)) {
      throw new ExceptionObject(ExceptionType.BreakOrContinueOutsideOfCycle, UniqueErrorCode.BreakAndContinueShouldBeInsideCycle);
    }
    const context = new ContinueContext();
    context.type = ContinueContextType.Cycle;
    context.instruction = current.type === InstructionType.Break ? entry.endInstruction : entry.startInstruction;
    context.stack = entry;
    this.setContinueContext(context);
    this.runContinueContext();
  }

  private stepCondition(current: Instruction, functionStack: StackEntry) {
    const condition = functionStack.getReg(current.arg1, true, this);
    // safety check
    /* istanbul ignore next */
    if (!condition) {
      return;
    }
    if (!condition.toBoolean()) {
      const next = functionStack.findLabel(current.arg2);
      // safety check
      /* istanbul ignore next */
      if (next === -1) {
        throw new ExceptionObject(ExceptionType.SystemError, UniqueErrorCode.CannotFindLabel, [], current.arg2.toString());
      }
      functionStack.instruction = next;
    }
  }

  private stepAugmentedCopy(current: Instruction, functionStack: StackEntry) {
    const sourceObject = functionStack.getReg(current.arg1, true, this);
    const targetObject = functionStack.getReg(current.arg2, false, this);
    if (!(targetObject instanceof ReferenceObject)) {
      throw new ExceptionObject(ExceptionType.ExpectedReference, UniqueErrorCode.ExpectedReferenceObject);
    }
    const targetValue = targetObject.getValue(this);
    const newValue = this.mathOperation(targetValue, sourceObject, current);
    targetObject.setValue(newValue, this);
  }

  private stepCopyValue(current: Instruction, functionStack: StackEntry) {
    const sourceObject = functionStack.getReg(current.arg1, true, this);
    const targetObject = functionStack.getReg(current.arg2, false, this);
    if (targetObject instanceof TupleObject) {
      // special case of unpacking source sequence into tuple values which should be references
      if (targetObject.getCount() === 0) {
        throw new ExceptionObject(ExceptionType.CannotUnpackToEmptyTuple, UniqueErrorCode.CannotUnpackToEmptyTuple);
      }
      if (!(sourceObject instanceof IterableObject)) {
        throw new ExceptionObject(ExceptionType.UnpackSourceIsNotSequence, UniqueErrorCode.ExpectedIterableObject, [], sourceObject.toString());
      }
      if (sourceObject.getCount() !== targetObject.getCount()) {
        throw new ExceptionObject(
          ExceptionType.UnpackCountDoesntMatch,
          UniqueErrorCode.UnpackCountDoesntMatch,
          [],
          sourceObject.getCount().toString(),
          targetObject.getCount().toString(),
        );
        return;
      }
      for (let i = 0; i < sourceObject.getCount(); i++) {
        const targetItem = targetObject.getItem(i);
        if (!(targetItem instanceof ReferenceObject)) {
          throw new ExceptionObject(ExceptionType.ExpectedReference, UniqueErrorCode.ExpectedReferenceObject, [], targetItem.toString());
        }
        const targetRef = targetItem as ReferenceObject;
        let sourceValue = sourceObject.getItem(i);
        if (sourceValue instanceof ReferenceObject) {
          sourceValue = sourceValue.getValue(this);
        }
        targetRef.setValue(sourceValue, this);
      }
    } else {
      /* istanbul ignore next */ // safety check
      if (!(targetObject instanceof ReferenceObject)) {
        throw new ExceptionObject(ExceptionType.ExpectedReference, UniqueErrorCode.ExpectedReferenceObject, [], targetObject.toString());
      }
      targetObject.setValue(sourceObject, this);
    }
  }

  private stepTuple(current: Instruction, functionStack: StackEntry) {
    functionStack.setReg(current.arg1, new TupleObject([]));
  }

  private stepTupleAdd(current: Instruction, functionStack: StackEntry) {
    const obj = functionStack.getReg(current.arg2, true, this);
    const tuple = obj as TupleObject;
    const value = functionStack.getReg(current.arg1, false, this);
    tuple.addItem(value);
  }

  private stepSet(current: Instruction, functionStack: StackEntry) {
    functionStack.setReg(current.arg1, new SetObject());
  }

  private stepSetAdd(current: Instruction, functionStack: StackEntry) {
    const obj = functionStack.getReg(current.arg2, true, this);
    const set = obj as SetObject;
    const value = functionStack.getReg(current.arg1, true, this);
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
    dictionary.setItem(id, value);
  }

  private stepCreateVarRef(current: Instruction, module: CompiledModule, functionStack: StackEntry) {
    const id = module.identifiers[current.arg1];
    const idObj = new StringObject(id);
    const ref = new ReferenceObject(idObj, undefined, ReferenceType.Variable, current.arg3, this);
    functionStack.setReg(current.arg2, ref);
  }

  private stepLogicalNot(current: Instruction, functionStack: StackEntry) {
    const obj = functionStack.getReg(current.arg1, true, this);
    const value = obj.toBoolean();
    const invertedValue = value ? 0 : 1;
    functionStack.setReg(current.arg2, BooleanObject.toBoolean(invertedValue));
  }

  private ensureAtModuleLevel(functionStack: StackEntry) {
    if (functionStack.functionBody.type !== FunctionType.Module) {
      throw new ExceptionObject(ExceptionType.ImportAllowedOnlyOnModuleLevel, UniqueErrorCode.ImportAllowedOnlyOnModuleLevel);
    }
    return true;
  }

  private stepImport(current: Instruction, currentModule: CompiledModule, functionStack: StackEntry) {
    this.ensureAtModuleLevel(functionStack);
    const name = currentModule.identifiers[current.arg1];
    this.importModule(name, importedModule => {
      functionStack.scope.objects[name] = importedModule;
    });
  }

  private stepImportAs(current: Instruction, currentModule: CompiledModule, functionStack: StackEntry) {
    this.ensureAtModuleLevel(functionStack);
    const rename = currentModule.identifiers[current.arg2];
    const name = currentModule.identifiers[current.arg1];
    this.importModule(name, importedModule => {
      functionStack.scope.objects[rename] = importedModule;
    });
  }

  private stepImportFrom(current: Instruction, currentModule: CompiledModule, functionStack: StackEntry) {
    this.ensureAtModuleLevel(functionStack);
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

    if (embeddedModules[name]) {
      const moduleObject = embeddedModules[name]();
      this._importedModules[name] = moduleObject;
      onFinished(moduleObject);
      return;
    }

    const compiledModule = this._compiledModules[name];
    if (!compiledModule) {
      this.raiseUnknownIdentifier(name);
      return;
    }

    const moduleFunction = this.getModuleFunction(compiledModule);

    const moduleContext = this.createFunctionContext(moduleFunction);
    this.enterFunction(
      moduleContext,
      moduleFunction,
      ret => {
        const moduleObject = ret as ModuleObject;
        onFinished(moduleObject);
        const functionStack = this.getCurrentFunctionStack();
        functionStack.setReg(0, moduleObject);
      },
      [],
      null,
    );
  }

  private stepGetBool(current: Instruction, functionStack: StackEntry) {
    const obj = functionStack.getReg(current.arg1, true, this);
    const boolFunc = obj.getAttribute('__bool__');
    if (boolFunc && boolFunc instanceof Callable) {
      this.callFunction(boolFunc as Callable, obj, (ret, exception) => {
        if (!exception) {
          functionStack.setReg(current.arg2, ret);
        }
      });
      return;
    }
    const lenFunc = obj.getAttribute('__len__');
    if (lenFunc && lenFunc instanceof Callable) {
      this.callFunction(lenFunc as Callable, obj, (ret, exception) => {
        if (!exception) {
          functionStack.setReg(current.arg2, ret);
        }
      });
      return;
    }
    functionStack.setReg(current.arg2, BooleanObject.toBoolean(obj.toBoolean() ? 1 : 0));
  }

  private stepLogicalOr(current: Instruction, functionStack: StackEntry) {
    const obj = functionStack.getReg(current.arg1, true, this);
    if (obj.toBoolean()) {
      functionStack.setReg(current.arg2, BooleanObject.toBoolean(1));
      functionStack.instruction += current.arg3;
    }
  }

  private stepLogicalAnd(current: Instruction, functionStack: StackEntry) {
    const obj = functionStack.getReg(current.arg1, true, this);
    if (!obj.toBoolean()) {
      functionStack.setReg(current.arg2, BooleanObject.toBoolean(0));
      functionStack.instruction += current.arg3;
    }
  }

  private stepBool(current: Instruction, functionStack: StackEntry) {
    const obj = BooleanObject.toBoolean(current.arg1);
    functionStack.setReg(current.arg2, obj);
  }

  private stepNone(current: Instruction, functionStack: StackEntry) {
    const obj = new NoneObject();
    functionStack.setReg(current.arg1, obj);
  }

  private stepIn(current: Instruction, functionStack: StackEntry, invert: boolean) {
    const container = functionStack.getReg(current.arg2, true, this);
    const value = functionStack.getReg(current.arg1, true, this);
    if (container instanceof ContainerObject) {
      if (container.contains(value)) {
        functionStack.setReg(current.arg3, BooleanObject.toBoolean(!invert));
      } else {
        functionStack.setReg(current.arg3, BooleanObject.toBoolean(invert));
      }
      return;
    }
    const contains = container.getAttribute('__contains__');
    if (contains && contains instanceof Callable) {
      const stack = this.getCurrentFunctionStack();
      const savedIndexedArgs = stack.callContext.indexedArgs;
      const savedNamedArgs = stack.callContext.namedArgs;
      stack.callContext.indexedArgs = [{ object: value, expand: false }];
      stack.callContext.namedArgs = {};
      this.callFunction(contains, container, (ret, exception) => {
        if (exception) {
          return;
        }
        if (invert) {
          ret = BooleanObject.toBoolean(ret.toBoolean());
        }
        stack.callContext.indexedArgs = savedIndexedArgs;
        stack.callContext.namedArgs = savedNamedArgs;
        functionStack.setReg(current.arg3, ret);
      });
      return;
    }
    throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedContainer);
  }

  private stepDel(current: Instruction, functionStack: StackEntry) {
    const reference = functionStack.getReg(current.arg1, false, this);
    if (!(reference instanceof ReferenceObject)) {
      throw new ExceptionObject(ExceptionType.ReferenceError, UniqueErrorCode.ExpectedReferenceObject, [], reference.toString());
    }
    reference.deleteValue(this);
  }

  private stepYield(current: Instruction, functionStack: StackEntry) {
    const value = functionStack.getReg(current.arg1, true, this);
    if (functionStack.generatorObject) {
      this._currentStack = functionStack.parent;
      functionStack.parent = null;
      functionStack.onFinish(value, null);
      return;
    }
    const generator = new GeneratorObject(functionStack, this._currentStack);
    functionStack.generatorObject = generator;
    generator.pendingValue = value;
    this._currentStack = functionStack.parent;
    functionStack.parent = null;
    functionStack.onFinish(generator, null);
  }

  private stepReadArrayIndex(current: Instruction, functionStack: StackEntry) {
    const obj = functionStack.getReg(current.arg1, true, this);
    const index = functionStack.getReg(current.arg2, true, this);
    if (obj instanceof ListObject) {
      if (!(index instanceof NumberObject)) {
        throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedNumberObject, [], index.toString());
      }
      functionStack.setReg(current.arg3, obj.getItem(index.value));
      return;
    }
    if (obj instanceof DictionaryObject) {
      if (!(index instanceof StringObject)) {
        throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedStringObject, [], obj.toString());
      }
      functionStack.setReg(current.arg3, obj.getItem(index.value));
      return;
    }
    throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedDictionaryOrListObject);
  }

  private stepReadArrayRange(current: Instruction, functionStack: StackEntry) {
    const list = functionStack.getReg(current.arg1, true, this);
    const indexFromObject = functionStack.getReg(current.arg2, true, this);
    const indexToObject = functionStack.getReg(current.arg3, true, this);
    const indexIntervalObject: PyObject = current.arg5 === -1 ? null : functionStack.getReg(current.arg5, true, this);

    if (!(list instanceof ContainerObject)) {
      throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedContainer, [], list.toString());
    } else if (!(indexFromObject instanceof NumberObject)) {
      throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedNumberObject, [], indexFromObject.toString());
    } else if (!(indexToObject instanceof NumberObject)) {
      throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedNumberObject, [], indexToObject.toString());
    } else if (indexIntervalObject && !(indexIntervalObject instanceof NumberObject)) {
      throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedNumberObject, [], indexIntervalObject.toString());
    }

    const from = indexFromObject.value;
    const to = indexToObject.value;
    const step = indexIntervalObject ? (indexIntervalObject as NumberObject).value : 1;

    if (step === 0) {
      throw new ExceptionObject(ExceptionType.FunctionArgumentError, UniqueErrorCode.StepCannotBeZero);
    }

    if (list instanceof TupleObject) {
      const newTuple = new TupleObject([]);

      if (step > 0) {
        for (let i = from; i < to; i += step) {
          newTuple.addItem(list.getItem(i));
        }
      } else {
        for (let i = from; i > to; i += step) {
          newTuple.addItem(list.getItem(i));
        }
      }

      functionStack.setReg(current.arg6, newTuple);
    } else {
      const newList = new ListObject();

      if (step > 0) {
        for (let i = from; i < to; i += step) {
          newList.addItem(list.getItem(i));
        }
      } else {
        for (let i = from; i > to; i += step) {
          newList.addItem(list.getItem(i));
        }
      }

      functionStack.setReg(current.arg6, newList);
    }
  }

  private stepInternal(current: Instruction) {
    const functionStack = this.getCurrentFunctionStack();
    const module = functionStack.functionBody.module;
    switch (current.type) {
      case InstructionType.LeaveCycle:
        this.stepLeaveCycle();
        break;
      case InstructionType.Pass:
        break;
      case InstructionType.CreateFunc:
        this.stepCreateFunc(current, module, functionStack);
        break;
      case InstructionType.Literal:
        this.stepLiteral(current, functionStack);
        break;
      case InstructionType.CreateArrayIndexRef:
        this.stepCreateArrayIndexRef(current, functionStack);
        break;
      case InstructionType.CreatePropertyRef:
        this.stepCreatePropertyRef(current, functionStack);
        break;
      case InstructionType.Identifier:
        this.stepIdentifier(current, module, functionStack);
        break;
      case InstructionType.ReadObject:
        this.stepReadObject(current, functionStack);
        break;
      case InstructionType.ReadProperty:
        this.stepReadProperty(current, module, functionStack);
        break;
      case InstructionType.CopyValue:
        this.stepCopyValue(current, functionStack);
        break;
      case InstructionType.AugmentedCopy:
        this.stepAugmentedCopy(current, functionStack);
        break;
      case InstructionType.Add:
      case InstructionType.Sub:
      case InstructionType.Mul:
      case InstructionType.Div:
      case InstructionType.Pow:
      case InstructionType.Floor:
      case InstructionType.Mod:
      case InstructionType.At:
      case InstructionType.Shl:
      case InstructionType.Shr:
      case InstructionType.BinAnd:
      case InstructionType.BinOr:
      case InstructionType.BinXor:
      case InstructionType.Less:
      case InstructionType.Greater:
      case InstructionType.LessEq:
      case InstructionType.GreaterEq:
      case InstructionType.Equal:
      case InstructionType.NotEq:
      case InstructionType.IsNot:
      case InstructionType.Is:
        this.stepMathOperation(current, functionStack);
        break;
      case InstructionType.Invert:
        this.stepInvert(current, functionStack);
        break;
      case InstructionType.BinInv:
        this.stepInvert(current, functionStack);
        break;
      case InstructionType.RegArg:
        this.stepRegArg(current, functionStack);
        break;
      case InstructionType.RegArgName:
        this.stepRegArgName(current, module, functionStack);
        break;
      case InstructionType.CallFunc:
        this.stepCallFunc(current, module, functionStack);
        break;
      case InstructionType.CallMethod:
        this.stepCallMethod(current, module, functionStack);
        break;
      case InstructionType.Ret:
        this.stepRet(current, functionStack);
        break;
      case InstructionType.Raise:
        this.stepRaise(current, functionStack);
        break;
      case InstructionType.ForCycle:
        this.stepForCycle(current, module, functionStack);
        break;
      case InstructionType.WhileCycle:
        this.stepWhileCycle(current, functionStack);
        break;
      case InstructionType.List:
        this.stepList(current, functionStack);
        break;
      case InstructionType.ListAdd:
        this.stepListAdd(current, functionStack);
        break;
      case InstructionType.GoTo:
        this.stepGoTo(current, functionStack);
        break;
      case InstructionType.Label:
        break;
      case InstructionType.EnterTry:
        this.stepEnterTry(current, functionStack);
        break;
      case InstructionType.LeaveTry:
        this._currentException = null;
        this.leaveStack(null, false);
        break;
      case InstructionType.EnterExcept:
        this.stepEnterExcept(current, module, functionStack);
        break;
      case InstructionType.EnterFinally:
        this.stepEnterFinally();
        break;
      case InstructionType.LeaveFinally:
        this.stepLeaveFinally();
        break;
      case InstructionType.Break:
      case InstructionType.Continue:
        this.stepBreakContinue(current);
        break;
      case InstructionType.Condition:
        this.stepCondition(current, functionStack);
        break;
      case InstructionType.Tuple:
        this.stepTuple(current, functionStack);
        break;
      case InstructionType.TupleAdd:
        this.stepTupleAdd(current, functionStack);
        break;
      case InstructionType.Set:
        this.stepSet(current, functionStack);
        break;
      case InstructionType.SetAdd:
        this.stepSetAdd(current, functionStack);
        break;
      case InstructionType.Dictionary:
        this.stepDictionary(current, functionStack);
        break;
      case InstructionType.DictionaryAdd:
        this.stepDictionaryAdd(current, module, functionStack);
        break;
      case InstructionType.CreateVarRef:
        this.stepCreateVarRef(current, module, functionStack);
        break;
      case InstructionType.LogicalNot:
        this.stepLogicalNot(current, functionStack);
        break;
      case InstructionType.Import:
        this.stepImport(current, module, functionStack);
        break;
      case InstructionType.ImportAs:
        this.stepImportAs(current, module, functionStack);
        break;
      case InstructionType.ImportFrom:
        this.stepImportFrom(current, module, functionStack);
        break;
      case InstructionType.GetBool:
        this.stepGetBool(current, functionStack);
        break;
      case InstructionType.LogicalOr:
        this.stepLogicalOr(current, functionStack);
        break;
      case InstructionType.LogicalAnd:
        this.stepLogicalAnd(current, functionStack);
        break;
      case InstructionType.Bool:
        this.stepBool(current, functionStack);
        break;
      case InstructionType.None:
        this.stepNone(current, functionStack);
        break;
      case InstructionType.In:
      case InstructionType.NotIn:
        this.stepIn(current, functionStack, current.type === InstructionType.NotIn);
        break;
      case InstructionType.Del:
        this.stepDel(current, functionStack);
        break;
      case InstructionType.Yield:
        this.stepYield(current, functionStack);
        break;
      case InstructionType.ReadArrayIndex:
        this.stepReadArrayIndex(current, functionStack);
        break;
      case InstructionType.CreateArrayRangeRef:
        this.stepCreateArrayRangeReference(current, functionStack);
        break;
      case InstructionType.ReadArrayRange:
        this.stepReadArrayRange(current, functionStack);
        break;
      default:
        // safety check
        /* istanbul ignore next */
        throw new ExceptionObject(ExceptionType.SystemError, UniqueErrorCode.UnknownInstruction, [], current.type);
    }
  }

  private createFunctionContext(functionDef: FunctionBody): FunctionContext {
    let currentScope: PyScope;
    if (!this._currentStack || !this._currentStack.functionEntry || functionDef.type === FunctionType.Module) {
      currentScope = this._globalScope;
    } else {
      currentScope = this._currentStack.functionEntry.functionContext.scope;
    }

    const context = new FunctionContext();
    context.defaultValues = [];
    context.scope = new ObjectScope(
      functionDef.type === FunctionType.Module ? `module ${functionDef.module.name}` : `${functionDef.module.name}.${functionDef.name}`,
      currentScope,
    );
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

  private leaveStack(returnValue: PyObject, useCallback: boolean, exception: ExceptionObject = null) {
    const onFinish = this._currentStack.onFinish;
    if (this._currentStack.exceptionVariable) {
      delete this.getCurrentFunctionStack().scope.objects[this._currentStack.exceptionVariable];
    }
    this._currentStack = this._currentStack.parent;
    if (onFinish && useCallback) {
      onFinish(returnValue, exception);
    }
    if (!this._currentStack) {
      this.onLastStackFinished();
    }
  }

  private createSuperFunction(instance: PyClassInstance) {
    let superInstance: SuperProxyObject;
    return new FunctionObject(null, null, () => {
      // TODO: handle arguments
      if (!superInstance) {
        superInstance = new SuperProxyObject(instance);
      }
      return superInstance;
    });
  }

  private enterFunction(
    functionContext: FunctionContext,
    functionBody: PyFunction,
    onFinish: (ret: PyObject, exception: ExceptionObject) => boolean | void | undefined,
    args: PyObject[],
    parent: PyObject,
  ): StackEntry {
    const stackEntry = this.enterStack(StackEntryType.Function, functionBody.name);
    this._currentInstruction = 0;
    stackEntry.functionContext = functionContext;
    stackEntry.functionBody = functionBody as FunctionBody;
    stackEntry.instruction = 0;
    stackEntry.trySection = false;
    stackEntry.onFinish = onFinish;
    if (stackEntry.functionBody.type === FunctionType.Module) {
      // we enter module function only once so no need to create scope per call
      stackEntry.scope = functionContext.scope;
    } else {
      const scope = new ObjectScope(`${functionContext.scope.name}.__internal`, functionContext.scope);
      stackEntry.scope = scope;
      if (
        stackEntry.functionBody.type === FunctionType.ClassMember &&
        parent &&
        (parent instanceof PyClassInstance || parent instanceof ExceptionObject || parent instanceof SuperProxyObject)
      ) {
        let superFunction: FunctionObject;
        let instance: PyClassInstance;
        if (parent instanceof PyClassInstance) {
          instance = parent as PyClassInstance;
        } else {
          instance = (parent as SuperProxyObject).classInstance;
        }
        scope.getObjectHook = (name: string): PyObject => {
          if (name === 'super') {
            if (!superFunction) {
              superFunction = this.createSuperFunction(instance);
            }
            return superFunction;
          }
        };
      }
    }
    if (stackEntry.functionBody.arguments) {
      for (let i = 0; i < stackEntry.functionBody.arguments.length; i++) {
        const argName = stackEntry.functionBody.module.identifiers[stackEntry.functionBody.arguments[i].id];
        stackEntry.scope.objects[argName] = args[i];
      }
    }
    if (stackEntry.functionBody.code.length > 0) {
      this.updateLocation(stackEntry.functionBody.code[0]);
    }
    return stackEntry;
  }

  private updateLocation(instruction: Instruction) {
    if (instruction.row >= 0) {
      const module = this.getCurrentModule();
      this._locationId = `${module.id}_${instruction.row}`;
    }
  }

  public getNoneObject(): PyObject {
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
    return this.getCurrentFunctionStack().functionBody.module;
  }

  private createLiteral(literalId: number, functionStack: StackEntry, startReg: number): PyObject {
    const module = this.getCurrentModule();
    const literalDef = module.literals[literalId];
    switch (literalDef.type & LiteralType.LiteralMask) {
      case LiteralType.String:
        return new StringObject(literalDef.string);
      case LiteralType.FormattedString:
        return new StringObject(this.applyFormat(literalDef.string, functionStack, startReg));
      case LiteralType.Bytes:
        return new BytesObject(literalDef.string);
      case LiteralType.Integer:
        return new NumberObject(literalDef.integer);
      case LiteralType.FloatingPoint:
        return new NumberObject(literalDef.integer);
    }

    // TODO: implement all other types
    throw new ExceptionObject(ExceptionType.NotImplementedError, UniqueErrorCode.UnsupportedLiteralType, [], literalDef.type.toString());
  }

  private instantiateClass(classObject: PyClass): PyClassInstance {
    const inherits = calculateResolutionOrder(new PyInheritance(classObject.name, classObject));
    if (!inherits) {
      throw new ExceptionObject(ExceptionType.ResolutionOrder, UniqueErrorCode.CannotBuildResolutionOrder);
    }
    const coreExceptions = inherits.filter(c => c.object instanceof ExceptionClassObject && c.object.inheritsFrom.length === 0);
    if (coreExceptions.length > 1) {
      throw new ExceptionObject(ExceptionType.CannotDeriveFromMultipleException, UniqueErrorCode.CannotDeriveFromMultipleException);
    }
    let ret: PyClassInstance;
    if (coreExceptions.length) {
      const exception = coreExceptions[0].object as ExceptionClassObject;
      ret = new ExceptionObject(exception.exceptionType, UniqueErrorCode.NotSpecified, inherits);
    } else {
      ret = new PyClassInstance(inherits);
    }
    ret.setAttribute('__class__', classObject);
    return ret;
  }

  private expandArgument(arg: IterableObject, callback: (items: PyObject[]) => void) {
    // TODO: handle custom iterable objects
    const ret: PyObject[] = [];
    for (let i = 0; i < arg.getCount(); i++) {
      ret.push(arg.getItem(i));
    }
    callback(ret);
  }

  public callFunction(func: Callable, parent: PyObject, onFinish: (ret: PyObject, exception: ExceptionObject) => boolean | void | undefined) {
    const currentStack = this.getCurrentFunctionStack();

    const indexedArgsWithExpand = currentStack.callContext.indexedArgs;
    const expandArg = indexedArgsWithExpand.findIndex(a => a.expand && a.object instanceof IterableObject);
    if (expandArg >= 0) {
      this.expandArgument(indexedArgsWithExpand[expandArg].object as IterableObject, items => {
        currentStack.callContext.indexedArgs.splice(
          expandArg,
          1,
          ...items.map(object => ({
            object,
            expand: false,
          })),
        );
        this.callFunction(func, parent, onFinish);
      });
      return;
    }

    let indexedArgs = currentStack.callContext.indexedArgs.map(a => a.object);

    if (parent && parent instanceof SuperProxyObject) {
      parent = (parent as SuperProxyObject).classInstance;
    }

    if (func.nativeFunction || func.newNativeFunction) {
      currentStack.callContext.onFinish = onFinish;
      let ret: NativeReturnType;
      if (func.newNativeFunction) {
        ret = func.newNativeFunction(currentStack.callContext, this);
      } else {
        ret = func.nativeFunction.apply(parent);
      }
      currentStack.callContext.indexedArgs = [];
      currentStack.callContext.namedArgs = {};
      if (ret === true) {
        return;
      }
      onFinish(ret, null);
      return;
    }

    const namedArgs = currentStack.callContext.namedArgs;

    let returnParent = false;
    if (func instanceof PyClass) {
      const initFunc = func.getAttribute('__init__');
      const classInstance = this.instantiateClass(func);
      if (!classInstance) {
        return;
      }
      if (!initFunc || !(initFunc instanceof Callable)) {
        if (indexedArgs.length > 0 || Object.keys(namedArgs).length > 0) {
          throw new ExceptionObject(ExceptionType.FunctionTooManyArguments, UniqueErrorCode.FunctionTooManyArguments);
        }
        onFinish(classInstance, null);
        return;
      }
      parent = classInstance;
      func = initFunc;
      returnParent = true;
    }

    if (func instanceof InstanceMethodObject) {
      indexedArgs = [parent, ...indexedArgs];
    }

    const runContext = func.context;
    const args: PyObject[] = [];
    const functionBody = func.body as FunctionBody;
    if (!(func instanceof PyClass)) {
      args.length = functionBody.arguments.length;
    }
    let i: number;
    for (i = 0; i < indexedArgs.length; i++) {
      if (i >= args.length) {
        if (func instanceof PyClass) {
          // function class initializer (called before __init__) has no arguments
          break;
        }
        throw new ExceptionObject(
          ExceptionType.FunctionTooManyArguments,
          UniqueErrorCode.FunctionTooManyArguments,
          [],
          indexedArgs.length.toString(),
        );
      }
      const argDef = functionBody.arguments[i];
      if (argDef.type === ArgumentType.ArbitraryArguments) {
        args[i] = new TupleObject(indexedArgs.slice(i));
        i++;
        break;
      } else if (argDef.type === ArgumentType.KeywordArguments) {
        // kwarg should be never addressed through indexed arguments, i.e. provided too many indexed arguments
        throw new ExceptionObject(
          ExceptionType.FunctionTooManyArguments,
          UniqueErrorCode.FunctionTooManyArguments,
          [],
          indexedArgs.length.toString(),
        );
        /* istanbul ignore next */
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
          keywordArgument.setItem(namedArgKey, namedArgs[namedArgKey]);
          continue;
        } else {
          this.raiseUnknownIdentifier(namedArgKey);
          return;
        }
      }
      if (args[i]) {
        throw new ExceptionObject(ExceptionType.FunctionDuplicateArgumentError, UniqueErrorCode.ArgumentAlreadyProvided, [], namedArgKey);
      }
      args[i] = namedArgs[namedArgKey];
    }
    for (i = 0; i < args.length; i++) {
      if (!args[i]) {
        if (runContext.defaultValues[i]) {
          args[i] = runContext.defaultValues[i];
        } else {
          const argName = functionBody.module.identifiers[functionBody.arguments[i].id];
          throw new ExceptionObject(ExceptionType.FunctionMissingArgument, UniqueErrorCode.MissingArgument, [], argName);
        }
      }
    }
    this.enterFunction(
      runContext,
      functionBody,
      (ret: PyObject, exception: ExceptionObject) => onFinish(returnParent && !exception ? parent : ret, exception),
      args,
      parent,
    );
  }

  private exitFunction(value: PyObject) {
    const context = new ContinueContext();
    context.stack = this.getCurrentFunctionStack();
    context.instruction = context.stack.functionBody.code.length;
    context.returnValue = value;
    if (value instanceof NoneObject && context.stack.defaultReturnValue) {
      context.returnValue = context.stack.defaultReturnValue;
    }
    context.type = ContinueContextType.Exit;
    this.setContinueContext(context);
    this.runContinueContext();
  }

  private runContinueContext() {
    while (this._currentStack !== this._continueContext.stack) {
      if (this._currentStack.trySection && this.goToFinally()) {
        return;
      }
      const onFinish = this._currentStack.onFinish;
      this.leaveStack(null, false);
      if (onFinish && this._continueContext.exception) {
        if (onFinish(null, this._continueContext.exception)) {
          this.setContinueContext(null);
          return;
        }
      }
      if (!this._currentStack) {
        throw new ExceptionObject(ExceptionType.SystemError, UniqueErrorCode.UnexpectedEndOfStack);
      }
    }

    if (this._currentStack !== this._continueContext.stack) {
      return;
    }

    let raiseStopIteration = false;

    switch (this._continueContext.type) {
      case ContinueContextType.Exit: {
        const onFinish = this._currentStack.onFinish;
        if (this.onLeaveFunction) {
          this.onLeaveFunction(this._currentStack.functionBody.name, this._currentStack.scope);
        }
        const previousStack = this._currentStack;
        this.leaveStack(this._continueContext.returnValue, false);
        const currentFunctionStack = this.getCurrentFunctionStack();
        if (currentFunctionStack) {
          currentFunctionStack.callContext.namedArgs = {};
          currentFunctionStack.callContext.indexedArgs = [];
          if (previousStack.generatorObject) {
            previousStack.generatorObject.finished = true;
            raiseStopIteration = true;
          } else {
            onFinish(this._continueContext.returnValue, null);
          }
        } else {
          onFinish(this._continueContext.returnValue, null);
        }
        break;
      }
      case ContinueContextType.Cycle: {
        this.getCurrentFunctionStack().instruction = this._continueContext.instruction;
        break;
      }
      case ContinueContextType.Exception: {
        this._currentException = this._continueContext.exception;
        this.getCurrentFunctionStack().instruction = this._continueContext.instruction;
        break;
      }
    }

    this.setContinueContext(null);

    if (raiseStopIteration) {
      throw new ExceptionObject(ExceptionType.StopIteration, UniqueErrorCode.StopIteration);
    }
  }

  private goToFinally(): boolean {
    const functionStack = this.getCurrentFunctionStack();
    if (!this._currentStack.trySection || this._currentStack.finallyHandled) {
      return false;
    }
    const instruction = functionStack.functionBody.code[this._currentStack.endInstruction];
    if (instruction.type !== InstructionType.GotoFinally) {
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
      if (exception.exceptionType === ExceptionType.StopIteration && entry.type === StackEntryType.ForCycle) {
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
      const code = functionStack.functionBody.code;
      let from = entry.endInstruction;
      if (code[from].type === InstructionType.GotoFinally) {
        from++;
      }
      let suitableLabel = -1;
      while (from < code.length && code[from].type === InstructionType.GotoExcept) {
        const id = code[from].arg1;
        if (id === -1) {
          suitableLabel = code[from].arg2;
          break;
        }
        const classObject = this.getObject(functionStack.functionBody.module.identifiers[id], undefined, true);
        if (!classObject) {
          // cannot get object from the stack, better is to ignore the exception handler otherwise it is easy to get into infinite loop
          from++;
          continue;
        }
        if (classObject instanceof ExceptionClassObject && exception.matchesTo(classObject)) {
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
    context.type = ContinueContextType.Exception;
    context.exception = exception;
    context.stack = exceptionEntry;
    context.instruction = exceptionInstruction;
    this.setContinueContext(context);
    this.runContinueContext();
  }

  private applyFormat(format: string, functionStack: StackEntry, startReg: number): string {
    let hasError = false;
    const ret = format.replace(/{([0-9]+)}/g, (_, arg: string) => {
      if (hasError) {
        return;
      }
      const reg = Number(arg);
      if (isNaN(reg)) {
        return '';
      }
      const value = functionStack.getReg(reg + startReg, true, this);
      if (!value) {
        hasError = true;
        return;
      }
      return value.toString();
    });
    if (hasError) {
      return;
    }
    return ret;
  }

  private unaryOperation(obj: PyObject, op: InstructionType): PyObject {
    switch (op) {
      case InstructionType.Invert:
        if (obj instanceof NumberObject) {
          return new NumberObject(-obj.value);
        } else {
          throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedNumberObject, [], obj.toString());
        }
      case InstructionType.BinInv:
        if (obj instanceof NumberObject) {
          let val = obj.value;
          val = ~val;
          return new NumberObject(val);
        } else {
          throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedNumberObject, [], obj.toString());
        }
      default:
        throw new ExceptionObject(ExceptionType.RuntimeError, UniqueErrorCode.UnknownUnaryOperation);
    }
  }

  private mathOperation(leftObj: PyObject, rightObj: PyObject, instruction: Instruction): PyObject {
    const op: InstructionType = instruction.type === InstructionType.AugmentedCopy ? instruction.arg4 : instruction.type;
    switch (op) {
      case InstructionType.Is:
        return BooleanObject.toBoolean(leftObj === rightObj);
      case InstructionType.IsNot:
        return BooleanObject.toBoolean(leftObj !== rightObj);
    }
    if (leftObj instanceof NumberObject && rightObj instanceof NumberObject) {
      const left = leftObj.value;
      const right = rightObj.value;
      switch (op) {
        case InstructionType.Add:
          return this.realToObject(left + right);
        case InstructionType.Sub:
          return this.realToObject(left - right);
        case InstructionType.Mul:
          return this.realToObject(left * right);
        case InstructionType.Div:
          if (right === 0) {
            throw new ExceptionObject(ExceptionType.ZeroDivisionError, UniqueErrorCode.ZeroDivision);
          }
          return this.realToObject(left / right);
        case InstructionType.Pow:
          return this.realToObject(Math.pow(left, right));
        case InstructionType.Floor:
          if (right === 0) {
            throw new ExceptionObject(ExceptionType.ZeroDivisionError, UniqueErrorCode.ZeroDivision);
          }
          return this.realToObject(Math.floor(left / right));
        case InstructionType.Mod:
          if (right === 0) {
            throw new ExceptionObject(ExceptionType.ZeroDivisionError, UniqueErrorCode.ZeroDivision);
          }
          return this.realToObject(left % right);
        case InstructionType.Shl:
          return this.realToObject(left << right);
        case InstructionType.Shr:
          return this.realToObject(left >> right);
        case InstructionType.BinAnd:
          return this.realToObject(left & right);
        case InstructionType.BinOr:
          return this.realToObject(left | right);
        case InstructionType.BinXor:
          return this.realToObject(left ^ right);
        case InstructionType.Less:
          return BooleanObject.toBoolean(left < right);
        case InstructionType.Greater:
          return BooleanObject.toBoolean(left > right);
        case InstructionType.LessEq:
          return BooleanObject.toBoolean(left <= right);
        case InstructionType.GreaterEq:
          return BooleanObject.toBoolean(left >= right);
        case InstructionType.Equal:
          // eslint-disable-next-line eqeqeq
          return BooleanObject.toBoolean(left == right);
        case InstructionType.NotEq:
          // eslint-disable-next-line eqeqeq
          return BooleanObject.toBoolean(left != right);
        default:
          break;
      }
    }
    if (leftObj instanceof StringObject && rightObj instanceof StringObject) {
      const left = leftObj.value;
      const right = rightObj.value;
      switch (op) {
        case InstructionType.Equal:
          return BooleanObject.toBoolean(left === right);
        case InstructionType.NotEq:
          return BooleanObject.toBoolean(left !== right);
        case InstructionType.Add:
          return new StringObject(left + right);
      }
    }
    switch (op) {
      case InstructionType.Equal:
      case InstructionType.NotEq: {
        let compare: Callable;
        let self: PyObject;
        let other: PyObject;
        let invert: boolean;
        let func = leftObj.getAttribute('__eq__');
        if (func && func instanceof Callable) {
          compare = func;
          self = leftObj;
          other = rightObj;
          invert = op === InstructionType.NotEq;
        }
        if (!compare) {
          func = rightObj.getAttribute('__eq__');
          if (func && func instanceof Callable) {
            compare = func;
            self = rightObj;
            other = leftObj;
            invert = op === InstructionType.NotEq;
          }
        }
        if (compare) {
          const currentStack = this.getCurrentFunctionStack();
          const savedIndexedArgs = currentStack.callContext.indexedArgs;
          const savedNamedArgs = currentStack.callContext.namedArgs;
          currentStack.callContext.indexedArgs = [{ object: other, expand: false }];
          currentStack.callContext.namedArgs = {};
          this.callFunction(compare, self, (ret, exception) => {
            if (exception) {
              return;
            }
            currentStack.callContext.indexedArgs = savedIndexedArgs;
            currentStack.callContext.namedArgs = savedNamedArgs;
            if (invert) {
              ret = BooleanObject.toBoolean(!ret.toBoolean());
            }
            currentStack.setReg(instruction.arg3, ret);
          });
        }
        break;
      }
      case InstructionType.Mul:
        if (leftObj instanceof ListObject && rightObj instanceof NumberObject) {
          const newList = new ListObject();
          for (let i = 0; i < rightObj.value; i++) {
            for (let j = 0; j < leftObj.getCount(); j++) {
              newList.addItem(leftObj.getItem(j));
            }
          }
          return newList;
        }
        if (leftObj instanceof TupleObject && rightObj instanceof NumberObject) {
          const newTuple = new TupleObject([]);
          for (let i = 0; i < rightObj.value; i++) {
            for (let j = 0; j < leftObj.getCount(); j++) {
              newTuple.addItem(leftObj.getItem(j));
            }
          }
          return newTuple;
        }
        if (leftObj instanceof StringObject && rightObj instanceof NumberObject) {
          let ret = '';
          for (let i = 0; i < rightObj.value; i++) {
            ret += leftObj.value;
          }
          return new StringObject(ret);
        }
        break;
    }
    switch (op) {
      case InstructionType.Equal:
        return BooleanObject.toBoolean(leftObj.equals(rightObj));
      case InstructionType.NotEq:
        return BooleanObject.toBoolean(!leftObj.equals(rightObj));
      case InstructionType.Mod:
        if (leftObj instanceof StringObject) {
          return stringFormat(leftObj, rightObj);
        }
        break;
      case InstructionType.Less:
        if (leftObj instanceof FrozenSetObject && rightObj instanceof IterableObject) {
          return BooleanObject.toBoolean(FrozenSetObject.issubset(leftObj, rightObj) && !FrozenSetObject.issubset(rightObj, leftObj));
        }
        break;
      case InstructionType.LessEq:
        if (leftObj instanceof FrozenSetObject && rightObj instanceof IterableObject) {
          return BooleanObject.toBoolean(FrozenSetObject.issubset(leftObj, rightObj));
        }
        break;
      case InstructionType.Greater:
        if (leftObj instanceof FrozenSetObject && rightObj instanceof IterableObject) {
          return BooleanObject.toBoolean(FrozenSetObject.issubset(rightObj, leftObj) && !FrozenSetObject.issubset(leftObj, rightObj));
        }
        break;
      case InstructionType.GreaterEq:
        if (leftObj instanceof FrozenSetObject && rightObj instanceof IterableObject) {
          return BooleanObject.toBoolean(FrozenSetObject.issubset(rightObj, leftObj));
        }
        break;
      case InstructionType.BinOr:
        if (leftObj instanceof FrozenSetObject && rightObj instanceof IterableObject) {
          return leftObj.union(rightObj);
        }
        break;
      case InstructionType.BinAnd:
        if (leftObj instanceof FrozenSetObject && rightObj instanceof IterableObject) {
          return leftObj.intersection(rightObj);
        }
        break;
      case InstructionType.Sub:
        if (leftObj instanceof FrozenSetObject && rightObj instanceof IterableObject) {
          return leftObj.difference(rightObj);
        }
        break;
      case InstructionType.BinXor:
        if (leftObj instanceof FrozenSetObject && rightObj instanceof IterableObject) {
          return leftObj.symmetric_difference(rightObj);
        }
        break;
    }
    throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.MathOperationOperandsDontMatch, [], leftObj.toString(), rightObj.toString());
  }

  private setContinueContext(context: ContinueContext) {
    this._continueContext = context;
  }

  public getCurrentException(): PyException {
    return this._currentException;
  }

  public onUnhandledException(exception: ExceptionObject) {
    this._unhandledException = exception;
    while (this._currentStack) {
      this.leaveStack(null, true, this._unhandledException);
    }
  }

  private realToObject(value: number): PyObject {
    return new NumberObject(value);
  }

  public raiseUnknownIdentifier(identifier: string) {
    this.raiseException(new ExceptionObject(ExceptionType.UnknownIdentifier, UniqueErrorCode.UnknownInstruction, [], identifier));
  }

  private createGlobalScope() {
    this._globalScope = new GlobalScope('global');
  }
}
