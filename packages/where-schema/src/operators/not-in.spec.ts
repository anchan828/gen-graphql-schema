import { OperatorValueType, ValueType } from "./interfaces";
import { notInOperator } from "./not-in";
describe("notIn", () => {
  const shouldReturnTrueCases = [
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
  ] as Array<{
    value: ValueType;
    operatorValue: OperatorValueType;
  }>;
  for (const testCase of shouldReturnTrueCases) {
    it(`should return true (${testCase.value} is in ${testCase.operatorValue})`, () => {
      expect(notInOperator(testCase.value, testCase.operatorValue)).toBeTruthy();
    });
  }

  const shouldReturnFalseCases = [
    {
      operatorValue: "A",
      value: "A",
    },
    {
      operatorValue: 123,
      value: 123,
    },
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
    {},
  ] as Array<{
    value: ValueType;
    operatorValue: OperatorValueType;
  }>;
  for (const testCase of shouldReturnFalseCases) {
    it(`should return false (${testCase.value} is not in ${testCase.operatorValue})`, () => {
      expect(notInOperator(testCase.value, testCase.operatorValue)).toBeFalsy();
    });
  }
});
