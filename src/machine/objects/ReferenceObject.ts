import { RunContext } from '../RunContext';
import { ListObject } from './ListObject';
import { StringObject } from './StringObject';
import { DictionaryObject } from './DictionaryObject';
import { IterableObject } from './IterableObject';
import { ReferenceScope } from '../../api/ReferenceScope';
import { ContainerObject } from './ContainerObject';
import { TupleObject } from './TupleObject';
import { ExceptionType } from '../../api/ExceptionType';
import { ExceptionObject } from './ExceptionObject';
import { PyObject } from '../../api/Object';
import { getObjectUtils } from '../../api/ObjectUtils';
import { NumberObject } from './NumberObject';
import { PyScope } from '../../api/Scope';
import { UniqueErrorCode } from '../../api/UniqueErrorCode';

export enum ReferenceType {
  Index = 'Index',
  Property = 'Property',
  Variable = 'Variable',
  Range = 'Range',
}

export class ReferenceObject extends PyObject {
  public readonly parent: PyObject;
  public readonly indexer: PyObject;
  public readonly referenceType: ReferenceType;
  public readonly scopeType: ReferenceScope;
  public readonly indexTo: PyObject;
  public readonly indexInterval: PyObject;

  public constructor(
    parent: PyObject,
    indexer: PyObject,
    type: ReferenceType,
    scope: ReferenceScope,
    runContext: RunContext,
    inxexTo: PyObject = null,
    indexInterval: PyObject = null,
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
        if (!(this.parent instanceof IterableObject)) {
          runContext.raiseException(new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedIterableObject, [], this.parent.toString()));
          /* istanbul ignore next */
          return;
        }
        if (!(this.indexer instanceof NumberObject) && !(this.indexer instanceof StringObject)) {
          runContext.raiseException(
            new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedNumericOrStringIndexer, [], this.indexer.toString()),
          );
          /* istanbul ignore next */
          return;
        }
        break;
      case ReferenceType.Property:
        if (!(this.indexer instanceof StringObject)) {
          runContext.raiseException(new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedStringObject, [], this.indexer.toString()));
          /* istanbul ignore next */
          return;
        }
        break;
      case ReferenceType.Variable:
        if (!(this.parent instanceof StringObject)) {
          runContext.raiseException(new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedStringObject, [], this.parent.toString()));
          /* istanbul ignore next */
          return;
        }
        break;
      case ReferenceType.Range:
        if (!(this.parent instanceof ContainerObject)) {
          runContext.raiseException(new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedContainer, [], this.parent.toString()));
          /* istanbul ignore next */
          return;
        }
        if (!(this.indexer instanceof NumberObject)) {
          runContext.raiseException(new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedNumberObject, [], this.indexer.toString()));
          /* istanbul ignore next */
          return;
        }
        if (!(this.indexTo instanceof NumberObject)) {
          runContext.raiseException(new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedNumberObject, [], this.indexTo.toString()));
          /* istanbul ignore next */
          return;
        }
        if (this.indexInterval && !(this.indexer instanceof NumberObject)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          runContext.raiseException(new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedNumberObject, [], this.indexer.toString()));
          /* istanbul ignore next */
        }
        break;
    }
  }

  private getTargetScope(runContext: RunContext, name: string): PyScope {
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

  public deleteValue(runContext: RunContext): void {
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
        if (this.indexer instanceof NumberObject) {
          if (this.parent instanceof ListObject) {
            this.parent.removeItem(this.indexer.value);
            return;
          } else {
            getObjectUtils().throwException(ExceptionType.TypeError, UniqueErrorCode.ExpectedListObject, this.indexer.toString());
          }
        } else if (this.indexer instanceof StringObject) {
          if (this.parent instanceof DictionaryObject) {
            this.parent.removeItem(this.indexer.value);
            return;
          } else {
            getObjectUtils().throwException(ExceptionType.TypeError, UniqueErrorCode.ExpectedDictionaryObject, this.indexer.toString());
          }
        } else {
          getObjectUtils().throwException(ExceptionType.ReferenceError, UniqueErrorCode.ExpectedNumericOrStringIndexer, this.indexer.toString());
        }
      }
    }
  }

  public setValue(value: PyObject, runContext: RunContext): void {
    switch (this.referenceType) {
      case ReferenceType.Index: {
        if (this.parent instanceof ListObject && this.indexer instanceof NumberObject) {
          this.parent.setItem(this.indexer.value, value);
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
        if (!(value instanceof IterableObject)) {
          runContext.raiseException(new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedIterableObject, [], value.toString()));
          return;
        }
        if (!(this.parent instanceof ListObject)) {
          runContext.raiseException(new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedListObject, [], value.toString()));
          return;
        }
        const from = getObjectUtils().toNumber(this.indexer, 'from');
        const to = getObjectUtils().toNumber(this.indexTo, 'to');
        const step = this.indexInterval ? (this.indexInterval as NumberObject).value : 1;
        if (step === 0) {
          runContext.raiseException(new ExceptionObject(ExceptionType.FunctionArgumentError, UniqueErrorCode.StepCannotBeZero));
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
    }
  }

  public getValue(runContext: RunContext): PyObject {
    switch (this.referenceType) {
      case ReferenceType.Variable: {
        const name = this.parent as StringObject;
        const scope = this.getTargetScope(runContext, name.value);
        const value = scope && scope.getObject(name.value);
        if (!value) {
          throw new ExceptionObject(ExceptionType.UnknownIdentifier, UniqueErrorCode.UnknownIdentifier, [], name.value);
        }
        return value;
      }
      case ReferenceType.Property: {
        const indexer = this.indexer as StringObject;
        const ret = this.parent.getAttribute(indexer.value);
        if (!ret) {
          throw new ExceptionObject(ExceptionType.UnknownIdentifier, UniqueErrorCode.UnknownIdentifier, [], indexer.value);
        }
        return ret;
      }
      case ReferenceType.Index: {
        if (!(this.parent instanceof IterableObject)) {
          throw new ExceptionObject(ExceptionType.TypeError, UniqueErrorCode.ExpectedIterableObject, [], this.parent.toString());
        }
        if (this.parent instanceof ListObject && this.indexer instanceof NumberObject) {
          const list = this.parent as ListObject;
          const indexer = this.indexer as NumberObject;
          const ret = list.getItem(indexer.value);
          if (!ret) {
            throw new ExceptionObject(ExceptionType.IndexError, UniqueErrorCode.IndexerIsOutOfRange, [], this.indexer.value.toString());
          }
          return ret;
        } else if (this.indexer instanceof StringObject) {
          const ret = this.parent.getItem(this.indexer.value);
          if (!ret) {
            throw new ExceptionObject(ExceptionType.UnknownIdentifier, UniqueErrorCode.UnknownIdentifier, [], this.indexer.value);
          }
          return ret;
        } else if (this.indexer instanceof NumberObject) {
          const ret = this.parent.getItem(this.indexer.value);
          if (!ret) {
            throw new ExceptionObject(ExceptionType.IndexError, UniqueErrorCode.IndexerIsOutOfRange, [], this.indexer.value.toString());
          }
          return ret;
        }
        break;
      }
      case ReferenceType.Range: {
        const from = (this.indexer as NumberObject).value;
        const to = (this.indexTo as NumberObject).value;
        const step = this.indexInterval ? (this.indexInterval as NumberObject).value : 1;
        if (step === 0) {
          throw new ExceptionObject(ExceptionType.FunctionArgumentError, UniqueErrorCode.StepCannotBeZero);
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
    }
  }
}
