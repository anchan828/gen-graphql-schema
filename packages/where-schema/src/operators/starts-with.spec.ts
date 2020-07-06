import { OperatorValueType, ValueType } from "./interfaces";
import { startsWith } from "./starts-with";
describe("startsWith", () => {
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
      operatorValue: "AB",
      value: "ABCD",
    },
  ] as Array<{
    value: string | number | null | undefined;
    operatorValue: string | number | null;
  }>;
  for (const testCase of shouldReturnTrueCases) {
    it(`should return true (${testCase.value} startsWith ${testCase.operatorValue})`, () => {
      expect(startsWith(testCase.value, testCase.operatorValue)).toBeTruthy();
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
      operatorValue: "ABC",
      value: ["ABC"],
    },
    {
      operatorValue: ["ABCD"],
      value: "ABC",
    },
  ] as Array<{
    value: ValueType;
    operatorValue: OperatorValueType;
  }>;
  for (const testCase of shouldReturnFalseCases) {
    it(`should return false (${testCase.value} not startsWith ${testCase.operatorValue})`, () => {
      expect(startsWith(testCase.value, testCase.operatorValue)).toBeFalsy();
    });
  }
});
