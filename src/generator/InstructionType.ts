export enum InstructionType {
  CreateFunc = 'CreateFunc', // create function based on definition1 and put it in reg2
  Literal = 'Literal', // loads reg1 with literal2
  Identifier = 'Identifier', // loads reg1 with identifier2
  CreateVarRef = 'CreateVarRef', // creates reference to variable with name identifier1 and puts it into reg2 using scope scope3
  CreateArrayIndexRef = 'CreateArrayIndexRef', // creates reference array item in array reg1[reg2] and puts it in reg3
  CreatePropertyRef = 'CreatePropertyRef', // creates reference to property of object reg1[reg2] and puts it in reg3
  CreateArrayRangeRef = 'CreateArrayRangeRef', // creates reference to array range in array reg1[reg2:reg3:reg5] and puts it in reg6; reg5 can be -1 then it is assumed to be 1
  CopyValue = 'CopyValue', // copies value of reg1 into reg2; both regs can be references, reads/updates reference value then
  AugmentedCopy = 'AugmentedCopy', // calculates value of reg1 instruction3 reg2 and puts result into reg1; this is for operations like a += 10
  ReadObject = 'ReadObject', // reads variable with identifier1 from scope into reg2
  ReadProperty = 'ReadProperty', // reads property identifier1 from value in reg2 and puts it into reg3
  ReadArrayIndex = 'ReadArrayIndex', // reads value from array in reg1 by index reg2 and puts it into reg3
  ReadArrayRange = 'ReadArrayRange', // reads value from array reg1[reg2:reg3:reg5] and puts it into reg6
  Add = 'Add', // reg3 = reg1 + reg2
  Sub = 'Sub', // reg3 = reg1 - reg2
  Mul = 'Mul', // reg3 = reg1 * reg2
  Div = 'Div', // reg3 = reg1 / reg2
  Pow = 'Pow', // reg3 = reg1 ** reg2
  Floor = 'Floor', // reg3 = reg1 // reg2
  Mod = 'Mod', // reg3 = reg1 % reg2
  At = 'At', // reg3 = reg1 @ reg2
  Shl = 'Shl', // reg3 = reg1 << reg2
  Shr = 'Shr', // reg3 = reg1 >> reg2
  BinAnd = 'BinAnd', // reg3 = reg1 & reg2
  BinOr = 'BinOr', // reg3 = reg1 | reg2
  BinXor = 'BinXor', // reg3 = reg1 ^ reg2
  BinInv = 'BinInv', // reg2 = ~reg1
  Label = 'Label', // marks this as jump label with id1
  Condition = 'Condition', // if reg1 is false jumps to label2
  Less = 'Less', // reg3 = reg1 < reg2
  Greater = 'Greater', // reg3 = reg1 > reg2
  LessEq = 'LessEq', // reg3 = reg1 <= reg2
  GreaterEq = 'GreaterEq', // reg3 = reg1 >= reg2
  Equal = 'Equal', // reg3 = reg1 == reg2
  NotEq = 'NotEq', // reg3 = reg1 != reg2
  Is = 'Is', // reg3 = reg1 is reg2
  IsNot = 'IsNot', // reg3 = reg1 is not reg2
  In = 'In', // reg3 = reg1 in reg2
  NotIn = 'NotIn', // reg3 = reg1 not in reg2
  RegArg = 'RegArg', // sets reg1 as argument with index2, expand if arg3 !== 0
  RegArgName = 'RegArgName', // sets reg1 as named argument with identifier2
  CallFunc = 'CallFunc', // calls function reg1(arg1, arg2, arg3, ...) and places result into reg2
  CallMethod = 'CallMethod', // calls method reg1.reg2(arg1, rg2, arg3, ...) and places result into reg3
  Ret = 'Ret', // returns from function call with value in reg1; returns empty if reg1 = -1
  Raise = 'Raise', // raises exception with value in reg1; if reg1 == -1 then re-raise the exception (only inside of except... block)
  GetBool = 'GetBool', // takes reg1, calculates bool value based on it ant puts into reg2
  LogicalNot = 'LogicalNot', // applies logical not to reg1 and puts result in reg2
  LogicalAnd = 'LogicalAnd', // if reg1 is false puts false in reg2 and skips next count3 instructions
  LogicalOr = 'LogicalOr', // if reg1 is true puts true in reg2 and skips next count3 instructions
  Pass = 'Pass', // nothing to do
  Invert = 'Invert', // calculates (-reg1) and puts into reg2
  List = 'List', // creates list and puts it into reg1
  ListAdd = 'ListAdd', // puts reg1 into list in reg2
  Tuple = 'Tuple', // creates tuple and puts it into reg1
  TupleAdd = 'TupleAdd', // puts reg1 into tuple in reg2; in case reg1 is a reference it puts reference, not value, into the tuple
  Set = 'Set', // creates set and puts it into reg1
  SetAdd = 'SetAdd', // puts reg1 into set in reg2
  Dictionary = 'Dictionary', // creates dictionary and puts it into reg1
  DictionaryAdd = 'DictionaryAdd', // puts value reg1 and key identifier2 into dictionary in reg3
  ForCycle = 'ForCycle', // iterates values, exits on label1, jumps to label2 (if not -1) if no break is called during cycle execution
  WhileCycle = 'WhileCycle', // starts while cycle; exits on label1; used for continue/break logic only
  GoTo = 'GoTo', // jumps to label1
  Import = 'Import', // imports module identifier1
  ImportAs = 'ImportAs', // imports module identifier1 as identifier2
  ImportFrom = 'ImportFrom', // imports function identifier1 from module identifier2
  EnterTry = 'EnterTry', // starts try section, checks list starts with count1 instructions forward
  EnterFinally = 'EnterFinally', // means current finally section should not be taken into account when handling finally/raise cases
  EnterExcept = 'EnterExcept', // means current except section should not be taken into account when handling finally/raise cases; if arg1 !== -1 declares local variable id1 with exception contents
  GotoExcept = 'GotoExcept', // starts except block for class identifier1 from label2; identifier1 can be -1 - in this case all exceptions are caught
  GotoFinally = 'GotoFinally', // indicates finally block to start on label1
  LeaveTry = 'LeaveTry', // ends try section
  LeaveFinally = 'LeaveFinally', // ends finally section
  LeaveCycle = 'LeaveCycle', // ends cycle (while/for)
  Continue = 'Continue', // continues to next cycle iteration
  Break = 'Break', // breaks current cycle
  Bool = 'Bool', // creates boolean value1 and puts it into reg2
  None = 'None', // creates none value and puts it into reg1
  Del = 'Del', // deletes property identifier2 of reg1
  Yield = 'Yield', // generates yield generator, returns reg1
}
