import { endsWith } from "./ends-with";
import { OperatorValueType, ValueType } from "./interfaces";
describe("endsWith", () => {
  const shouldReturnTrueCases = [
    {
      operatorValue: "A",
      value: "A",
    },
    {
      operatorValue: "BC",
      value: "ABC",
    },
    {
      operatorValue: "CD",
      value: "ABCD",
    },
  ] as Array<{
    value: ValueType;
    operatorValue: OperatorValueType;
  }>;
  for (const testCase of shouldReturnTrueCases) {
    it(`should return true (${testCase.value} endsWith ${testCase.operatorValue})`, () => {
      expect(endsWith(testCase.value, testCase.operatorValue)).toBeTruthy();
    });
  }

  const shouldReturnFalseCases = [
    {
      operatorValue: "B",
      value: "A",
    },
    {
      operatorValue: "B",
      value: "ABC",
    },
    {
      operatorValue: 1234,
      value: 123,
    },
    {
      operatorValue: 1,
      value: "1",
    },
    {
      operatorValue: null,
      value: "1",
    },
    {
      operatorValue: 123,
      value: [123],
    },
    {
      operatorValue: [1234],
      value: 123,
    },
  ] as Array<{
    value: ValueType;
    operatorValue: OperatorValueType;
  }>;
  for (const testCase of shouldReturnFalseCases) {
    it(`should return false (${testCase.value} not endsWith ${testCase.operatorValue})`, () => {
      expect(endsWith(testCase.value, testCase.operatorValue)).toBeFalsy();
    });
  }
});
