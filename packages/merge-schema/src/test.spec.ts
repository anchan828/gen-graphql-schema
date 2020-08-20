import { mergeTypes } from "./index";

describe("mergeTypes", () => {
  it("should merge types", () => {
    const types = [`"""Test""" type Test {id: ID}`, `type Test2 {id: ID}`];
    expect(mergeTypes(types)).toMatchSnapshot();
  });
  it("should work orderBy directive", () => {
    const types = [`type Test {id: ID}`, `type Test2 {tests: [Test] @orderBy}`];
    expect(mergeTypes(types)).toMatchSnapshot();
  });
  it("should work where directive", () => {
    const types = [`type Test {id: ID}`, `type Test2 {tests: [Test] @where }`];
    expect(mergeTypes(types)).toMatchSnapshot();
  });
  it("should work relay directive", () => {
    const types = [`type Test {id: ID}`, `type Test2 {tests: [Test] @relay }`];

    expect(mergeTypes(types)).toMatchSnapshot();
  });

  it("should work custom directive (query)", () => {
    const types = [`directive @custom on FIELD_DEFINITION`, `type Test {id: ID @custom}`];
    expect(mergeTypes(types)).toMatchSnapshot();
  });

  it("should work custom directive (mutation)", () => {
    const types = [
      `directive @custom on INPUT_FIELD_DEFINITION`,
      `input TestInput {id: ID @custom}`,
      `type Mutation {test(input: TestInput!): Boolean!}`,
    ];
    expect(mergeTypes(types, { mergeOptions: { sort: true } })).toMatchSnapshot();
  });
  it("should work orderBy, where, and relay directive", () => {
    const types = [
      `type Test1 { id: ID, name: String! }`,
      `type Test2 { id: ID, age: Int! }`,
      `union Test = Test1 | Test2`,
      `type Test3 {tests: [Test] @orderBy @where @relay }`,
    ];
    expect(mergeTypes(types)).toMatchSnapshot();
  });

  it("should work orderBy, where, and relay directive in union", () => {
    const types = [`type Test {id: ID}`, `type Test2 {tests: [Test] @orderBy @where @relay }`];
    expect(mergeTypes(types)).toMatchSnapshot();
  });

  it("should have interface", () => {
    const types = [
      `interface Node { id: ID }`,
      `type Test implements Node { id: ID }`,
      `interface Interface { id: ID }`,
      `type Test implements Interface { id: ID }`,
    ];
    expect(mergeTypes(types)).toMatchSnapshot();
  });

  it("should merge descriptions", () => {
    const types = [
      `"""Test\nNewLine""" type Test {"""id descrip""" id: ID}`,
      `type Test { """name descrip""" name: ID}`,
    ];
    expect(mergeTypes(types)).toMatchSnapshot();
  });
});
