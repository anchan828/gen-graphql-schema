export interface GenOrderTypesOptions {
  orderByDirective?: { name?: string };
  orderByIgnoreDirective?: { name?: string };
  orderDirection?: { typeName?: string; ascName?: string; descName?: string };
  orderByArgument?: { name?: string; isList?: boolean };
  orderType?: {
    prefix?: string;
    suffix?: string;
    sortName?: string;
    directionName?: string;
  };
  sortEnum?: { prefix?: string; suffix?: string };
  supportOrderableTypes?: string[];
}
