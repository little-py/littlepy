import { InstructionType } from '../../src/common/InstructionType';
import { Instruction } from '../../src/common/Instructions';

describe('Instructions', () => {
  it('ensure that every instruction is handled', () => {
    for (const id of Object.keys(InstructionType)) {
      const instruction = new Instruction(InstructionType[id], null, 0, 0);
      if (instruction.shiftRight(1)) {
        continue;
      }
      expect(id).toEqual('');
    }
    const bad = new Instruction('bad' as InstructionType, null, 0, 0);
    expect(bad.shiftRight(1)).toEqual(false);
  });
});
