import { gte } from "./gte";
import { OperatorValueType, ValueType } from "./interfaces";
describe("gte", () => {
  const shouldReturnTrueCases = [
    {
      operatorValue: 1,
      value: 1,
    },
    {
      operatorValue: 1,
      value: 2,
    },
    {
      operatorValue: "1",
      value: "2",
    },
  ] as Array<{
    value: ValueType;
    operatorValue: OperatorValueType;
  }>;
  for (const testCase of shouldReturnTrueCases) {
    it(`should return true (${testCase.value} equals ${testCase.operatorValue})`, () => {
      expect(gte(testCase.value, testCase.operatorValue)).toBeTruthy();
    });
  }

  const shouldReturnFalseCases = [
    {
      operatorValue: 2,
      value: 1,
    },
    {
      operatorValue: 1234,
      value: 123,
    },
    {
      operatorValue: 1234,
      value: [123],
    },
    {
      operatorValue: [1234],
      value: 123,
    },
    {
      value: 1234,
    },
    {
      operatorValue: 123,
    },
  ] as Array<{
    value: ValueType;
    operatorValue: OperatorValueType;
  }>;
  for (const testCase of shouldReturnFalseCases) {
    it(`should return false (${testCase.value} not equals ${testCase.operatorValue})`, () => {
      expect(gte(testCase.value, testCase.operatorValue)).toBeFalsy();
    });
  }
});
