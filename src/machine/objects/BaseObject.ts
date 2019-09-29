export enum ObjectType {
  Object,
  None,
  Integer,
  Boolean,
  Real,
  Complex,
  String,
  Tuple,
  List,
  Bytes,
  ByteArray,
  Set,
  FrozenSet,
  Dictionary,
  Function,
  Class,
  ClassInstance,
  InstanceMethod,
  Module,
  ObjectWrapper,
  GameWrapper,
  Reference,
  SuperProxy,
  Iterator,
  Generator,
  ExceptionClass,
  ExceptionInstance,
}

export class BaseObject {
  private static idCounter = 1;

  public constructor(t: ObjectType) {
    this.type = t;
  }

  public isCallable() {
    return false;
  }

  public isContainer(): boolean {
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public contains(value: BaseObject): boolean {
    return false;
  }

  public count(): number {
    return 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getItem(index: number): BaseObject {
    return null;
  }

  public toBoolean() {
    return true;
  }

  public canBeInteger(): boolean {
    return false;
  }

  public canBeReal(): boolean {
    return false;
  }

  public toInteger(): number {
    return 0;
  }

  public toReal(): number {
    return 0;
  }

  public toString(): string {
    return '(object)';
  }

  public readonly type: ObjectType;
  protected attributes: { [key: string]: BaseObject } = {};
  public id: number = BaseObject.idCounter++;
  public name: string;

  public getAttribute(name: string): BaseObject {
    return this.attributes[name];
  }

  public setAttribute(name: string, value: BaseObject) {
    this.attributes[name] = value;
  }

  public deleteAttribute(name: string) {
    delete this.attributes[name];
  }
}
