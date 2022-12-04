/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Identifier, orderBy as orderByFunction } from "natural-orderby";
import * as objectPath from "object-path";
type PrimitiveType = string | number | boolean;
type OrderDirection = "ASC" | "DESC";

type OrderByArgType<T> = { [K in keyof T]?: T[K] extends PrimitiveType ? OrderDirection : OrderByArgType<T[K]> };

function resolveOrder<T>(
  key: string,
  order: OrderByArgType<T>,
  identifiers: Array<Identifier<any>>,
  orders: Array<OrderDirection>,
): void {
  if (typeof order === "object") {
    const operatorKeys = Object.keys(order);

    for (const operatorKey of operatorKeys) {
      const nestOrderBy = Reflect.get(order, operatorKey);
      const nestKey = `${key}.${operatorKey}`;
      if (typeof nestOrderBy === "object") {
        resolveOrder(nestKey, nestOrderBy, identifiers, orders);
      } else {
        identifiers.push((x: any) => objectPath.get(x, nestKey));
        orders.push(nestOrderBy!);
      }
    }
  } else {
    identifiers.push((x: any) => objectPath.get(x, key));
    orders.push(order);
  }
}

export function orderResolver<T>(items: T[], orderBy?: OrderByArgType<T>): T[] {
  if (!orderBy) {
    return items;
  }

  const identifiers: Array<Identifier<T>> = [];
  const orders: Array<OrderDirection> = [];
  for (const key of Object.keys(orderBy)) {
    resolveOrder(key, Reflect.get(orderBy, key)!, identifiers, orders);
  }

  return orderByFunction(
    items,
    identifiers,
    orders.map((order) => (order === "ASC" ? "asc" : "desc")),
  );
}
