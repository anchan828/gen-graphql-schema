import { OperatorValueType, ValueType } from "./interfaces";

export const startsWith = <T>(value: ValueType<T>, operatorValue: OperatorValueType): boolean => {
  if (Array.isArray(value)) {
    return false;
  }

  const ov = Array.isArray(operatorValue) ? operatorValue[0] : operatorValue;

  if (!value || !ov) {
    return false;
  }

  if (!(typeof value === "string" && typeof ov === "string")) {
    return false;
  }

  return value.startsWith(ov);
};
