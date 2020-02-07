import { DocumentNode } from "graphql";
import { GenWhereTypesOptions } from "./interfaces";
import { GenWhereTypesService } from "./service";
export { GenWhereTypesOptions } from "./interfaces";
export const genWhereTypes = (types: string | DocumentNode, options?: GenWhereTypesOptions): DocumentNode => {
  return new GenWhereTypesService(types, options).genWhereTypes();
};
