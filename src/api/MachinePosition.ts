import { PyModule } from './Module';
import { PyFunction } from './Function';

export class PyMachinePosition {
  module: PyModule;
  func: PyFunction;
  column: number;
  row: number;
  position: number;
}
