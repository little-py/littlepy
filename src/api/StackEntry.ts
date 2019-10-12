import { PyScope } from './Scope';

export interface PyStackEntry {
  readonly scope: PyScope;
  readonly name: string;
  readonly parent: PyStackEntry;
}
