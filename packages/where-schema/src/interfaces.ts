export type OperatorType =
  | "starts_with"
  | "ends_with"
  | "eq"
  | "not_eq"
  | "contains"
  | "in"
  | "not_in"
  | "lt"
  | "lte"
  | "gt"
  | "gte"
  | "regex"
  | "glob"
  | "between";
export interface GenWhereTypesOptions {
  whereDirective?: { name?: string };
  whereIgnoreDirective?: { name?: string };

  whereNestedObjectDirective?: { name?: string };

  whereEqOnlyDirective?: { name?: string };
  whereType?: { prefix?: string; suffix?: string };
  whereArgument?: { name?: string };
  whereOperator?: { prefix?: string; suffix?: string };
  enumTypeOperator?: OperatorType[];
  supportOperatorTypes?: {
    String?: OperatorType[];
    Int?: OperatorType[];
    Float?: OperatorType[];
    ID?: OperatorType[];
    [key: string]: OperatorType[] | undefined;
  };
  arrayOperators?: OperatorType[];
  orOperatorName?: string;
}

export interface WhereFieldNameAndType {
  name: string;
  type: string;
  isList: boolean;
  isObject: boolean;
  isEqOnly: boolean;
}
