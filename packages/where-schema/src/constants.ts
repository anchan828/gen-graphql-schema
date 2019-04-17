import { GenWhereTypesOptions } from './options';

export const DEFAULT_OPTIONS: GenWhereTypesOptions = {
  whereDirective: { name: 'where' },
  whereIgnoreDirective: { name: 'where_ignore' },
  whereType: { prefix: '', suffix: 'Where' },
  whereArgment: { name: 'where' },
  whereOperatorType: {
    prefix: '',
    suffix: 'WhereOperatorType',
  },
  whereOperator: {
    prefix: '',
    suffix: 'WhereOperator',
  },
  enumTypeOperator: ['eq', 'not_eq', 'in', 'not_in'],
  supportOperatorTypes: {
    String: ['starts_with', 'ends_with', 'eq', 'not_eq', 'in', 'not_in'],
    Int: ['eq', 'not_eq', 'in', 'not_in', 'lt', 'lte', 'gt', 'gte'],
    Float: ['eq', 'not_eq', 'in', 'not_in', 'lt', 'lte', 'gt', 'gte'],
    ID: ['eq', 'not_eq', 'in', 'not_in'],
  },
};
