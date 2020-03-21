import { CodeGenerator } from './CodeGenerator';

export interface CompileOptions {
  wrapWithPrint?: boolean;
  preserveTokens?: boolean;
  codeGenerator?: CodeGenerator;
}
