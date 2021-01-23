import SCENARIOS, { TestScenario } from './Scenarios';
import { compileModule, runModules } from './Utils';

describe('compiler and machine tests', () => {
  const onlyThis = SCENARIOS.filter((s) => s.onlyThis);
  let scenarios: TestScenario[];
  if (onlyThis.length) {
    scenarios = onlyThis;
  } else {
    scenarios = SCENARIOS;
  }

  for (const { input, output, raw } of scenarios) {
    const match = input.replace(/[\s\r\n\t]*$/, '');
    const signature = match || 'empty line';
    it(signature, () => {
      const code = compileModule(input, 'main', undefined, raw);
      expect(code.errors).toHaveLength(0);
      const result = runModules(
        {
          main: code,
        },
        'main',
      );
      const exception = result.getUnhandledException();
      expect(exception).toBeFalsy();
      if (output && !exception) {
        expect(result.getOutput()).toEqual(output);
      }
    });
  }
});
