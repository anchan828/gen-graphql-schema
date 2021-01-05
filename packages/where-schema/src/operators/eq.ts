import { OperatorValueType, ValueType } from "./interfaces";

export const eq = <T>(value: ValueType<T>, operatorValue: OperatorValueType): boolean => {
  if (Array.isArray(value)) {
    return false;
  }

  const ov = Array.isArray(operatorValue) ? operatorValue[0] : operatorValue;

  if ((value === null || value === undefined) && (ov === null || ov === undefined)) {
    return true;
  }

  if (typeof value === typeof ov) {
    return value === ov;
  }

  return false;
};
