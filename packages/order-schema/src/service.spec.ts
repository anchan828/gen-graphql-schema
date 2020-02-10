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
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(
            `"""Sort the results in ascending or descending order"""
    enum OrderDirection {
      """Sort the results in ascending order"""
      ASC
    
      """Sort the results in descending order"""
      DESC
    }
    
    type Query {
      tests(orderBy: TestOrder): [Test]
    }
    
    type Test {
      id: ID
    }
    
    """Ordering options for Test"""
    input TestOrder {
      """Order Test by id"""
      id: OrderDirection
    }`,
          ),
        ),
      ),
    );
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
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(`scalar Date
    
    """Sort the results in ascending or descending order"""
    enum OrderDirection {
      """Sort the results in ascending order"""
      ASC
    
      """Sort the results in descending order"""
      DESC
    }
    
    type Query {
      tests(arg: TestChanged): [Test]
    }
    
    type Test {
      id: ID
      name: String
      date: Date
    }
    
    """Ordering options for Test"""
    input TestChanged {
      """Order Test by id"""
      id: OrderDirection
    
      """Order Test by date"""
      date: OrderDirection
    }`),
        ),
      ),
    );
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
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(
            `"""Sort the results in ascending or descending order"""
    enum Position {
      """Sort the results in ascending order"""
      TOP
    
      """Sort the results in descending order"""
      BOTTOM
    }
    
    """Ordering options for Test"""
    input PrefixTestChanged {
      """Order Test by id"""
      id: Position
    }
    
    type Query {
      tests(arg: PrefixTestChanged): [[Test!]]!
    }
    
    type Test {
      id: ID
      name: String
    }`,
          ),
        ),
      ),
    );
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
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(
            `"""Sort the results in ascending or descending order"""
    enum OrderDirection {
      """Sort the results in ascending order"""
      ASC
    
      """Sort the results in descending order"""
      DESC
    }
    
    type Query {
      tests(orderBy: TestOrder): [Test]
    }
    
    union Test = Test1 | Test2
    
    type Test1 {
      id: ID
      name: String!
    }
    
    type Test2 {
      id: ID
      age: Int!
    }
    
    """Ordering options for Test"""
    input TestOrder {
      """Order Test by id"""
      id: OrderDirection
    
      """Order Test by name"""
      name: OrderDirection
    
      """Order Test by age"""
      age: OrderDirection
    }`,
          ),
        ),
      ),
    );
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
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(`"""Sort the results in ascending or descending order"""
    enum OrderDirection {
      """Sort the results in ascending order"""
      ASC
    
      """Sort the results in descending order"""
      DESC
    }
    
    type Query {
      tests(orderBy: TestOrder): [Test]
    }
    
    type Test {
      id: ID!
      position: TestPosition!
    }
    
    """Ordering options for Test"""
    input TestOrder {
      """Order Test by id"""
      id: OrderDirection
    
      """Order Test by position"""
      position: TestPositionOrder
    }
    
    type TestPosition {
      column: Int!
      line: Int!
      prev: TestPosition
      next: TestPosition
    }
    
    """Ordering options for TestPosition"""
    input TestPositionOrder {
      """Order TestPosition by column"""
      column: OrderDirection
    
      """Order TestPosition by line"""
      line: OrderDirection
    
      """Order TestPosition by prev"""
      prev: TestPositionOrder
    }
    
    type TestSubPosition {
      column: Int!
      line: Int!
    }`),
        ),
      ),
    );
  });
});
