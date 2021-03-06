import { OperatorValueType, ValueType } from "./interfaces";

export const between = <T>(value: ValueType<T>, operatorValue: OperatorValueType): boolean => {
  if (!value || !operatorValue) {
    return false;
  }

  if (Array.isArray(value) && value.length === 0) {
    return false;
  }

  if (!Array.isArray(operatorValue) || operatorValue.length !== 2) {
    return false;
  }

  if (Array.isArray(value)) {
    return (value as (string | number)[]).every(
      (v: ValueType<T>) => v && v >= operatorValue[0] && v <= operatorValue[1],
    );
  }

  return value >= operatorValue[0] && value <= operatorValue[1];
};
