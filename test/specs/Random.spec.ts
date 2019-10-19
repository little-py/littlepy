import { PythonRandom } from '../../src/machine/embedded/Random';
import {ListObject} from "../../src/machine/objects/ListObject";
import {NumberObject} from "../../src/machine/objects/NumberObject";

describe('Random', () => {
  it('random()', () => {
    const random = new PythonRandom(() => 0.5);
    expect(random.random()).toEqual(0.5);
  });

  it('uniform()', () => {
    const random = new PythonRandom(() => 0.2);
    expect(random.uniform(2, 8)).toEqual(3.2);
  });

  it('randrange()', () => {
    const random = new PythonRandom(() => 0.3);
    expect(random.randrange(10, 20, 2)).toEqual(12);
    expect(random.randrange(30, 15, -3)).toEqual(27);
  });

  it('randint()', () => {
    const random = new PythonRandom(() => 0.9);
    expect(random.randint(10, 15)).toEqual(15);
    expect(random.randrange(10, 15, 1)).toEqual(14);
  });

  it('choice()', () => {
    const random = new PythonRandom(() => 0.3);
    const list = new ListObject();
    for (let i = 0; i < 10; i++) {
      list.addItem(new NumberObject(i));
    }
    const choice = random.choice(list);
    expect(choice instanceof NumberObject && choice.value).toEqual(3);
  })
});
