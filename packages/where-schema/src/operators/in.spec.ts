import { inOperator } from "./in";
import { OperatorValueType, ValueType } from "./interfaces";
describe("in", () => {
  const shouldReturnTrueCases = [
    {
      operatorValue: ["A"],
      value: "A",
    },
    {
      operatorValue: [123],
      value: 123,
    },
    {
      operatorValue: ["A"],
      value: ["A", "B", "C"],
    },
    {
      operatorValue: ["A", "B", "C"],
      value: "A",
    },
    {
      operatorValue: [1234],
      value: [123, 12, 1234, 12345],
    },
    {
      operatorValue: [123, 1234],
      value: [123, 12, 1234, 12345],
    },
  ] as Array<{
    value: ValueType;
    operatorValue: OperatorValueType;
  }>;
  for (const testCase of shouldReturnTrueCases) {
    it(`should return true (${testCase.value} is in ${testCase.operatorValue})`, () => {
      expect(inOperator(testCase.value, testCase.operatorValue)).toBeTruthy();
    });
  }

  const shouldReturnFalseCases = [
    {
      operatorValue: "B",
      value: "A",
    },
    {
      operatorValue: 1234,
      value: [123, 12, 12345],
    },
    {
      operatorValue: ["B"],
      value: "A",
    },
    {
      operatorValue: [1234],
      value: [123, 12, 12345],
    },
    {
      operatorValue: ["B", "C"],
      value: "A",
    },
    {
      operatorValue: ["D", "E"],
      value: ["A", "B", "C", ""],
    },
    {
      operatorValue: [123, 123456],
      value: [123, 12, 1234, 12345],
    },
    {},
  ] as Array<{
    value: ValueType;
    operatorValue: OperatorValueType;
  }>;
  for (const testCase of shouldReturnFalseCases) {
    it(`should return false (${testCase.value} is not in ${testCase.operatorValue})`, () => {
      expect(inOperator(testCase.value, testCase.operatorValue)).toBeFalsy();
    });
  }
});
