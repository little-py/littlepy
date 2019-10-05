import { BaseObject } from '../objects/BaseObject';
import { IntegerObject } from '../objects/IntegerObject';
import { IterableObject } from '../objects/IterableObject';
import { ExceptionObject } from '../objects/ExceptionObject';
import { ExceptionType } from '../../api/ExceptionType';

class RangeObject extends IterableObject {
  private readonly items: number[];

  constructor(items: number[]) {
    super();
    this.items = items;
  }

  getCount(): number {
    return this.items.length;
  }

  getItem(index: number | string): BaseObject {
    return new IntegerObject(this.items[index]);
  }
}

export function range(startObject: BaseObject, endObject: BaseObject, stepObject: BaseObject): BaseObject {
  let step: number;
  if (!stepObject) {
    step = 1;
  } else {
    if (!stepObject.canBeInteger()) {
      throw new ExceptionObject(ExceptionType.TypeError, [], 'step');
    }
    step = stepObject.toInteger();
    if (step === 0) {
      throw new ExceptionObject(ExceptionType.FunctionArgumentError);
    }
  }
  if (!startObject || !startObject.canBeInteger()) {
    throw new ExceptionObject(ExceptionType.TypeError, [], 'start');
  }
  let start = startObject.toInteger();
  let end: number;
  if (endObject === undefined) {
    end = start;
    start = 0;
  } else {
    if (!endObject || !endObject.canBeInteger()) {
      throw new ExceptionObject(ExceptionType.TypeError, [], 'end');
    }
    end = endObject.toInteger();
  }
  // TODO: should be dynamically generated sequence
  const items: number[] = [];
  if (step < 0) {
    for (let i = start; i > end; i += step) {
      items.push(i);
    }
  } else {
    for (let i = start; i < end; i += step) {
      items.push(i);
    }
  }
  return new RangeObject(items);
}
