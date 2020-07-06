import { Connection, ConnectionArguments, connectionFromArray } from "graphql-relay";
export function relayResolver<T extends object>(items: T[], relay: ConnectionArguments): Connection<T> {
  const connection = connectionFromArray(items, relay);
  Reflect.set(connection, "totalCount", items.length);
  return connection as Connection<T>;
}
