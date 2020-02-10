export interface GenOrderTypesOptions {
  orderByDirective?: { name?: string };
  orderByIgnoreDirective?: { name?: string };
  orderDirection?: { typeName?: string; ascName?: string; descName?: string };
  orderByArgument?: { name?: string; isList?: boolean };
  orderType?: {
    prefix?: string;
    suffix?: string;
  };
  orderFieldEnum?: { prefix?: string; suffix?: string };

  supportOrderableTypes?: string[];
}

export interface OrderByFieldNameAndType {
  name: string;
  type: string;
  isObject: boolean;
}
