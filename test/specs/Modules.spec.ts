import { compileModule, runModules } from './Utils';

describe('modules', () => {
  const math = compileModule(
    `
      import support
      def calculate(arg1, arg2):
        val = support.something(arg1)
        print(val)
        print(arg2)
    `,
    'math',
  );
  const support = compileModule(
    `
      def something(param):
        print('param: ' + param)
        return param + ' - support'
    `,
    'support',
  );
  function run(code: string, expected: string[]) {
    const main = compileModule(code, 'main');
    expect(main.errors).toHaveLength(0);
    expect(math.errors).toHaveLength(0);
    expect(support.errors).toHaveLength(0);
    const output = runModules(
      {
        main,
        math,
        support,
      },
      'main',
    );
    expect(output.getOutput()).toEqual(expected);
  }

  it('should load module and its submodule with default syntax', () => {
    run(
      `
      import math
      import support
      math.calculate('arg1', 'arg2')
    `,
      ['param: arg1', 'arg1 - support', 'arg2'],
    );
  });

  it('should load module and change its name', () => {
    run(
      `
      import math as myth
      myth.calculate('arg1', 'arg2')
    `,
      ['param: arg1', 'arg1 - support', 'arg2'],
    );
  });

  it('should import only one function from module', () => {
    run(
      `
      from math import calculate
      calculate('arg1', 'arg2')
    `,
      ['param: arg1', 'arg1 - support', 'arg2'],
    );
  });
});
