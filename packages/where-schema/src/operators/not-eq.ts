import { eq } from "./eq";
import { OperatorValueType, ValueType } from "./interfaces";

export const notEq = (value: ValueType, operatorValue: OperatorValueType): boolean => {
  return !eq(value, operatorValue);
};
