import { DocumentNode } from "graphql";
import { GenOrderTypesOptions } from "./interfaces";
import { GenOrderTypesService } from "./service";
export { GenOrderTypesOptions } from "./interfaces";
export { orderResolver } from "./resolver";
export const genOrderTypes = (types: string | DocumentNode, options?: GenOrderTypesOptions): DocumentNode => {
  return new GenOrderTypesService(types, options).genOrderTypes();
};
