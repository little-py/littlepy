import { BaseObject } from '../objects/BaseObject';
import { RunContext } from '../RunContext';
import { TupleObject } from '../objects/TupleObject';
import { ExceptionClassObject } from '../objects/ExceptionClassObject';
import { nativeFunction, param, RunContextBase } from '../NativeTypes';
import { createNativeModule } from './Utils';

class PythonSys {
  @nativeFunction
  // eslint-disable-next-line @typescript-eslint/camelcase
  public exc_info(@param('', RunContextBase) runContext: RunContext): TupleObject {
    const exception = runContext.getCurrentException();
    let items: BaseObject[];
    if (exception) {
      items = [new ExceptionClassObject(null, exception.exceptionType), exception, new BaseObject()];
    } else {
      items = [runContext.getNoneObject(), runContext.getNoneObject(), runContext.getNoneObject()];
    }
    return new TupleObject(items);
  }
}

const sysInstance = new PythonSys();

export const sys = () => {
  return createNativeModule(sysInstance, 'sys');
};
