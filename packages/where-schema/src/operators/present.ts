import { OperatorValueType, ValueType } from "./interfaces";

export const present = <T>(value: ValueType<T>, operatorValue: OperatorValueType): boolean => {
  const result = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
  return operatorValue ? !result : result;
};
