import { buildASTSchema, parse, printSchema } from "graphql";
import { GenRelayTypesService } from "./service";
describe("GenRelayTypesService", () => {
  it("should return same schema when no where directive", () => {
    const types = `type Test { id: ID }`;
    expect(printSchema(buildASTSchema(new GenRelayTypesService(types).genRelayTypes()))).toEqual(
      printSchema(buildASTSchema(parse(types))),
    );
  });

  it("should return added Where types when has where directive", () => {
    console.log(
      printSchema(
        buildASTSchema(
          new GenRelayTypesService(
            [`type Test { id: ID! }`, `type Query { tests: [Test] @relay, tests2: [Test] @relay}`].join(`\n`),
          ).genRelayTypes(),
        ),
      ),
    );
    expect(
      printSchema(
        buildASTSchema(
          new GenRelayTypesService(
            [`type Test { id: ID! }`, `type Query { tests: [Test] @relay, tests2: [Test] @relay}`].join(`\n`),
          ).genRelayTypes(),
        ),
      ),
    ).toMatchSnapshot();
  });

  it("should return added Where types when has union type", () => {
    expect(
      printSchema(
        buildASTSchema(
          new GenRelayTypesService(
            [
              `type Test1 { id: ID!, name: String! }`,
              `type Test2 { id: ID!, age: Int! }`,
              `union Test = Test1 | Test2`,
              `type Query { tests: [Test] @relay, tests2: [Test] @relay}`,
            ].join(`\n`),
          ).genRelayTypes(),
        ),
      ),
    ).toMatchSnapshot();
  });
});
