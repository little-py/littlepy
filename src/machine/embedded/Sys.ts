import { BaseObject } from '../objects/BaseObject';
import { FunctionObject } from '../objects/FunctionObject';
import { RunContext } from '../RunContext';
import { TupleObject } from '../objects/TupleObject';
import { ExceptionClassObject } from '../objects/ExceptionClassObject';

function sysExceptionInfo(runContext: RunContext): TupleObject {
  const exception = runContext.getCurrentException();
  let items: BaseObject[];
  if (exception) {
    items = [new ExceptionClassObject(null, exception.exceptionType), exception, new BaseObject()];
  } else {
    items = [runContext.getNoneObject(), runContext.getNoneObject(), runContext.getNoneObject()];
  }
  return new TupleObject(items);
}

export const exceptionInfo = new FunctionObject(null, sysExceptionInfo);

export const sys = () => {
  const instance = new BaseObject();
  instance.name = 'sys';
  instance.setAttribute('exc_info', exceptionInfo);
  return instance;
};
