import { present } from "./present";
describe("present", () => {
  const shouldReturnTrueCases = ["A", { a: "a" }, {}] as Array<any>;
  for (const testCase of shouldReturnTrueCases) {
    it(`${JSON.stringify(testCase)} returns true`, () => {
      expect(present(testCase, true)).toBeTruthy();
    });
  }

  const shouldReturnFalseCases = [undefined, null, "", []] as Array<any>;
  for (const testCase of shouldReturnFalseCases) {
    it(`${JSON.stringify(testCase)} returns false`, () => {
      expect(present(testCase, false)).toBeTruthy();
    });
  }
});
