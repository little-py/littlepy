import { ModuleObject } from '../objects/ModuleObject';
import { BaseObject } from '../objects/BaseObject';
import { RealObject } from '../objects/RealObject';
import { ExceptionObject } from '../objects/ExceptionObject';
import { ExceptionType } from '../../api/ExceptionType';
import { IterableObject } from '../objects/IterableObject';
import { getFunctionObject } from './Utils';

function precision(a: number): number {
  if (!isFinite(a)) return 0;
  let e = 1,
    p = 0;
  while (Math.round(a * e) / e !== a) {
    e *= 10;
    p++;
  }
  return p;
}

export function pow(x: BaseObject, y: BaseObject) {
  const xObj = Math.abs(RealObject.toReal(x, 'x'));
  const yObj = RealObject.toReal(y, 'y');
  return new RealObject(Math.pow(xObj, yObj));
}

export const createMathModule = (): ModuleObject => {
  const ret = new ModuleObject();
  ret.name = 'math';
  const functions = {
    ceil: function(x: BaseObject) {
      const xObj = RealObject.toReal(x, 'x');
      return new RealObject(Math.ceil(xObj));
    },
    copysign: function(x: BaseObject, y: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      const yObj = RealObject.toReal(y, 'y');
      return new RealObject(yObj < 0 ? -xObj : xObj);
    },
    fabs: function(x: BaseObject) {
      return new RealObject(Math.abs(RealObject.toReal(x, 'x')));
    },
    factorial: function(x: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      let ret = 1;
      for (let i = 1; i <= xObj; i++) {
        ret *= i;
      }
      return new RealObject(ret);
    },
    floor: function(x: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      return new RealObject(Math.floor(xObj));
    },
    fmod: function(x: BaseObject, y: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      const yObj = RealObject.toReal(y, 'y');
      if (yObj === 0) {
        throw new ExceptionObject(ExceptionType.ZeroDivisionError);
      }
      return new RealObject(xObj % yObj);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    frexp: function(x: BaseObject) {
      throw new ExceptionObject(ExceptionType.NotImplementedError);
    },
    fsum: function(x: BaseObject) {
      if (!(x instanceof IterableObject)) {
        throw new ExceptionObject(ExceptionType.ValueError);
      }
      const values: number[] = [];
      let maxP = 0;
      for (let i = 0; i < x.getCount(); i++) {
        values[i] = x.getItem(i).toReal();
        const p = precision(values[i]);
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
    },
    exp: function(x: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      return new RealObject(Math.exp(xObj));
    },
    expm1: function(x: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      return new RealObject(Math.expm1(xObj));
    },
    log: function(x: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      return new RealObject(Math.log(xObj));
    },
    log1p: function(x: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      return new RealObject(Math.log1p(xObj));
    },
    log2: function(x: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      return new RealObject(Math.log2(xObj));
    },
    log10: function(x: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      return new RealObject(Math.log10(xObj));
    },
    pow,
    sqrt: function(x: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      return new RealObject(Math.sqrt(xObj));
    },
    acos: function(x: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      return new RealObject(Math.acos(xObj));
    },
    asin: function(x: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      return new RealObject(Math.asin(xObj));
    },
    atan: function(x: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      return new RealObject(Math.atan(xObj));
    },
    atan2: function(x: BaseObject, y: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      const yObj = RealObject.toReal(y, 'y');
      return new RealObject(Math.atan2(xObj, yObj));
    },
    cos: function(x: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      return new RealObject(Math.cos(xObj));
    },
    hypot: function(x: BaseObject, y: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      const yObj = RealObject.toReal(y, 'y');
      return new RealObject(Math.sqrt(xObj * xObj + yObj * yObj));
    },
    sin: function(x: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      return new RealObject(Math.sin(xObj));
    },
    tan: function(x: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      return new RealObject(Math.tan(xObj));
    },
    degrees: function(x: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      return new RealObject(xObj * 57.29577951308232);
    },
    radians: function(x: BaseObject) {
      const xObj = Math.abs(RealObject.toReal(x, 'x'));
      return new RealObject(xObj * 0.017453292519943295);
    },
  };

  for (const key of Object.keys(functions)) {
    ret.setAttribute(key, getFunctionObject(functions[key], key));
  }

  ret.setAttribute('pi', new RealObject(3.141592653589793));
  ret.setAttribute('e', new RealObject(2.718281828459045));

  return ret;
};
