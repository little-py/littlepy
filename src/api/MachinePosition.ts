import { PyModule } from './Module';
import { PyFunction } from './Function';

export interface PyMachinePosition {
  module: PyModule;
  func: PyFunction;
  column: number;
  row: number;
  position: number;
}
