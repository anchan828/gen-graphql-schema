import {
  genOrderTypes,
  GenOrderTypesOptions,
} from '@anchan828/gen-graphql-order-schema';
import {
  genRelayTypes,
  GenRelayTypesOptions,
} from '@anchan828/gen-graphql-relay-schema';
import {
  genWhereTypes,
  GenWhereTypesOptions,
} from '@anchan828/gen-graphql-where-schema';
import * as deepmerge from 'deepmerge';
import { buildASTSchema, DocumentNode, printSchema } from 'graphql';
import { mergeTypes as MergeTypesLib } from 'merge-graphql-schemas';
import { MergeSchemaService } from './service';
export const mergeTypes = (
  types: Array<string | DocumentNode>,
  options?: {
    orderOptions?: GenOrderTypesOptions;
    whereOptions?: GenWhereTypesOptions;
    relayOptions?: GenRelayTypesOptions;
  },
): string => {
  options = deepmerge(
    { orderOptions: {}, whereOptions: {}, relayOptions: {} },
    options || {},
  );
  const service = new MergeSchemaService();
  types.forEach(type => service.cacheDescriptions(type));

  let result = genOrderTypes(
    MergeTypesLib([...types, `type Query`], {
      all: true,
    }),
    options.orderOptions,
  );

  result = genWhereTypes(result, options.whereOptions);
  result = genRelayTypes(result, options.relayOptions);
  service.setDescriptions(result);
  return printSchema(buildASTSchema(result));
};
