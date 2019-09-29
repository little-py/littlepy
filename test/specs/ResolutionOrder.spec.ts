import { ClassInheritance, ClassObject } from '../../../src/machine/objects/ClassObject';
import { calculateResolutionOrder } from '../../../src/machine/CalculateResolutionOrder';

describe('resolution order', () => {
  it('basic', () => {
    const O = new ClassObject([]);
    O.name = 'O';
    const A = new ClassObject([new ClassInheritance('O', O)]);
    A.name = 'A';
    const B = new ClassObject([new ClassInheritance('O', O)]);
    B.name = 'B';
    const C = new ClassObject([new ClassInheritance('A', A), new ClassInheritance('B', B)]);
    C.name = 'C';
    const order = calculateResolutionOrder(new ClassInheritance('C', C)).map(o => o.name);
    expect(order).toEqual(['C', 'A', 'B', 'O']);
  });
  it('wrong', () => {
    const O = new ClassObject([]);
    O.name = 'O';
    const X = new ClassObject([new ClassInheritance('O', O)]);
    X.name = 'X';
    const Y = new ClassObject([new ClassInheritance('O', O)]);
    Y.name = 'Y';
    const A = new ClassObject([new ClassInheritance('X', X), new ClassInheritance('Y', Y)]);
    A.name = 'A';
    const B = new ClassObject([new ClassInheritance('Y', Y), new ClassInheritance('X', X)]);
    B.name = 'B';
    const C = new ClassObject([new ClassInheritance('A', A), new ClassInheritance('B', B)]);
    C.name = 'C';
    const order = calculateResolutionOrder(new ClassInheritance('C', C));
    expect(order).toBeNull();
  });
  it('correct', () => {
    const O = new ClassObject([]);
    O.name = 'O';
    const X = new ClassObject([new ClassInheritance('O', O)]);
    X.name = 'X';
    const Y = new ClassObject([new ClassInheritance('O', O)]);
    Y.name = 'Y';
    const A = new ClassObject([new ClassInheritance('X', X)]);
    A.name = 'A';
    const B = new ClassObject([new ClassInheritance('Y', Y), new ClassInheritance('X', X)]);
    B.name = 'B';
    const C = new ClassObject([new ClassInheritance('A', A), new ClassInheritance('B', B)]);
    C.name = 'C';
    const order = calculateResolutionOrder(new ClassInheritance('C', C)).map(o => o.name);
    expect(order).toEqual(['C', 'A', 'B', 'Y', 'X', 'O']);
  });
  it('complex', () => {
    const O = new ClassObject([]);
    O.name = 'O';
    const F = new ClassObject([new ClassInheritance('O', O)]);
    F.name = 'F';
    const E = new ClassObject([new ClassInheritance('O', O)]);
    E.name = 'E';
    const D = new ClassObject([new ClassInheritance('O', O)]);
    D.name = 'D';
    const C = new ClassObject([new ClassInheritance('D', D), new ClassInheritance('F', F)]);
    C.name = 'C';
    const B = new ClassObject([new ClassInheritance('D', D), new ClassInheritance('E', E)]);
    B.name = 'B';
    const A = new ClassObject([new ClassInheritance('B', B), new ClassInheritance('C', C)]);
    A.name = 'A';
    const order = calculateResolutionOrder(new ClassInheritance('A', A)).map(o => o.name);
    expect(order).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'O']);
  });
});
