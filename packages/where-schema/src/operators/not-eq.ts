import { eq } from "./eq";
import { OperatorValueType, ValueType } from "./interfaces";

export const notEq = <T>(value: ValueType<T>, operatorValue: OperatorValueType): boolean => {
  return !eq(value, operatorValue);
};
