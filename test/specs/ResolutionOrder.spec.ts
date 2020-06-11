import { calculateResolutionOrder } from '../../src/machine/CalculateResolutionOrder';
import { PyClass, PyInheritance } from '../../src/api/Class';

describe('resolution order', () => {
  it('basic', () => {
    const O = new PyClass(null, null, []);
    O.name = 'O';
    const A = new PyClass(null, null, [new PyInheritance('O', O)]);
    A.name = 'A';
    const B = new PyClass(null, null, [new PyInheritance('O', O)]);
    B.name = 'B';
    const C = new PyClass(null, null, [new PyInheritance('A', A), new PyInheritance('B', B)]);
    C.name = 'C';
    const order = calculateResolutionOrder(new PyInheritance('C', C)).map((o) => o.name);
    expect(order).toEqual(['C', 'A', 'B', 'O']);
  });
  it('wrong', () => {
    const O = new PyClass(null, null, []);
    O.name = 'O';
    const X = new PyClass(null, null, [new PyInheritance('O', O)]);
    X.name = 'X';
    const Y = new PyClass(null, null, [new PyInheritance('O', O)]);
    Y.name = 'Y';
    const A = new PyClass(null, null, [new PyInheritance('X', X), new PyInheritance('Y', Y)]);
    A.name = 'A';
    const B = new PyClass(null, null, [new PyInheritance('Y', Y), new PyInheritance('X', X)]);
    B.name = 'B';
    const C = new PyClass(null, null, [new PyInheritance('A', A), new PyInheritance('B', B)]);
    C.name = 'C';
    const order = calculateResolutionOrder(new PyInheritance('C', C));
    expect(order).toBeNull();
  });
  it('correct', () => {
    const O = new PyClass(null, null, []);
    O.name = 'O';
    const X = new PyClass(null, null, [new PyInheritance('O', O)]);
    X.name = 'X';
    const Y = new PyClass(null, null, [new PyInheritance('O', O)]);
    Y.name = 'Y';
    const A = new PyClass(null, null, [new PyInheritance('X', X)]);
    A.name = 'A';
    const B = new PyClass(null, null, [new PyInheritance('Y', Y), new PyInheritance('X', X)]);
    B.name = 'B';
    const C = new PyClass(null, null, [new PyInheritance('A', A), new PyInheritance('B', B)]);
    C.name = 'C';
    const order = calculateResolutionOrder(new PyInheritance('C', C)).map((o) => o.name);
    expect(order).toEqual(['C', 'A', 'B', 'Y', 'X', 'O']);
  });
  it('complex', () => {
    const O = new PyClass(null, null, []);
    O.name = 'O';
    const F = new PyClass(null, null, [new PyInheritance('O', O)]);
    F.name = 'F';
    const E = new PyClass(null, null, [new PyInheritance('O', O)]);
    E.name = 'E';
    const D = new PyClass(null, null, [new PyInheritance('O', O)]);
    D.name = 'D';
    const C = new PyClass(null, null, [new PyInheritance('D', D), new PyInheritance('F', F)]);
    C.name = 'C';
    const B = new PyClass(null, null, [new PyInheritance('D', D), new PyInheritance('E', E)]);
    B.name = 'B';
    const A = new PyClass(null, null, [new PyInheritance('B', B), new PyInheritance('C', C)]);
    A.name = 'A';
    const order = calculateResolutionOrder(new PyInheritance('A', A)).map((o) => o.name);
    expect(order).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'O']);
  });
});
