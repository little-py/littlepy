import { BaseObject } from './BaseObject';
import { RunContext } from '../RunContext';
import { ListObject } from './ListObject';
import { IntegerObject } from './IntegerObject';
import { StringObject } from './StringObject';
import { ObjectScope } from '../ObjectScope';
import { DictionaryObject } from './DictionaryObject';
import { IterableObject } from './IterableObject';
import { ReferenceScope } from '../../common/ReferenceScope';

export enum ReferenceType {
  Index = 'Index',
  Property = 'Property',
  Variable = 'Variable',
}

export class ReferenceObject extends BaseObject {
  public constructor(parent: BaseObject, indexer: BaseObject, type: ReferenceType, scope: ReferenceScope, runContext: RunContext) {
    super();
    this.parent = parent;
    this.indexer = indexer;
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
    }
  }

  public readonly parent: BaseObject;
  public readonly indexer: BaseObject;
  public readonly referenceType: ReferenceType;
  public readonly scopeType: ReferenceScope;

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
      default:
        runContext.onRuntimeError();
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
      default:
        runContext.onRuntimeError();
        break;
    }
  }
}
