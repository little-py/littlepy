import { IterableObject } from './IterableObject';
import { BaseObject } from './BaseObject';

export abstract class ContainerObject extends IterableObject {
  abstract contains(value: BaseObject): boolean;
}
