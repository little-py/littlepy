import { ModuleObject } from '../objects/ModuleObject';
import { createMathModule } from './Math';
import { createRandomModule } from './Random';

export const embeddedModules: { [key: string]: () => ModuleObject } = {
  math: createMathModule,
  random: createRandomModule,
};
