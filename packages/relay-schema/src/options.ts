export interface GenRelayTypesOptions {
  relayDirective?: { name?: string };
  relayCnnectionInterface?: {
    name?: "Connection" | string;
    totalCountType?: "Int" | "Float";
  };
  relayCnnectionType?: {
    prefix?: string;
    suffix?: "Connection" | string;
  };
  relayEdgeInterface?: {
    name?: "Edge" | string;
  };

  relayEdgeType?: {
    prefix?: string;
    suffix?: "Edge" | string;
  };

  relayNodeInterface?: {
    name?: "Node" | string;
    idFieldName?: "id";
  };

  relayPageInfoType?: {
    name?: "PageInfo" | string;
  };
}
