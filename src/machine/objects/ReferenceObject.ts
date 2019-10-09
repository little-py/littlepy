import { BaseObject } from './BaseObject';
import { RunContext } from '../RunContext';
import { ListObject } from './ListObject';
import { IntegerObject } from './IntegerObject';
import { StringObject } from './StringObject';
import { ObjectScope } from '../ObjectScope';
import { DictionaryObject } from './DictionaryObject';
import { IterableObject } from './IterableObject';
import { ReferenceScope } from '../../common/ReferenceScope';
import { ContainerObject } from './ContainerObject';
import { TupleObject } from './TupleObject';
import { ExceptionType } from '../../api/ExceptionType';

export enum ReferenceType {
  Index = 'Index',
  Property = 'Property',
  Variable = 'Variable',
  Range = 'Range',
}

export class ReferenceObject extends BaseObject {
  public readonly parent: BaseObject;
  public readonly indexer: BaseObject;
  public readonly referenceType: ReferenceType;
  public readonly scopeType: ReferenceScope;
  public readonly indexTo: BaseObject;
  public readonly indexInterval: BaseObject;

  public constructor(
    parent: BaseObject,
    indexer: BaseObject,
    type: ReferenceType,
    scope: ReferenceScope,
    runContext: RunContext,
    inxexTo: BaseObject = null,
    indexInterval: BaseObject = null,
  ) {
    super();
    this.parent = parent;
    this.indexer = indexer;
    this.indexTo = inxexTo;
    this.indexInterval = indexInterval;
    this.referenceType = type;
    this.scopeType = scope;
    this.validate(runContext);
  }

  private validate(runContext: RunContext) {
    switch (this.referenceType) {
      case ReferenceType.Index:
        if (this.parent instanceof IterableObject) {
          return true;
        }
        break;
      case ReferenceType.Property:
        if (!(this.indexer instanceof StringObject)) {
          runContext.raiseTypeConversion();
          return;
        }
        break;
      case ReferenceType.Variable:
        if (!(this.parent instanceof StringObject)) {
          runContext.raiseTypeConversion();
          return;
        }
        break;
      case ReferenceType.Range:
        if (!(this.parent instanceof ContainerObject)) {
          runContext.raiseTypeConversion();
          return;
        }
        if (!(this.indexer instanceof IntegerObject)) {
          runContext.raiseTypeConversion();
          return;
        }
        if (!(this.indexTo instanceof IntegerObject)) {
          runContext.raiseTypeConversion();
          return;
        }
        if (this.indexInterval && !(this.indexer instanceof IntegerObject)) {
          runContext.raiseTypeConversion();
          return;
        }
        break;
    }
  }

  private getTargetScope(runContext: RunContext, name: string): ObjectScope {
    const functionScope = runContext.getCurrentFunctionStack().scope;
    switch (this.scopeType) {
      case ReferenceScope.Global:
        return runContext.getGlobalScope();
      case ReferenceScope.NonLocal:
        const scope = functionScope.parent.getObjectParent(name);
        if (!scope.parent) {
          return null; // we don't return global scope for nonlocal
        }
        return scope;
    }
    return functionScope;
  }

  public deleteValue(runContext: RunContext) {
    switch (this.referenceType) {
      case ReferenceType.Variable: {
        const name = this.parent as StringObject;
        const scope = this.getTargetScope(runContext, name.value);
        if (!scope || !scope[name.value]) {
          runContext.raiseUnknownIdentifier(name.value);
          return;
        }
        delete scope.objects[name.value];
        return;
      }
      case ReferenceType.Property: {
        const indexer = this.indexer as StringObject;
        this.parent.deleteAttribute(indexer.value);
        return;
      }
      case ReferenceType.Index: {
        if (this.indexer instanceof IntegerObject) {
          if (this.parent instanceof ListObject) {
            this.parent.removeItem(this.indexer.value);
            return;
          }
        } else if (this.indexer instanceof StringObject) {
          if (this.parent instanceof DictionaryObject) {
            this.parent.removeItem(this.indexer.value);
            return;
          }
        }
      }
    }
    BaseObject.throwException(ExceptionType.ReferenceError);
  }

  public setValue(value: BaseObject, runContext: RunContext) {
    switch (this.referenceType) {
      case ReferenceType.Index: {
        if (this.parent instanceof ListObject && this.indexer instanceof IntegerObject) {
          const list = this.parent as ListObject;
          const indexer = this.indexer as IntegerObject;
          list.setItem(indexer.value, value);
        } else {
          const indexer = this.indexer as StringObject;
          if (this.parent instanceof DictionaryObject) {
            this.parent.setItem(indexer.value, value);
          } else {
            this.parent.setAttribute(indexer.value, value);
          }
        }
        break;
      }
      case ReferenceType.Property: {
        const indexer = this.indexer as StringObject;
        this.parent.setAttribute(indexer.value, value);
        break;
      }
      case ReferenceType.Variable: {
        const name = this.parent as StringObject;
        const scope = this.getTargetScope(runContext, name.value);
        if (!scope) {
          runContext.raiseUnknownIdentifier(name.value);
          return;
        }
        scope.objects[name.value] = value;
        break;
      }
      case ReferenceType.Range: {
        if (!(value instanceof IterableObject) || !(this.parent instanceof ListObject)) {
          runContext.raiseTypeConversion();
          return;
        }
        const from = IntegerObject.toInteger(this.indexer, 'from');
        const to = IntegerObject.toInteger(this.indexTo, 'to');
        const step = this.indexInterval ? (this.indexInterval as IntegerObject).value : 1;
        if (step === 0) {
          runContext.raiseFunctionArgumentError();
          return;
        }
        if (step < 0) {
          for (let i = from, j = 0; i > to; i += step, j++) {
            this.parent.setItem(i, value.getItem(j));
          }
        } else {
          for (let i = from, j = 0; i < to; i += step, j++) {
            this.parent.setItem(i, value.getItem(j));
          }
        }
        break;
      }
      default:
        // safety check
        /* istanbul ignore next */
        runContext.onRuntimeError();
        /* istanbul ignore next */
        break;
    }
  }

  public getValue(runContext: RunContext): BaseObject {
    switch (this.referenceType) {
      case ReferenceType.Variable: {
        const name = this.parent as StringObject;
        const scope = this.getTargetScope(runContext, name.value);
        const value = scope && scope.getObject(name.value);
        if (!value) {
          runContext.raiseUnknownIdentifier(name.value);
          return;
        }
        return value;
      }
      case ReferenceType.Property: {
        const indexer = this.indexer as StringObject;
        const ret = this.parent.getAttribute(indexer.value);
        if (!ret) {
          runContext.raiseUnknownIdentifier(indexer.value);
          return;
        }
        return ret;
      }
      case ReferenceType.Index: {
        if (this.parent instanceof ListObject && this.indexer instanceof IntegerObject) {
          const list = this.parent as ListObject;
          const indexer = this.indexer as IntegerObject;
          return list.getItem(indexer.value);
        } else {
          if (this.parent instanceof IterableObject && this.indexer instanceof StringObject) {
            return this.parent.getItem(this.indexer.value);
          } else if (this.parent instanceof IterableObject && this.indexer instanceof IntegerObject) {
            return this.parent.getItem(this.indexer.value);
          }
        }
        break;
      }
      case ReferenceType.Range: {
        const from = (this.indexer as IntegerObject).value;
        const to = (this.indexTo as IntegerObject).value;
        const step = this.indexInterval ? (this.indexInterval as IntegerObject).value : 1;
        if (step === 0) {
          runContext.raiseFunctionArgumentError();
          return;
        }
        if (this.parent instanceof TupleObject) {
          const value = new TupleObject([]);
          if (step < 0) {
            for (let i = from, j = 0; i > to; i += step, j++) {
              value.addItem((this.parent as ContainerObject).getItem(i));
            }
          } else {
            for (let i = from, j = 0; i < to; i += step, j++) {
              value.addItem((this.parent as ContainerObject).getItem(i));
            }
          }
          return value;
        } else {
          const value = new ListObject();
          if (step < 0) {
            for (let i = from, j = 0; i > to; i += step, j++) {
              value.addItem((this.parent as ContainerObject).getItem(i));
            }
          } else {
            for (let i = from, j = 0; i < to; i += step, j++) {
              value.addItem((this.parent as ContainerObject).getItem(i));
            }
          }
          return value;
        }
      }
      default:
        // safety check
        /* istanbul ignore next */
        runContext.onRuntimeError();
        /* istanbul ignore next */
        break;
    }
  }
}
