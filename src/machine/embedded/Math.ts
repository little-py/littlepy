import { ModuleObject } from '../objects/ModuleObject';
import { NumberObject } from '../objects/NumberObject';
import { ExceptionObject } from '../objects/ExceptionObject';
import { ExceptionType } from '../../api/ExceptionType';
import { IterableObject } from '../objects/IterableObject';
import { createNativeModule } from './Utils';
import { pyFunction, pyParam } from '../../api/Decorators';

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
  pow(@pyParam('x', NumberObject) x: number, @pyParam('y', NumberObject) y: number) {
    return new NumberObject(Math.pow(x, y));
  }

  @pyFunction
  ceil(@pyParam('x', NumberObject) x: number) {
    return new NumberObject(Math.ceil(x));
  }

  @pyFunction
  copysign(@pyParam('x', NumberObject) x: number, @pyParam('y', NumberObject) y: number) {
    return new NumberObject(y < 0 ? -x : x);
  }

  @pyFunction
  fabs(@pyParam('x', NumberObject) x: number) {
    return new NumberObject(Math.abs(x));
  }

  @pyFunction
  factorial(@pyParam('x', NumberObject) x: number) {
    let ret = 1;
    for (let i = 1; i <= x; i++) {
      ret *= i;
    }
    return new NumberObject(ret);
  }

  @pyFunction
  floor(@pyParam('x', NumberObject) x: number) {
    return new NumberObject(Math.floor(x));
  }

  @pyFunction
  fmod(@pyParam('x', NumberObject) x: number, @pyParam('y', NumberObject) y: number) {
    if (y === 0) {
      throw new ExceptionObject(ExceptionType.ZeroDivisionError);
    }
    return new NumberObject(x % y);
  }

  @pyFunction
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  frexp(@pyParam('x', NumberObject) x: number) {
    throw new ExceptionObject(ExceptionType.NotImplementedError);
  }

  @pyFunction
  fsum(@pyParam('x', IterableObject) x: IterableObject) {
    const values: number[] = [];
    let maxP = 0;
    for (let i = 0; i < x.getCount(); i++) {
      values[i] = NumberObject.toNumber(x.getItem(i), 'x');
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
    return new NumberObject(ret / sum);
  }

  @pyFunction
  exp(@pyParam('x', NumberObject) x: number) {
    return new NumberObject(Math.exp(x));
  }

  @pyFunction
  expm1(@pyParam('x', NumberObject) x: number) {
    return new NumberObject(Math.expm1(x));
  }

  @pyFunction
  log(@pyParam('x', NumberObject) x: number) {
    return new NumberObject(Math.log(x));
  }

  @pyFunction
  log1p(@pyParam('x', NumberObject) x: number) {
    return new NumberObject(Math.log1p(x));
  }

  @pyFunction
  log2(@pyParam('x', NumberObject) x: number) {
    return new NumberObject(Math.log2(x));
  }

  @pyFunction
  log10(@pyParam('x', NumberObject) x: number) {
    return new NumberObject(Math.log10(x));
  }

  @pyFunction
  sqrt(@pyParam('x', NumberObject) x: number) {
    return new NumberObject(Math.sqrt(x));
  }

  @pyFunction
  acos(@pyParam('x', NumberObject) x: number) {
    return new NumberObject(Math.acos(x));
  }

  @pyFunction
  asin(@pyParam('x', NumberObject) x: number) {
    return new NumberObject(Math.asin(x));
  }

  @pyFunction
  atan(@pyParam('x', NumberObject) x: number) {
    return new NumberObject(Math.atan(x));
  }

  @pyFunction
  atan2(@pyParam('x', NumberObject) x: number, @pyParam('y', NumberObject) y: number) {
    return new NumberObject(Math.atan2(x, y));
  }

  @pyFunction
  cos(@pyParam('x', NumberObject) x: number) {
    return new NumberObject(Math.cos(x));
  }

  @pyFunction
  hypot(@pyParam('x', NumberObject) x: number, @pyParam('y', NumberObject) y: number) {
    return new NumberObject(Math.sqrt(x * x + y * y));
  }

  @pyFunction
  sin(@pyParam('x', NumberObject) x: number) {
    return new NumberObject(Math.sin(x));
  }

  @pyFunction
  tan(@pyParam('x', NumberObject) x: number) {
    return new NumberObject(Math.tan(x));
  }

  @pyFunction
  degrees(@pyParam('x', NumberObject) x: number) {
    return new NumberObject(x * 57.29577951308232);
  }

  @pyFunction
  radians(@pyParam('x', NumberObject) x: number) {
    return new NumberObject(x * 0.017453292519943295);
  }
}

export const mathFunctions = new PythonMath();

export function createMathModule(): ModuleObject {
  const ret = createNativeModule(mathFunctions, 'math');
  ret.setAttribute('pi', new NumberObject(3.141592653589793));
  ret.setAttribute('e', new NumberObject(2.718281828459045));
  return ret;
}
