import { GenRelayTypesOptions } from "./options";

export const DESCRIPTIONS = {
  NODE_INTERFACE: {
    INTERFACE: "An object with an ID.",
    ID: "ID of the object.",
  },
  EDGE_INTERFACE: {
    INTERFACE: "An edge in a connection.",
    CURSOR: "A cursor for use in pagination.",
  },
  CONNECTION_INTERFACE: {
    INTERFACE: "A connection for relay",
    TOTAL_COUNT: "Identifies the total count of items in the connection.",
    PAGE_INFO: "Information to aid in pagination.",
    EDGES: "A list of edges.",
  },
  PAGE_INFO_TYPE: {
    TYPE: "Information about pagination in a connection.",
    START_CURSOR: "When paginating backwards, the cursor to continue.",
    END_CURSOR: "When paginating forwards, the cursor to continue.",
    HAS_NEXT_PAGE: "When paginating forwards, are there more items?",
    HAS_PREVIOUS_PAGE: "When paginating backwards, are there more items?",
  },
  EDGE_TYPE: {
    TYPE: (connectionTypeName: string): string => `An edge in a ${connectionTypeName}.`,
    NODE: `The item at the end of the edge.`,
  },
  CONNECTION_TYPE: {
    TYPE: (typeName: string): string => `The connection type for ${typeName}`,
    TOTAL_COUNT: (typeName: string): string => `Identifies the total count of ${typeName} items in the connection.`,
    EDGES: (edgeTypeName: string): string => `A list of ${edgeTypeName}.`,
  },
};

export const DEFAULT_OPTIONS: GenRelayTypesOptions = {
  relayDirective: { name: "relay" },
  relayCnnectionInterface: { name: "Connection", totalCountType: "Int" },
  relayEdgeInterface: { name: "Edge" },
  relayNodeInterface: { name: "Node", idFieldName: "id" },
  relayCnnectionType: { prefix: "", suffix: "Connection" },
  relayEdgeType: { prefix: "", suffix: "Edge" },
  relayPageInfoType: { name: "PageInfo" },
};
