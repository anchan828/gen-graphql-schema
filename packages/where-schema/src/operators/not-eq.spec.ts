import { OperatorValueType, ValueType } from "./interfaces";
import { notEq } from "./not-eq";
describe("notEq", () => {
  const shouldReturnTrueCases = [
    {
      operatorValue: "B",
      value: "A",
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
      operatorValue: 123,
    },
  ] as Array<{
    value: ValueType;
    operatorValue: OperatorValueType;
  }>;
  for (const testCase of shouldReturnTrueCases) {
    it(`should return true (${testCase.value} not equals ${testCase.operatorValue})`, () => {
      expect(notEq(testCase.value, testCase.operatorValue)).toBeTruthy();
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
      operatorValue: [123],
      value: 123,
    },
    {},
  ] as Array<{
    value: ValueType;
    operatorValue: OperatorValueType;
  }>;
  for (const testCase of shouldReturnFalseCases) {
    it(`should return false (${testCase.value} equals ${testCase.operatorValue})`, () => {
      expect(notEq(testCase.value, testCase.operatorValue)).toBeFalsy();
    });
  }
});
