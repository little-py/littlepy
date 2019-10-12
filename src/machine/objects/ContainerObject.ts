import { IterableObject } from './IterableObject';
import { PyObject } from '../../api/Object';

export abstract class ContainerObject extends IterableObject {
  abstract contains(value: PyObject): boolean;
}
