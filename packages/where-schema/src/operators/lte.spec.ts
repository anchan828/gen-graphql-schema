import { OperatorValueType, ValueType } from "./interfaces";
import { lte } from "./lte";
describe("lte", () => {
  const shouldReturnTrueCases = [
    {
      operatorValue: 1,
      value: 1,
    },
    {
      operatorValue: 2,
      value: 1,
    },

    {
      operatorValue: "2",
      value: "1",
    },
  ] as Array<{
    value: ValueType;
    operatorValue: OperatorValueType;
  }>;
  for (const testCase of shouldReturnTrueCases) {
    it(`should return true (${testCase.value} equals ${testCase.operatorValue})`, () => {
      expect(lte(testCase.value, testCase.operatorValue)).toBeTruthy();
    });
  }

  const shouldReturnFalseCases = [
    {
      operatorValue: 1,
      value: 2,
    },
    {
      operatorValue: 1233,
      value: 1234,
    },
    {
      operatorValue: 123,
      value: [1234],
    },
    {
      operatorValue: [1233],
      value: 1234,
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
      expect(lte(testCase.value, testCase.operatorValue)).toBeFalsy();
    });
  }
});
