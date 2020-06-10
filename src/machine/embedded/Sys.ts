import { RunContext } from '../RunContext';
import { TupleObject } from '../objects/TupleObject';
import { ExceptionClassObject } from '../objects/ExceptionClassObject';
import { createNativeModule } from './Utils';
import { PyObject } from '../../api/Object';
import { pyFunction, pyParam } from '../../api/Decorators';
import { PropertyType } from '../../api/Native';

class PythonSys {
  @pyFunction
  // eslint-disable-next-line @typescript-eslint/camelcase
  public exc_info(@pyParam('', PropertyType.Machine) runContext: RunContext): TupleObject {
    const exception = runContext.getCurrentException();
    let items: PyObject[];
    if (exception) {
      items = [new ExceptionClassObject(null, null, exception.exceptionType), exception, new PyObject()];
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
