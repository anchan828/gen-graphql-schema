import { DocumentNode } from "graphql";
import { GenRelayTypesOptions } from "./options";
import { GenRelayTypesService } from "./service";
export { GenRelayTypesOptions } from "./options";
export const genRelayTypes = (types: string | DocumentNode, options?: GenRelayTypesOptions): DocumentNode => {
  return new GenRelayTypesService(types, options).genRelayTypes();
};
