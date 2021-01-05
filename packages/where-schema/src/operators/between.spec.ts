import { between } from "./between";
import { OperatorValueType, ValueType } from "./interfaces";
describe("contains", () => {
  const shouldReturnTrueCases = [
    {
      operatorValue: [1, 10],
      value: 1,
    },
    {
      operatorValue: [1, 10],
      value: 2,
    },
    {
      operatorValue: [1, 10],
      value: [1, 3, 6, 9],
    },
  ] as Array<{
    value: ValueType<any>;
    operatorValue: number[];
  }>;
  for (const testCase of shouldReturnTrueCases) {
    it(`should return true (${testCase.value} between ${testCase.operatorValue[0]} and ${testCase.operatorValue[1]})`, () => {
      expect(between(testCase.value, testCase.operatorValue)).toBeTruthy();
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
    {
      operatorValue: [],
      value: 123,
    },
    {
      operatorValue: [0, 10],
      value: [],
    },
    {
      operatorValue: [],
      value: null,
    },
    {
      operatorValue: [],
    },
    {
      operatorValue: null,
      value: 1,
    },
    {
      operatorValue: undefined,
      value: 1,
    },
    {
      operatorValue: [undefined, null],
      value: [null, undefined],
    },
  ] as Array<{
    value: ValueType<any>;
    operatorValue: OperatorValueType;
  }>;
  for (const testCase of shouldReturnFalseCases) {
    it(`should return false (${testCase.value} not between ${testCase.operatorValue})`, () => {
      expect(between(testCase.value, testCase.operatorValue)).toBeFalsy();
    });
  }
});
