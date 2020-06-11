import { createNativeModule } from './Utils';
import { pyFunction, pyParam } from '../../api/Decorators';
import { PropertyType } from '../../api/Native';
import { IterableObject } from '../objects/IterableObject';
import { PyObject } from '../../api/Object';
import { ModuleObject } from '../objects/ModuleObject';

export class PythonRandom {
  private readonly _random: () => number;

  constructor(random: () => number = Math.random) {
    this._random = random;
  }

  @pyFunction
  random(): number {
    return this._random();
  }

  @pyFunction
  uniform(@pyParam('a', PropertyType.Number) a: number, @pyParam('b', PropertyType.Number) b: number): number {
    if (a > b) {
      const t = a;
      a = b;
      b = t;
    }
    const r = this.random();
    return a + r * (b - a);
  }

  @pyFunction
  randrange(
    @pyParam('start', PropertyType.Number) start: number,
    @pyParam('stop', PropertyType.Number, -1) stop: number,
    @pyParam('step', PropertyType.Number, 1) step: number,
  ): number {
    if (stop === -1) {
      stop = start;
      start = 0;
    }
    const count = Math.floor((stop - start) / step);
    const value = Math.floor(this.random() * count);
    return start + value * step;
  }

  @pyFunction
  randint(@pyParam('a', PropertyType.Number) a: number, @pyParam('b', PropertyType.Number) b: number): number {
    return this.randrange(a, b + 1, 1);
  }

  @pyFunction
  choice(@pyParam('seq', PropertyType.Iterable) seq: IterableObject): PyObject {
    return seq.getItem(this.randrange(0, seq.getCount(), 1));
  }
}

const pythonRandom = new PythonRandom();

export function createRandomModule(): ModuleObject {
  return createNativeModule(pythonRandom, 'random');
}
