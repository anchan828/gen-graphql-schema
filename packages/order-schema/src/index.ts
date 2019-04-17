import { DocumentNode } from 'graphql';
import { GenOrderTypesOptions } from './options';
import { GenOrderTypesService } from './service';
export { GenOrderTypesOptions } from './options';
export const genOrderTypes = (
  types: string | DocumentNode,
  options?: GenOrderTypesOptions,
): DocumentNode => {
  return new GenOrderTypesService(types, options!).genOrderTypes();
};
