import { OperatorValueType, ValueType } from "./interfaces";

export const eq = (value: ValueType, operatorValue: OperatorValueType): boolean => {
  if (Array.isArray(value)) {
    return false;
  }

  const ov = Array.isArray(operatorValue) ? operatorValue[0] : operatorValue;

  if (!value && !ov) {
    return true;
  }

  if (typeof value === typeof ov) {
    return value === ov;
  }

  return false;
};