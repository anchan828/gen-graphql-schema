import { GenOrderTypesOptions } from './options';

const ORDER_BY = 'orderBy';
const ORDER_BY_IGNORE = 'orderBy_ignore';
const ORDER_ENUM_TYPE_SUFFIX = 'Order';

export const DEFAULT_OPTIONS: GenOrderTypesOptions = {
  orderByDirectiveName: ORDER_BY,
  orderByIgnoreDirectiveName: ORDER_BY_IGNORE,
  orderByArgumentName: ORDER_BY,
  orderEnumTypeSuffix: ORDER_ENUM_TYPE_SUFFIX,
  orderByArgumentTypeIsList: true,
  supportOrderableTypes: [],
};
