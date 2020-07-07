import { eq } from "./eq";
import { OperatorValueType, ValueType } from "./interfaces";
describe("eq", () => {
  const shouldReturnTrueCases = [
    {
      operatorValue: true,
      value: true,
    },
    {
      operatorValue: "A",
      value: "A",
    },
    {
      operatorValue: "",
      value: "",
    },
    {
      operatorValue: 123,
      value: 123,
    },
    {
      operatorValue: null,
    },
  ] as Array<{
    value: ValueType;
    operatorValue: OperatorValueType;
  }>;
  for (const testCase of shouldReturnTrueCases) {
    it(`should return true (${testCase.value} equals ${testCase.operatorValue})`, () => {
      expect(eq(testCase.value, testCase.operatorValue)).toBeTruthy();
    });
  }

  const shouldReturnFalseCases = [
    {
      operatorValue: true,
      value: false,
    },
    {
      operatorValue: "B",
      value: "A",
    },
    {
      operatorValue: "",
      value: undefined,
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
    it(`should return false (${testCase.value} not equals ${testCase.operatorValue})`, () => {
      expect(eq(testCase.value, testCase.operatorValue)).toBeFalsy();
    });
  }
});
