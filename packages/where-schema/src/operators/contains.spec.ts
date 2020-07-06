import { contains } from "./contains";
import { OperatorValueType, ValueType } from "./interfaces";
describe("contains", () => {
  const shouldReturnTrueCases = [
    {
      operatorValue: "A",
      value: "A",
    },
    {
      operatorValue: "AB",
      value: "ABC",
    },
    {
      operatorValue: "BC",
      value: "ABCD",
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
    it(`should return true (${testCase.value} contains ${testCase.operatorValue})`, () => {
      expect(contains(testCase.value, testCase.operatorValue)).toBeTruthy();
    });
  }

  const shouldReturnFalseCases = [
    {
      operatorValue: "B",
      value: "A",
    },
    {
      operatorValue: "D",
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
      operatorValue: [123],
      value: 123,
    },
  ] as Array<{
    value: ValueType;
    operatorValue: OperatorValueType;
  }>;
  for (const testCase of shouldReturnFalseCases) {
    it(`should return false (${testCase.value} not contains ${testCase.operatorValue})`, () => {
      expect(contains(testCase.value, testCase.operatorValue)).toBeFalsy();
    });
  }
});
