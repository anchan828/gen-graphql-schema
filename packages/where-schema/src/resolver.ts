import * as objectPath from "object-path";
import "reflect-metadata";
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

type WhereFn<T> = (item: T, result?: boolean) => boolean;

const PRESENT_FN_KEY = "PRESENT_FN_KEY";

function doAndFilter<T extends object>(item: T, andFns: WhereFn<T>[][]) {
  return andFns.every((fns) => {
    const presentFn = fns.find((f) => Reflect.hasMetadata(PRESENT_FN_KEY, f));
    const fn = fns.filter((f) => !Reflect.hasMetadata(PRESENT_FN_KEY, f));

    let result = fn.every((f) => f(item));

    if (presentFn) {
      result = presentFn(item, result);
    }
    return result;
  });
}

export function whereResolver<T extends object>(
  items: T[],
  where: WhereOperationType<T> & { [`OR`]?: WhereOperationType<T>[] },
  objectPaths?: Record<keyof T, string>,
): T[] {
  const whereKeys = sortOperatorKey(Object.keys(where));
  const andFns: WhereFn<T>[][] = andFilterFunctions(where, objectPaths);
  let results = items.filter((item) => doAndFilter(item, andFns));
  if (whereKeys.includes("OR")) {
    const operators = Reflect.get(where, "OR") as WhereOperationType<T>[];
    const orFns: WhereFn<T>[][][] = [];
    for (const operator of operators) {
      orFns.push(andFilterFunctions(operator, objectPaths));
    }

    results = results.filter((item) => orFns.some((andFnsArray) => doAndFilter(item, andFnsArray)));
  }

  return results;
}

function andFilterFunctions<T extends object>(
  where: WhereOperationType<T> | { [`OR`]?: WhereOperationType<T>[] },
  objectPaths?: Record<keyof T, string>,
): WhereFn<T>[][] {
  const andFns: WhereFn<T>[][] = [];
  const whereKeys = sortOperatorKey(Object.keys(where)) as Array<keyof T | "OR" | "PRESENT">;
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

    andFns.push(genAndFilterFunctions(String(whereKey), operators, objectPaths));
  }

  return andFns;
}

function genAndFilterFunctions<T extends object>(
  key: string,
  operators: WhereOperationType<T>,
  objectPaths?: Record<keyof T, string>,
): WhereFn<T>[] {
  const fns: WhereFn<T>[] = [];
  const propertyKey = key;
  if (typeof operators === "object" && !Array.isArray(operators)) {
    const operatorKeys = Object.keys(operators);

    for (const operatorKey of operatorKeys) {
      if (operatorKey === "PRESENT") {
        const presentFn = genAndPresenterFilterFunction(propertyKey, operators["PRESENT"] as boolean, objectPaths);
        Reflect.defineMetadata(PRESENT_FN_KEY, "PRESENT", presentFn);
        fns.push(presentFn);
      } else if (!operatorMap.has(operatorKey as OperatorType)) {
        fns.push(
          ...genAndFilterFunctions(
            `${propertyKey}.${operatorKey}`,
            (operators as any)[operatorKey as any],
            objectPaths,
          ),
        );
      } else {
        fns.push(genAndFilterFunction(key, operators, objectPaths));
      }
    }
  } else {
    fns.push(genAndFilterFunction(key, operators, objectPaths) as any);
  }

  return fns;
}

function genAndPresenterFilterFunction<T extends object>(
  key: string,
  presentValue: boolean,
  objectPaths?: Record<string, string>,
): WhereFn<T> {
  let objectPathKey: string = key;

  if (objectPaths && objectPaths[key]) {
    objectPathKey = objectPaths[key];
  }

  return (item, result): boolean => {
    let res = result;
    const presentValue2 = genObjectPaths(item, objectPathKey).some((opk) =>
      present(objectPath.get(item, opk) as unknown as ValueType<T>, presentValue),
    );

    if (result && !presentValue && presentValue2) {
      res = true;
    } else if (result && presentValue && !presentValue2) {
      res = false;
    } else if (!result && !presentValue) {
      res = true;
    } else if (result && !presentValue) {
      res = false;
    }

    return res as boolean;
  };
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
    return Object.keys(ops).some((operator: string) => {
      const operatorFn = operatorMap.get(operator.toLowerCase() as OperatorType);

      if (!operatorFn) {
        return;
      }

      return genObjectPaths(item, objectPathKey).some((opk) =>
        operatorFn(objectPath.get(item, opk) as unknown as ValueType<T>, Reflect.get(ops, operator)),
      );
    });
  };
}

export function genObjectPaths<T extends object>(item: T, objectPathKey: string): string[] {
  if (objectPathKey.endsWith("PRESENT")) {
    return [objectPathKey];
  }

  if (objectPath.has(item, objectPathKey)) {
    return [objectPathKey];
  }

  const keys = objectPathKey.split(".");
  const data = objectPath.get(item, keys[0]);

  if (!data) {
    return [objectPathKey];
  }

  const results = [];

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      for (const nestedKey of genObjectPaths(data[i], keys.slice(1).join("."))) {
        results.push(`${keys[0]}.${i}.${nestedKey}`);
      }
    }
  }

  return results;
}

export function sortOperatorKey(keys: string[]): string[] {
  const presentKeys = ["present", "PRESENT"];
  return [...keys.filter((k) => !presentKeys.includes(k)), ...keys.filter((k) => presentKeys.includes(k))];
}
