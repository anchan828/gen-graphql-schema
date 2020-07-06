/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Identifier, orderBy as orderByFunction } from "natural-orderby";
import * as objectPath from "object-path";

type OrderDirection = "ASC" | "DESC";

type OrderByArgType = { [name: string]: OrderDirection | OrderByArgType };

function resolveOrder(
  key: string,
  order: OrderDirection | OrderByArgType,
  identifiers: Array<Identifier<any>>,
  orders: Array<OrderDirection>,
): void {
  if (typeof order === "object") {
    const operatorKeys = Object.keys(order);

    for (const operatorKey of operatorKeys) {
      const nestOrderBy = order[operatorKey];
      const nestKey = `${key}.${operatorKey}`;
      if (typeof nestOrderBy === "object") {
        resolveOrder(nestKey, nestOrderBy, identifiers, orders);
      } else {
        identifiers.push((x: any) => objectPath.get(x, nestKey));
        orders.push(nestOrderBy);
      }
    }
  } else {
    identifiers.push((x: any) => objectPath.get(x, key));
    orders.push(order);
  }
}

export function orderResolver<T>(items: T[], orderBy?: OrderByArgType): T[] {
  if (!orderBy) {
    return items;
  }

  const identifiers: Array<Identifier<T>> = [];
  const orders: Array<OrderDirection> = [];
  for (const key of Object.keys(orderBy)) {
    resolveOrder(key, orderBy[key], identifiers, orders);
  }

  return orderByFunction(
    items,
    identifiers,
    orders.map((order) => (order === "ASC" ? "asc" : "desc")),
  );
}
