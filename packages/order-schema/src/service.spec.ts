import { buildASTSchema, parse, printSchema } from "graphql";
import { GenOrderTypesService } from "./service";

describe("GenOrderTypesService", () => {
  it("should return same schema when no orderBy directive", () => {
    const types = `type Test { id: ID }`;
    expect(printSchema(buildASTSchema(new GenOrderTypesService(types).genOrderTypes()))).toEqual(
      printSchema(buildASTSchema(parse(types))),
    );
  });

  it("should return added Order enum when has orderBy directive", () => {
    expect(
      printSchema(
        buildASTSchema(
          new GenOrderTypesService(
            [`type Test { id: ID }`, `type Query { tests: [Test] @orderBy}`].join(`\n`),
          ).genOrderTypes(),
        ),
      ),
    ).toMatchSnapshot();
  });

  it("should return added Order enum when change options", () => {
    expect(
      printSchema(
        buildASTSchema(
          new GenOrderTypesService(
            [
              `scalar Date`,
              `type Test { id: ID, name: String @ignore, date: Date }`,
              `type Query { tests: [Test] @hoge}`,
            ].join(`\n`),
            {
              orderByDirective: {
                name: "hoge",
              },
              orderByIgnoreDirective: {
                name: "ignore",
              },
              orderByArgument: {
                name: "arg",
                isList: false,
              },
              orderType: {
                suffix: "Changed",
              },
              supportOrderableTypes: ["Date"],
            },
          ).genOrderTypes(),
        ),
      ),
    ).toMatchSnapshot();
  });

  it("should return added Order enum", () => {
    expect(
      printSchema(
        buildASTSchema(
          new GenOrderTypesService(
            [`type Test { id: ID, name: String @ignore }`, `type Query { tests: [[Test!]]! @hoge}`].join(`\n`),
            {
              orderByDirective: {
                name: "hoge",
              },
              orderByIgnoreDirective: {
                name: "ignore",
              },
              orderByArgument: {
                name: "arg",
              },
              orderType: {
                prefix: "Prefix",
                suffix: "Changed",
              },
              orderDirection: {
                ascName: "TOP",
                descName: "BOTTOM",
                typeName: "Position",
              },
              orderFieldEnum: {
                prefix: "Prefix",
                suffix: "Suffix",
              },
            },
          ).genOrderTypes(),
        ),
      ),
    ).toMatchSnapshot();
  });

  it("should support union type", () => {
    expect(
      printSchema(
        buildASTSchema(
          new GenOrderTypesService(
            [
              `type Test1 { id: ID, name: String! }`,
              `type Test2 { id: ID, age: Int! }`,
              `union Test = Test1 | Test2`,
              `type Query { tests: [Test] @orderBy}`,
            ].join(`\n`),
          ).genOrderTypes(),
        ),
      ),
    ).toMatchSnapshot();
  });

  it("should deep where", () => {
    expect(
      printSchema(
        buildASTSchema(
          new GenOrderTypesService(
            [
              `
type TestPosition {
  column: Int!
  line: Int!
  prev: TestPosition @orderBy_nested
  next: TestPosition 
}
type TestSubPosition {
  column: Int!
  line: Int!
}         
type Test {
  id: ID!
  position: TestPosition! @orderBy_nested
}`,
              `type Query { tests: [Test] @orderBy}`,
            ].join(`\n`),
          ).genOrderTypes(),
        ),
      ),
    ).toMatchSnapshot();
  });
});
