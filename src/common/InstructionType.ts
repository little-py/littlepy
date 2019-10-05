export enum InstructionType {
  ICreateFunc, // create function based on definition1 and put it in reg2
  ILiteral, // loads reg1 with literal2
  IIdentifier, // loads reg1 with identifier2
  ICreateVarRef, // creates reference to variable with name identifier1 and puts it into reg2 using scope scope3
  ICreateArrayIndexRef, // creates reference array item in array reg1[reg2] and puts it in reg3
  ICreatePropertyRef, // creates reference to property of object reg1[reg2] and puts it in reg3
  ICopyValue, // copies value of reg1 into reg2; both regs can be references, reads/updates reference value then
  IAugmentedCopy, // calculates value of reg1 instruction3 reg2 and puts result into reg1; this is for operations like a += 10
  IReadObject, // reads variable with identifier1 from scope into reg2
  IReadProperty, // reads property identifier1 from value in reg2 and puts it into reg3
  IReadArrayIndex, // reads value from array in reg1 by index reg2 and puts it into reg3
  IAdd, // reg3 = reg1 + reg2
  ISub, // reg3 = reg1 - reg2
  IMul, // reg3 = reg1 * reg2
  IDiv, // reg3 = reg1 / reg2
  IPow, // reg3 = reg1 ** reg2
  IFloor, // reg3 = reg1 // reg2
  IMod, // reg3 = reg1 % reg2
  IAt, // reg3 = reg1 @ reg2
  IShl, // reg3 = reg1 << reg2
  IShr, // reg3 = reg1 >> reg2
  IBinAnd, // reg3 = reg1 & reg2
  IBinOr, // reg3 = reg1 | reg2
  IBinXor, // reg3 = reg1 ^ reg2
  IBinInv, // reg2 = ~reg1
  ILabel, // marks this as jump label with id1
  ICondition, // if reg1 is false jumps to label2
  ILess, // reg3 = reg1 < reg2
  IGreater, // reg3 = reg1 > reg2
  ILessEq, // reg3 = reg1 <= reg2
  IGreaterEq, // reg3 = reg1 >= reg2
  IEqual, // reg3 = reg1 == reg2
  INotEq, // reg3 = reg1 != reg2
  IIs, // reg3 = reg1 is reg2
  IIsNot, // reg3 = reg1 is not reg2
  IIn, // reg3 = reg1 in reg2
  INotIn, // reg3 = reg1 not in reg2
  IRegArg, // sets reg1 as argument with index2, expand if arg3 !== 0
  IRegArgName, // sets reg1 as named argument with identifier2
  ICallFunc, // calls function reg1(arg1, arg2, arg3, ...) and places result into reg2
  ICallMethod, // calls method reg1.reg2(arg1, rg2, arg3, ...) and places result into reg3
  IRet, // returns from function call with value in reg1; returns empty if reg1 = -1
  IRaise, // raises exception with value in reg1; if reg1 == -1 then re-raise the exception (only inside of except... block)
  // ISeqNext, // takes next sequence item from reg1 and puts result in reg2; puts 1 into reg3 if there is next value; puts 0 otherwise
  IGetBool, // takes reg1, calculates bool value based on it ant puts into reg2
  ILogicalNot, // applies logical not to reg1 and puts result in reg2
  ILogicalAnd, // if reg1 is false puts false in reg2 otherwise skips next count3 instructions
  ILogicalOr, // if reg1 is true puts true in reg2 otherwise skips next count3 instructions
  IPass, // nothing to do
  IInvert, // calculates (-reg1) and puts into reg2
  IList, // creates list and puts it into reg1
  IListAdd, // puts reg1 into list in reg2
  ITuple, // creates tuple and puts it into reg1
  ITupleAdd, // puts reg1 into tuple in reg2; in case reg1 is a reference it puts reference, not value, into the tuple
  ISet, // creates set and puts it into reg1
  ISetAdd, // puts reg1 into set in reg2
  IDictionary, // creates dictionary and puts it into reg1
  IDictionaryAdd, // puts value reg1 and key identifier2 into dictionary in reg3
  IForCycle, // iterates values, exits on label1, jumps to label2 (if not -1) if no break is called during cycle execution
  IWhileCycle, // starts while cycle; exits on label1; used for continue/break logic only
  IGoTo, // jumps to label1
  IImport, // imports module identifier1
  IImportAs, // imports module identifier1 as identifier2
  IImportFrom, // imports function identifier1 from module identifier2
  IEnterTry, // starts try section, checks list starts with count1 instructions forward
  IEnterFinally, // means current finally section should not be taken into account when handling finally/raise cases
  IEnterExcept, // means current except section should not be taken into account when handling finally/raise cases; if reg1 !== -1 declares local variable id1 with exception contents
  IGotoExcept, // starts except block for class identifier1 from label2; identifier1 can be -1 - in this case all exceptions are caught
  IGotoFinally, // indicates finally block to start on label1
  ILeaveTry, // ends try section
  ILeaveFinally, // ends finally section
  ILeaveCycle, // ends cycle (while/for)
  IContinue, // continues to next cycle iteration
  IBreak, // breaks current cycle
  IBool, // creates boolean value1 and puts it into reg2
  INone, // creates none value and puts it into reg1
  IDel, // deletes property identifier2 of reg1
  IYield, // generates yield generator, returns reg1
}
