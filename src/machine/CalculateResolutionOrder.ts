import { ClassInheritance } from './objects/ClassObject';

export function calculateResolutionOrder(classDef: ClassInheritance): ClassInheritance[] {
  if (!classDef.object.inheritsFrom.length) {
    return [classDef];
  }
  let secondLevelList: ClassInheritance[][] = [];
  for (const parent of classDef.object.inheritsFrom) {
    const order = calculateResolutionOrder(parent);
    if (!order) {
      return null;
    }
    secondLevelList.push(order);
  }
  secondLevelList.push(classDef.object.inheritsFrom);
  const ret: ClassInheritance[] = [classDef];
  while (secondLevelList.length > 0) {
    let candidate: ClassInheritance;
    let good = true;
    for (let i = 0; i < secondLevelList.length; i++) {
      good = true;
      candidate = secondLevelList[i][0];
      for (let j = 0; j < secondLevelList.length; j++) {
        const list = secondLevelList[j];
        for (let k = 1; k < list.length; k++) {
          if (list[k].object.id === candidate.object.id) {
            good = false;
            break;
          }
        }
        if (!good) {
          break;
        }
      }
      if (!good) {
        continue;
      }
      for (let j = 0; j < secondLevelList.length; j++) {
        secondLevelList[j] = secondLevelList[j].filter(c => c.object.id !== candidate.object.id);
      }
      secondLevelList = secondLevelList.filter(l => l.length > 0);
      break;
    }
    if (!good || !candidate) {
      return null;
    }
    ret.push(candidate);
  }
  return ret;
}
