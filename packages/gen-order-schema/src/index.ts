import { DocumentNode } from 'graphql';
import { GenOrderTypesOptions } from './options';
import { GenOrderTypesService } from './service';

export const genOrderTypes = (
  types: string | DocumentNode,
  options?: GenOrderTypesOptions,
): string => {
  return new GenOrderTypesService(types, options!).genOrderTypes();
};
