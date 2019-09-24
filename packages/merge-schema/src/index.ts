import { genOrderTypes, GenOrderTypesOptions } from "@anchan828/gen-graphql-order-schema";
import { genRelayTypes, GenRelayTypesOptions } from "@anchan828/gen-graphql-relay-schema";
import { genWhereTypes, GenWhereTypesOptions } from "@anchan828/gen-graphql-where-schema";
import * as deepmerge from "deepmerge";
import { buildASTSchema, DocumentNode, printSchema } from "graphql";
import { mergeTypes as MergeTypesLib } from "merge-graphql-schemas";
export { toConstanceCase } from "@anchan828/gen-graphql-schema-common";
export const mergeTypes = (
  types: Array<string | DocumentNode>,
  options?: {
    orderOptions?: GenOrderTypesOptions;
    whereOptions?: GenWhereTypesOptions;
    relayOptions?: GenRelayTypesOptions;
  },
): string => {
  options = deepmerge({ orderOptions: {}, whereOptions: {}, relayOptions: {} }, options || {});

  let result = genOrderTypes(
    MergeTypesLib([...types, `type Query`], {
      all: true,
    }),
    options.orderOptions,
  );

  result = genWhereTypes(result, options.whereOptions);
  result = genRelayTypes(result, options.relayOptions);
  return printSchema(buildASTSchema(result));
};
