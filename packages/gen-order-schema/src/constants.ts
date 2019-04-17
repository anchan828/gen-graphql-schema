import { GenOrderTypesOptions } from './options';

const ORDER_BY_DIRECTIVE = {
  name: 'orderBy',
};
const ORDER_BY_IGNORE_DIRECTIVE = {
  name: 'orderBy_ignore',
};
const ORDER_BY_ARGUMENT = {
  name: 'orderBy',
  isList: true,
};

const ORDER_DIRECTION_ENUM = {
  typeName: `OrderDirection`,
  ascName: 'ASC',
  descName: 'DESC',
};

const ORDER_TYPE = {
  prefix: '',
  suffix: 'Order',
  sortName: 'sort',
  directionName: 'direction',
};

const SORT_ENUM = {
  prefix: '',
  suffix: 'Sort',
};

export const DEFAULT_OPTIONS: GenOrderTypesOptions = {
  orderByDirective: ORDER_BY_DIRECTIVE,
  orderByIgnoreDirective: ORDER_BY_IGNORE_DIRECTIVE,
  orderDirection: ORDER_DIRECTION_ENUM,
  orderByArgument: ORDER_BY_ARGUMENT,
  orderType: ORDER_TYPE,
  sortEnum: SORT_ENUM,
  supportOrderableTypes: [],
};
