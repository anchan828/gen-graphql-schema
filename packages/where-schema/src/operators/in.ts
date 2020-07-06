import { OperatorValueType, ValueType } from "./interfaces";

export const inOperator = (value: ValueType, operatorValue: OperatorValueType): boolean => {
  if (!value && !operatorValue) {
    return false;
  }

  if (Array.isArray(value) && Array.isArray(operatorValue)) {
    return (
      value.findIndex((x: string | number) => operatorValue.findIndex((y: string | number) => x === y) !== -1) !== -1
    );
  }

  if (Array.isArray(value) && !Array.isArray(operatorValue)) {
    return value.findIndex((x: string | number) => x === operatorValue) !== -1;
  }

  if (!Array.isArray(value) && Array.isArray(operatorValue)) {
    return operatorValue.findIndex((x: string | number) => x === value) !== -1;
  }

  return value === operatorValue;
};
