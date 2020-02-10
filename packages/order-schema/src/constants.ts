import { GenOrderTypesOptions } from "./interfaces";

export const DESCRIPTIONS = {
  OEDER_DIRECTION: {
    TYPE: "Sort the results in ascending or descending order",
    ASC: "Sort the results in ascending order",
    DESC: "Sort the results in descending order",
  },
  ORDER_TYPE: {
    TYPE: (typeName: string): string => `Ordering options for ${typeName}`,
    FIELDS: (typeName: string, fieldName: string): string => `Order ${typeName} by ${fieldName}`,
  },
};

export const DEFAULT_OPTIONS: GenOrderTypesOptions = {
  orderByDirective: { name: "orderBy" },
  orderByIgnoreDirective: { name: "orderBy_ignore" },
  orderType: { prefix: "", suffix: "Order" },
  orderByArgument: { name: "orderBy", isList: true },
  orderDirection: {
    typeName: `OrderDirection`,
    ascName: "ASC",
    descName: "DESC",
  },
  supportOrderableTypes: [],
};
