import { OperatorValueType, ValueType } from "./interfaces";

export const notInOperator = (value: ValueType, operatorValue: OperatorValueType): boolean => {
  if (!value && !operatorValue) {
    return false;
  }

  if (!Array.isArray(operatorValue)) {
    return false;
  }

  // and
  if (Array.isArray(value)) {
    return operatorValue.every((x: string | number) => value.findIndex((y: string | number) => x === y) === -1);
  }

  // or
  return operatorValue.findIndex((x: string | number) => x === value) === -1;
};
