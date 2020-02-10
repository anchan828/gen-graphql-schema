import { GenWhereTypesOptions } from "./interfaces";
export const DESCRIPTIONS = {
  WHERE_OPERATOR_TYPE: {
    TYPE: (typeName: string): string => `Query type of ${typeName} with using operators`,
    OPERATORS: {
      STARTS_WITH: "Must match the string starts with the given data exactly",
      ENDS_WITH: "Must match the string ends with the given data exactly",
      EQ: "Must match the given data exactly",
      NOT_EQ: "Must be different from the given data",
      CONTAINS: "Determines whether the given string may be found within another string.",
      IN: "Must be an element of the array",
      NOT_IN: "Must not be an element of the array",
      LT: "Must be less than given value",
      LTE: "Must be less than or equal to given value",
      GT: "Must be greater than given value",
      GTE: "Must be greater than or equal to given value",
    },
  },
  WHERE_OPERATOR: {
    TYPE: (typeName: string): string => `${typeName} query with using operators`,
    FIELDS: {
      TYPE: (typeName: string): string => `Query type of ${typeName} with using operators`,
      VALUE: (typeName: string): string => `Query value of ${typeName}`,
    },
  },
  WHERE_TYPE: {
    TYPE: (typeName: string): string => `Query of ${typeName} with using operators`,
    FIELDS: (fieldName: string): string => `Query with using ${fieldName} field`,
  },
};
export const DEFAULT_OPTIONS: GenWhereTypesOptions = {
  whereDirective: { name: "where" },
  whereIgnoreDirective: { name: "where_ignore" },
  whereEqOnlyDirective: { name: "where_eq_only" },
  whereType: { prefix: "", suffix: "Where" },
  whereArgument: { name: "where" },
  whereOperatorType: {
    prefix: "",
    suffix: "WhereOperatorType",
  },
  whereOperator: {
    prefix: "",
    suffix: "WhereOperator",
  },
  enumTypeOperator: ["eq", "not_eq", "in", "not_in"],
  supportOperatorTypes: {
    String: ["starts_with", "ends_with", "eq", "not_eq", "contains", "in", "not_in"],
    Int: ["eq", "not_eq", "in", "not_in", "lt", "lte", "gt", "gte"],
    Float: ["eq", "not_eq", "in", "not_in", "lt", "lte", "gt", "gte"],
    ID: ["eq", "not_eq", "in", "not_in"],
  },
};
