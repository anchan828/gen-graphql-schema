import { GenOrderTypesOptions } from './options';

export const DESCRIPTIONS = {
  OEDER_DIRECTION: {
    TYPE: 'Sort the results in ascending or descending order',
    ASC: 'Sort the results in ascending order',
    DESC: 'Sort the results in descending order',
  },
  ORDER: {
    TYPE: (typeName: string) => `Ordering options for ${typeName}`,
    FIELD: (typeName: string) => `The field to order ${typeName} by.`,
    DIRECTION: `The ordering direction.`,
  },
  ORDER_FIELD: {
    ENUM: (typeName: string) =>
      `Properties by which ${typeName} can be ordered.`,
    VALUE: (typeName: string, fieldName: string) =>
      `Order ${typeName} by ${fieldName}`,
  },
};

export const DEFAULT_OPTIONS: GenOrderTypesOptions = {
  orderByDirective: {
    name: 'orderBy',
  },
  orderByIgnoreDirective: {
    name: 'orderBy_ignore',
  },
  orderDirection: {
    typeName: `OrderDirection`,
    ascName: 'ASC',
    descName: 'DESC',
  },
  orderByArgument: {
    name: 'orderBy',
    isList: true,
  },
  orderType: {
    prefix: '',
    suffix: 'Order',
    fieldName: 'field',
    directionName: 'direction',
  },
  orderFieldEnum: {
    prefix: '',
    suffix: 'OrderField',
  },
  supportOrderableTypes: [],
};
