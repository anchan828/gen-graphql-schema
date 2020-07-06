import { DocumentNode } from "graphql";
import { GenRelayTypesOptions } from "./options";
import { GenRelayTypesService } from "./service";
export { GenRelayTypesOptions } from "./options";
export { relayResolver } from "./resolver";
export const genRelayTypes = (types: string | DocumentNode, options?: GenRelayTypesOptions): DocumentNode => {
  return new GenRelayTypesService(types, options).genRelayTypes();
};
