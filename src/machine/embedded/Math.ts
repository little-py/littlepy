import { ModuleObject } from '../objects/ModuleObject';
import { ExceptionObject } from '../objects/ExceptionObject';
import { ExceptionType } from '../../api/ExceptionType';
import { IterableObject } from '../objects/IterableObject';
import { createNativeModule } from './Utils';
import { pyFunction, pyParam } from '../../api/Decorators';
import { PropertyType } from '../../api/Native';
import { getObjectUtils } from '../../api/ObjectUtils';
import { NumberObject } from '../objects/NumberObject';
import { UniqueErrorCode } from '../../api/UniqueErrorCode';

class PythonMath {
  precision(a: number): number {
    if (!isFinite(a)) return 0;
    let e = 1,
      p = 0;
    while (Math.round(a * e) / e !== a) {
      e *= 10;
      p++;
    }
    return p;
  }

  @pyFunction
  pow(@pyParam('x', PropertyType.Number) x: number, @pyParam('y', PropertyType.Number) y: number) {
    return Math.pow(x, y);
  }

  @pyFunction
  ceil(@pyParam('x', PropertyType.Number) x: number) {
    return Math.ceil(x);
  }

  @pyFunction
  copysign(@pyParam('x', PropertyType.Number) x: number, @pyParam('y', PropertyType.Number) y: number) {
    return y < 0 ? -x : x;
  }

  @pyFunction
  fabs(@pyParam('x', PropertyType.Number) x: number) {
    return Math.abs(x);
  }

  @pyFunction
  factorial(@pyParam('x', PropertyType.Number) x: number) {
    let ret = 1;
    for (let i = 1; i <= x; i++) {
      ret *= i;
    }
    return ret;
  }

  @pyFunction
  floor(@pyParam('x', PropertyType.Number) x: number) {
    return Math.floor(x);
  }

  @pyFunction
  fmod(@pyParam('x', PropertyType.Number) x: number, @pyParam('y', PropertyType.Number) y: number) {
    if (y === 0) {
      throw new ExceptionObject(ExceptionType.ZeroDivisionError, UniqueErrorCode.ZeroDivision);
    }
    return x % y;
  }

  @pyFunction
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  frexp(@pyParam('x', PropertyType.Number) x: number) {
    throw new ExceptionObject(ExceptionType.NotImplementedError, UniqueErrorCode.NotImplemented);
  }

  @pyFunction
  fsum(@pyParam('x', PropertyType.Iterable) x: IterableObject) {
    const values: number[] = [];
    let maxP = 0;
    for (let i = 0; i < x.getCount(); i++) {
      values[i] = getObjectUtils().toNumber(x.getItem(i), 'x');
      const p = this.precision(values[i]);
      if (p > maxP) {
        maxP = p;
      }
    }
    const sum = 10 * maxP;
    let ret = 0;
    for (const x of values) {
      ret += x * sum;
    }
    return ret / sum;
  }

  @pyFunction
  exp(@pyParam('x', PropertyType.Number) x: number) {
    return Math.exp(x);
  }

  @pyFunction
  expm1(@pyParam('x', PropertyType.Number) x: number) {
    return Math.expm1(x);
  }

  @pyFunction
  log(@pyParam('x', PropertyType.Number) x: number) {
    return Math.log(x);
  }

  @pyFunction
  log1p(@pyParam('x', PropertyType.Number) x: number) {
    return Math.log1p(x);
  }

  @pyFunction
  log2(@pyParam('x', PropertyType.Number) x: number) {
    return Math.log2(x);
  }

  @pyFunction
  log10(@pyParam('x', PropertyType.Number) x: number) {
    return Math.log10(x);
  }

  @pyFunction
  sqrt(@pyParam('x', PropertyType.Number) x: number) {
    return Math.sqrt(x);
  }

  @pyFunction
  acos(@pyParam('x', PropertyType.Number) x: number) {
    return Math.acos(x);
  }

  @pyFunction
  asin(@pyParam('x', PropertyType.Number) x: number) {
    return Math.asin(x);
  }

  @pyFunction
  atan(@pyParam('x', PropertyType.Number) x: number) {
    return Math.atan(x);
  }

  @pyFunction
  atan2(@pyParam('x', PropertyType.Number) x: number, @pyParam('y', PropertyType.Number) y: number) {
    return Math.atan2(x, y);
  }

  @pyFunction
  cos(@pyParam('x', PropertyType.Number) x: number) {
    return Math.cos(x);
  }

  @pyFunction
  hypot(@pyParam('x', PropertyType.Number) x: number, @pyParam('y', PropertyType.Number) y: number) {
    return Math.sqrt(x * x + y * y);
  }

  @pyFunction
  sin(@pyParam('x', PropertyType.Number) x: number) {
    return Math.sin(x);
  }

  @pyFunction
  tan(@pyParam('x', PropertyType.Number) x: number) {
    return Math.tan(x);
  }

  @pyFunction
  degrees(@pyParam('x', PropertyType.Number) x: number) {
    return x * 57.29577951308232;
  }

  @pyFunction
  radians(@pyParam('x', PropertyType.Number) x: number) {
    return x * 0.017453292519943295;
  }
}

export const mathFunctions = new PythonMath();

export function createMathModule(): ModuleObject {
  const ret = createNativeModule(mathFunctions, 'math');
  ret.setAttribute('pi', new NumberObject(3.141592653589793));
  ret.setAttribute('e', new NumberObject(2.718281828459045));
  return ret;
}
