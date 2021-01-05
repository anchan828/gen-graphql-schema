import * as objectPath from "object-path";
import { OperatorType } from "./interfaces";
import { between } from "./operators/between";
import { contains } from "./operators/contains";
import { endsWith } from "./operators/ends-with";
import { eq } from "./operators/eq";
import { gt } from "./operators/gt";
import { gte } from "./operators/gte";
import { inOperator } from "./operators/in";
import { OperatorValueType, ValueType } from "./operators/interfaces";
import { lt } from "./operators/lt";
import { lte } from "./operators/lte";
import { notEq } from "./operators/not-eq";
import { notInOperator } from "./operators/not-in";
import { present } from "./operators/present";
import { startsWith } from "./operators/starts-with";

const operatorMap: Map<OperatorType, (value: ValueType<any>, operatorValue: OperatorValueType) => boolean> = new Map([
  ["starts_with", startsWith],
  ["ends_with", endsWith],
  ["eq", eq],
  ["not_eq", notEq],
  ["contains", contains],
  ["in", inOperator],
  ["not_in", notInOperator],
  ["lt", lt],
  ["lte", lte],
  ["gt", gt],
  ["gte", gte],
  ["between", between],
  ["present", present],
]);

type PrimitiveType = string | number | boolean;

type WhereOperations<T> =
  | {
      starts_with?: T;
      ends_with?: T;
      eq?: T | null;
      not_eq?: T | null;
      contains?: T | null;
      in?: (T | null)[];
      not_in?: (T | null)[];
      lt?: T;
      lte?: T;
      gt?: T;
      gte?: T;
      between?: T[];
      present?: boolean;
    }
  | PrimitiveType;

type WhereOperationType<T> = T extends Array<infer U>
  ? WhereOperationType<U>
  : T extends PrimitiveType
  ? WhereOperations<T>
  : {
      [key in keyof T]?: T[key] extends Array<infer V>
        ? WhereOperationType<V>
        : T[key] extends PrimitiveType
        ? WhereOperations<T[key]>
        : WhereOperationType<T[key]>;
    } & { [`PRESENT`]?: boolean };

type WhereFn<T> = (item: T) => boolean;

export function whereResolver<T extends object>(
  items: T[],
  where: WhereOperationType<T> & { [`OR`]?: WhereOperationType<T>[] },
  objectPaths?: Record<keyof T, string>,
): T[] {
  const whereKeys = Object.keys(where);
  const andFns: WhereFn<T>[] = andFilterFunctions(where, objectPaths);

  if (whereKeys.includes("PRESENT")) {
    if (!present(items, Reflect.get(where, "PRESENT"))) {
      return [];
    }
  }

  let results = items.filter((item) => andFns.every((fn) => fn(item)));
  if (whereKeys.includes("OR")) {
    const operators = Reflect.get(where, "OR") as WhereOperationType<T>[];
    const orFns: WhereFn<T>[][] = [];
    for (const operator of operators) {
      orFns.push(andFilterFunctions(operator, objectPaths));
    }

    results = results.filter((item) => orFns.some((andFns) => andFns.every((andFn) => andFn(item))));
  }

  return results;
}

function andFilterFunctions<T extends object>(
  where: WhereOperationType<T> | { [`OR`]?: WhereOperationType<T>[] },
  objectPaths?: Record<keyof T, string>,
): WhereFn<T>[] {
  const andFns: WhereFn<T>[] = [];
  const whereKeys = Object.keys(where) as Array<keyof T | "OR" | "PRESENT">;
  if (!Array.isArray(whereKeys) || whereKeys.length === 0) {
    return andFns;
  }

  for (const whereKey of whereKeys) {
    if (whereKey === "OR" || whereKey === "PRESENT") {
      continue;
    }

    const operators = Reflect.get(where, whereKey);

    if (operators === undefined) {
      continue;
    }

    andFns.push(...genAndFilterFunctions(`${whereKey}`, operators, objectPaths));
  }

  return andFns;
}

function genAndFilterFunctions<T extends object>(
  key: string,
  operators: WhereOperationType<T>,
  objectPaths?: Record<keyof T, string>,
): WhereFn<T>[] {
  const fns: WhereFn<T>[] = [];
  let propertyKey = key;
  if (typeof operators === "object" && !Array.isArray(operators)) {
    const operatorKeys = Object.keys(operators).map((o) => {
      if (o === "PRESENT") {
        o = "present";
      }
      return o;
    }) as OperatorType[];

    for (const operatorKey of operatorKeys) {
      if (!operatorMap.has(operatorKey)) {
        propertyKey = `${propertyKey}.${operatorKey}`;
        fns.push(...genAndFilterFunctions(propertyKey, (operators as any)[operatorKey as any], objectPaths));
      } else {
        fns.push(genAndFilterFunction(key, operators, objectPaths));
      }
    }
  } else {
    fns.push(genAndFilterFunction(key, operators, objectPaths) as any);
  }

  return fns;
}

function genAndFilterFunction<T extends object>(
  key: string,
  operators: WhereOperationType<T>,
  objectPaths?: Record<string, string>,
): WhereFn<T> {
  let objectPathKey: string = key;

  if (objectPaths && objectPaths[key]) {
    objectPathKey = objectPaths[key];
  }
  let ops = operators;
  if (typeof ops !== "object") {
    ops = { eq: operators } as any;
  }
  return (item) => {
    return Object.keys(ops).every((operator: string) => {
      return operatorMap.get(operator.toLowerCase() as OperatorType)?.(
        (objectPath.get(item, objectPathKey) as unknown) as ValueType<T>,
        Reflect.get(ops, operator),
      );
    });
  };
}
