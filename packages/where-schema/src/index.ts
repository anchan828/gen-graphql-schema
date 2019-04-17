import { DocumentNode } from 'graphql';
import { GenWhereTypesOptions } from './options';
import { GenWhereTypesService } from './service';
export { GenWhereTypesOptions } from './options';
export const genWhereTypes = (
  types: string | DocumentNode,
  options?: GenWhereTypesOptions,
): DocumentNode => {
  return new GenWhereTypesService(types, options!).genWhereTypes();
};
