import { ModuleObject } from '../objects/ModuleObject';
import { RealObject } from '../objects/RealObject';
import { ExceptionObject } from '../objects/ExceptionObject';
import { ExceptionType } from '../../api/ExceptionType';
import { IterableObject } from '../objects/IterableObject';
import { nativeFunction, param } from '../NativeTypes';
import { createNativeModule } from './Utils';

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

  @nativeFunction
  pow(@param('x', RealObject) x: number, @param('y', RealObject) y: number) {
    return new RealObject(Math.pow(x, y));
  }

  @nativeFunction
  ceil(@param('x', RealObject) x: number) {
    return new RealObject(Math.ceil(x));
  }

  @nativeFunction
  copysign(@param('x', RealObject) x: number, @param('y', RealObject) y: number) {
    return new RealObject(y < 0 ? -x : x);
  }

  @nativeFunction
  fabs(@param('x', RealObject) x: number) {
    return new RealObject(Math.abs(x));
  }

  @nativeFunction
  factorial(@param('x', RealObject) x: number) {
    let ret = 1;
    for (let i = 1; i <= x; i++) {
      ret *= i;
    }
    return new RealObject(ret);
  }

  @nativeFunction
  floor(@param('x', RealObject) x: number) {
    return new RealObject(Math.floor(x));
  }

  @nativeFunction
  fmod(@param('x', RealObject) x: number, @param('y', RealObject) y: number) {
    if (y === 0) {
      throw new ExceptionObject(ExceptionType.ZeroDivisionError);
    }
    return new RealObject(x % y);
  }

  @nativeFunction
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  frexp(@param('x', RealObject) x: number) {
    throw new ExceptionObject(ExceptionType.NotImplementedError);
  }

  @nativeFunction
  fsum(@param('x', IterableObject) x: IterableObject) {
    const values: number[] = [];
    let maxP = 0;
    for (let i = 0; i < x.getCount(); i++) {
      values[i] = x.getItem(i).toReal();
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
    return new RealObject(ret / sum);
  }

  @nativeFunction
  exp(@param('x', RealObject) x: number) {
    return new RealObject(Math.exp(x));
  }

  @nativeFunction
  expm1(@param('x', RealObject) x: number) {
    return new RealObject(Math.expm1(x));
  }

  @nativeFunction
  log(@param('x', RealObject) x: number) {
    return new RealObject(Math.log(x));
  }

  @nativeFunction
  log1p(@param('x', RealObject) x: number) {
    return new RealObject(Math.log1p(x));
  }

  @nativeFunction
  log2(@param('x', RealObject) x: number) {
    return new RealObject(Math.log2(x));
  }

  @nativeFunction
  log10(@param('x', RealObject) x: number) {
    return new RealObject(Math.log10(x));
  }

  @nativeFunction
  sqrt(@param('x', RealObject) x: number) {
    return new RealObject(Math.sqrt(x));
  }

  @nativeFunction
  acos(@param('x', RealObject) x: number) {
    return new RealObject(Math.acos(x));
  }

  @nativeFunction
  asin(@param('x', RealObject) x: number) {
    return new RealObject(Math.asin(x));
  }

  @nativeFunction
  atan(@param('x', RealObject) x: number) {
    return new RealObject(Math.atan(x));
  }

  @nativeFunction
  atan2(@param('x', RealObject) x: number, @param('y', RealObject) y: number) {
    return new RealObject(Math.atan2(x, y));
  }

  @nativeFunction
  cos(@param('x', RealObject) x: number) {
    return new RealObject(Math.cos(x));
  }

  @nativeFunction
  hypot(@param('x', RealObject) x: number, @param('y', RealObject) y: number) {
    return new RealObject(Math.sqrt(x * x + y * y));
  }

  @nativeFunction
  sin(@param('x', RealObject) x: number) {
    return new RealObject(Math.sin(x));
  }

  @nativeFunction
  tan(@param('x', RealObject) x: number) {
    return new RealObject(Math.tan(x));
  }

  @nativeFunction
  degrees(@param('x', RealObject) x: number) {
    return new RealObject(x * 57.29577951308232);
  }

  @nativeFunction
  radians(@param('x', RealObject) x: number) {
    return new RealObject(x * 0.017453292519943295);
  }
}

export const mathFunctions = new PythonMath();

export function createMathModule(): ModuleObject {
  const ret = createNativeModule(mathFunctions, 'math');
  ret.setAttribute('pi', new RealObject(3.141592653589793));
  ret.setAttribute('e', new RealObject(2.718281828459045));
  return ret;
}
