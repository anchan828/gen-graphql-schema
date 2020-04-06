import { buildASTSchema, parse, printSchema } from "graphql";
import { GenWhereTypesService } from "./service";

describe("GenWhereTypesService", () => {
  it("should return same schema when no where directive", () => {
    const types = `type Test { id: ID }`;
    expect(printSchema(buildASTSchema(new GenWhereTypesService(types).genWhereTypes()))).toEqual(
      printSchema(buildASTSchema(parse(types))),
    );
  });

  it("should return added Where types when has where directive", () => {
    expect(
      printSchema(
        buildASTSchema(
          new GenWhereTypesService(
            [
              `scalar Date`,
              `enum TestEnum { A B }`,
              `type Test {
            id: ID!
            name: String!
            texts: [String]
            age: Int
            age2: Int @where_ignore
            created_At: Date
            range: Float
            published: Boolean
            test: TestEnum
            test2: [TestEnum]
        }`,
              `type Query { tests: [Test] @where}`,
            ].join(`\n`),
            {
              supportOperatorTypes: {
                Date: ["eq", "not_eq", "in", "not_in", "lt", "lte", "gt", "gte"],
              },
            },
          ).genWhereTypes(),
        ),
      ),
    ).toMatchSnapshot();
  });

  it("should return added Where types when has custom directive", () => {
    expect(
      printSchema(
        buildASTSchema(
          new GenWhereTypesService(
            parse(
              [
                `type Test {
            id: ID!
            name: String @foo
        }`,
                `type Query { tests: [Test] @fuga}`,
              ].join(`\n`),
            ),
            {
              whereArgument: {
                name: "Hoge",
              },
              whereDirective: {
                name: "fuga",
              },
              whereIgnoreDirective: {
                name: "foo",
              },
              whereOperator: {
                prefix: "PreOperator",
                suffix: "SufOperator",
              },
              whereOperatorType: {
                prefix: "PreOperatorType",
                suffix: "SufOperatorType",
              },
              whereType: {
                prefix: "PreWhereType",
                suffix: "SufWhereType",
              },
            },
          ).genWhereTypes(),
        ),
      ),
    ).toMatchSnapshot();
  });

  it("should return added Where types when has union type and where directive", () => {
    expect(
      printSchema(
        buildASTSchema(
          new GenWhereTypesService(
            [
              `type Test1 { id: ID, name: String! }`,
              `type Test2 { id: ID, age: Int! }`,
              `union Test = Test1 | Test2`,
              `type Query { tests: [Test] @where}`,
            ].join(`\n`),
            {
              supportOperatorTypes: {
                Date: ["eq", "not_eq", "in", "not_in", "lt", "lte", "gt", "gte"],
              },
            },
          ).genWhereTypes(),
        ),
      ),
    ).toMatchSnapshot();
  });

  it("should apply where_eq_only directive", () => {
    expect(
      printSchema(
        buildASTSchema(
          new GenWhereTypesService(
            [
              `type Test {
            id: ID!
            name: String! @where_eq_only
        }`,
              `type Query { tests: [Test] @where}`,
            ].join(`\n`),
            {
              supportOperatorTypes: {
                Date: ["eq", "not_eq", "in", "not_in", "lt", "lte", "gt", "gte"],
              },
            },
          ).genWhereTypes(),
        ),
      ),
    ).toMatchSnapshot();
  });

  it("should deep where", () => {
    expect(
      printSchema(
        buildASTSchema(
          new GenWhereTypesService(
            [
              `
type TestPosition {
  column: Int!
  line: Int!
  prev: TestPosition @where_nested
  next: TestPosition @where_nested
}
type TestSubPosition {
  column: Int!
  line: Int!
}         
type Test {
  id: ID!
  position: TestPosition! @where_nested
}`,
              `type Query { tests: [Test] @where}`,
            ].join(`\n`),
            {
              supportOperatorTypes: {
                Date: ["eq", "not_eq", "in", "not_in", "lt", "lte", "gt", "gte"],
              },
            },
          ).genWhereTypes(),
        ),
      ),
    ).toMatchSnapshot();
  });
});
