import { createMathModule } from './Math';
import { ModuleObject } from '../objects/ModuleObject';

export const embeddedModules: { [key: string]: () => ModuleObject } = {
  math: createMathModule,
};
