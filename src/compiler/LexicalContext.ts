import { CompiledModule } from './CompiledModule';

export class LexicalContext {
  private readonly compiledCode: CompiledModule;

  public constructor(compiledCode: CompiledModule) {
    this.compiledCode = compiledCode;
  }

  private identifiersKeys: { [key: string]: number } = {};

  public addIdentifier(id: string): number {
    let it = this.identifiersKeys[id];
    if (it !== undefined) {
      return it;
    }
    it = this.compiledCode.identifiers.length;
    this.identifiersKeys[id] = it;
    this.compiledCode.identifiers.push(id);
    return it;
  }
}
