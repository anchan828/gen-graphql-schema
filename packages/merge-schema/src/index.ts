import { genOrderTypes, GenOrderTypesOptions } from "@anchan828/gen-graphql-order-schema";
import { genRelayTypes, GenRelayTypesOptions } from "@anchan828/gen-graphql-relay-schema";
import { printSchemaWithDirectives } from "@anchan828/gen-graphql-schema-common";
import { genWhereTypes, GenWhereTypesOptions } from "@anchan828/gen-graphql-where-schema";
import { Config, mergeTypeDefs } from "@graphql-tools/merge";
import * as deepmerge from "deepmerge";
import { buildASTSchema, DocumentNode, lexicographicSortSchema } from "graphql";

export { printSchemaWithDirectives, toConstanceCase } from "@anchan828/gen-graphql-schema-common";
export const mergeTypes = (
  types: Array<string | DocumentNode>,
  options?: {
    mergeOptions?: Omit<Partial<Config>, "commentDescriptions">;
    orderOptions?: GenOrderTypesOptions;
    whereOptions?: GenWhereTypesOptions;
    relayOptions?: GenRelayTypesOptions;
  },
): string => {
  options = deepmerge({ orderOptions: {}, whereOptions: {}, relayOptions: {} }, options || {});

  let result = genOrderTypes(mergeTypeDefs([...types, `type Query`], options.mergeOptions), options.orderOptions);

  result = genWhereTypes(result, options.whereOptions);
  result = genRelayTypes(result, options.relayOptions);
  let schema = buildASTSchema(result);
  if (options.mergeOptions?.sort) {
    schema = lexicographicSortSchema(schema);
  }
  return printSchemaWithDirectives(schema);
};
