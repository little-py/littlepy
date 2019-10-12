import SCENARIOS, { TestScenario } from './Scenarios';
import { compileModule, runModules } from './Utils';

describe('compiler and machine tests', () => {
  const onlyThis = SCENARIOS.filter(s => s.onlyThis);
  let scenarios: TestScenario[];
  if (onlyThis.length) {
    scenarios = onlyThis;
  } else {
    scenarios = SCENARIOS;
  }

  for (const { input, output, expectedException, exceptionArgs, expectedCompilerError } of scenarios) {
    const match = input.replace(/[\s\r\n\t]*$/, '');
    const signature = match || 'empty line';
    it(signature, () => {
      const code = compileModule(input, 'main');
      if (expectedCompilerError !== undefined) {
        if (code.errors.findIndex(e => e.type === expectedCompilerError) < 0) {
          expect(code.errors.map(e => e.type)).toEqual([expectedCompilerError]);
        }
        return;
      } else {
        expect(code.errors).toHaveLength(0);
      }
      const result = runModules(
        {
          main: code,
        },
        'main',
      );
      const exception = result.getUnhandledException();
      if (expectedException !== undefined) {
        expect(exception && exception.exceptionType).toEqual(expectedException);
        if (exceptionArgs) {
          expect(exception.params).toEqual(exceptionArgs);
        }
      } else {
        expect(exception).toBeFalsy();
      }
      if (output && !exception) {
        expect(result.getOutput()).toEqual(output);
      }
    });
  }
});
