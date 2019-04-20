export interface GenOrderTypesOptions {
  orderByDirective?: { name?: string };
  orderByIgnoreDirective?: { name?: string };
  orderDirection?: { typeName?: string; ascName?: string; descName?: string };
  orderByArgument?: { name?: string; isList?: boolean };
  orderType?: {
    prefix?: string;
    suffix?: string;
    fieldName?: string;
    directionName?: string;
  };
  orderFieldEnum?: { prefix?: string; suffix?: string };
  supportOrderableTypes?: string[];
}
