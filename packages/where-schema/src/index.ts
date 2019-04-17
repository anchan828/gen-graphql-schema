import { DocumentNode } from 'graphql';
import { GenWhereTypesOptions } from './options';
import { GenWhereTypesService } from './service';

export const genWhereTypes = (
  types: string | DocumentNode,
  options?: GenWhereTypesOptions,
): string => {
  return new GenWhereTypesService(types, options!).genWhereTypes();
};
