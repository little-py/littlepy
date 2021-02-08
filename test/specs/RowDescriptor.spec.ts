import { OperatorType } from '../../src/api/Token';
import { compileModuleAndRows } from './Utils';

describe('Row Descriptor', () => {
  it('should generate information about all referenced variables', () => {
    const { rows } = compileModuleAndRows(`
      first = 10
      second = first + 5
    `, 'main');
    expect(rows[0].modifiedVariables).toEqual(['first']);
    expect(rows[1].modifiedVariables).toEqual(['second']);
    expect(rows[1].referencedVariables).toEqual(['second', 'first'])
    expect(rows[1].usedOperators).toEqual([OperatorType.Plus]);
  });
});
