import { BaseObject, ObjectType } from './BaseObject';
import { RunContext } from '../RunContext';
import { ListObject } from './ListObject';
import { IntegerObject } from './IntegerObject';
import { StringObject } from './StringObject';
import { ObjectScope } from '../ObjectScope';
import { DictionaryObject } from './DictionaryObject';

export enum ReferenceType {
  Index,
  Property,
  Variable,
}

export enum ReferenceScope {
  Default,
  Global,
  NonLocal,
}

export class ReferenceObject extends BaseObject {
  public constructor(parent: BaseObject, indexer: BaseObject, type: ReferenceType, scope: ReferenceScope, runContext: RunContext) {
    super(ObjectType.Reference);
    this.parent = parent;
    this.indexer = indexer;
    this.referenceType = type;
    this.scopeType = scope;
    this.validate(runContext);
  }

  private validate(runContext: RunContext) {
    switch (this.referenceType) {
      case ReferenceType.Index:
        if (this.parent.type === ObjectType.List && this.indexer.type === ObjectType.Integer) {
          return true;
        }
        if (this.indexer.type !== ObjectType.String) {
          runContext.raiseTypeConversion();
          return;
        }
        break;
      case ReferenceType.Property:
        if (this.indexer.type !== ObjectType.String) {
          runContext.raiseTypeConversion();
          return;
        }
        break;
      case ReferenceType.Variable:
        if (this.parent.type !== ObjectType.String) {
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
        if (this.parent.type === ObjectType.List && this.indexer.type === ObjectType.Integer) {
          const list = this.parent as ListObject;
          const indexer = this.indexer as IntegerObject;
          list.setItem(indexer.value, value);
        } else {
          const indexer = this.indexer as StringObject;
          if (this.parent.type === ObjectType.Dictionary) {
            (this.parent as DictionaryObject).setDictionaryItem(indexer.value, value);
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
        if (this.parent.type === ObjectType.List && this.indexer.type === ObjectType.Integer) {
          const list = this.parent as ListObject;
          const indexer = this.indexer as IntegerObject;
          return list.getItem(indexer.value);
        } else {
          const indexer = this.indexer as StringObject;
          if (this.parent.type === ObjectType.Dictionary) {
            return (this.parent as DictionaryObject).getDictionaryItem(indexer.value);
          } else {
            const ret = this.parent.getAttribute(indexer.value);
            if (!ret) {
              runContext.raiseUnknownIdentifier(indexer.value);
            }
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
