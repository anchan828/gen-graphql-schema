import { OperatorValueType, ValueType } from "./interfaces";

export const inOperator = <T>(value: ValueType<T>, operatorValue: OperatorValueType): boolean => {
  if (!value && !operatorValue) {
    return false;
  }

  if (!Array.isArray(operatorValue)) {
    return false;
  }

  // and
  if (Array.isArray(value)) {
    return (operatorValue as (string | number)[]).every((x: string | number) =>
      (value as (string | number)[]).some((y: string | number) => x === y),
    );
  }

  // or
  return operatorValue.some((x: string | number) => x === value);
};
