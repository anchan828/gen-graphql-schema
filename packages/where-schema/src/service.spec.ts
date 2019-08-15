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
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(`scalar Date

    """Date query with using operators"""
    input DateWhereOperator {
      """Query type of Date with using operators"""
      type: DateWhereOperatorType!

      """Query value of Date"""
      value: [Date]!
    }

    """Query type of Date with using operators"""
    enum DateWhereOperatorType {
      """Must match the given data exactly"""
      EQ

      """Must be different from the given data"""
      NOT_EQ

      """Must be an element of the array"""
      IN

      """Must not be an element of the array"""
      NOT_IN

      """Must be less than given value"""
      LT

      """Must be less than or equal to given value"""
      LTE

      """Must be greater than given value"""
      GT

      """Must be greater than or equal to given value"""
      GTE
    }

    """Float query with using operators"""
    input FloatWhereOperator {
      """Query type of Float with using operators"""
      type: FloatWhereOperatorType!

      """Query value of Float"""
      value: [Float]!
    }

    """Query type of Float with using operators"""
    enum FloatWhereOperatorType {
      """Must match the given data exactly"""
      EQ

      """Must be different from the given data"""
      NOT_EQ

      """Must be an element of the array"""
      IN

      """Must not be an element of the array"""
      NOT_IN

      """Must be less than given value"""
      LT

      """Must be less than or equal to given value"""
      LTE

      """Must be greater than given value"""
      GT

      """Must be greater than or equal to given value"""
      GTE
    }

    """ID query with using operators"""
    input IDWhereOperator {
      """Query type of ID with using operators"""
      type: IDWhereOperatorType!

      """Query value of ID"""
      value: [ID]!
    }

    """Query type of ID with using operators"""
    enum IDWhereOperatorType {
      """Must match the given data exactly"""
      EQ

      """Must be different from the given data"""
      NOT_EQ

      """Must be an element of the array"""
      IN

      """Must not be an element of the array"""
      NOT_IN
    }

    """Int query with using operators"""
    input IntWhereOperator {
      """Query type of Int with using operators"""
      type: IntWhereOperatorType!

      """Query value of Int"""
      value: [Int]!
    }

    """Query type of Int with using operators"""
    enum IntWhereOperatorType {
      """Must match the given data exactly"""
      EQ

      """Must be different from the given data"""
      NOT_EQ

      """Must be an element of the array"""
      IN

      """Must not be an element of the array"""
      NOT_IN

      """Must be less than given value"""
      LT

      """Must be less than or equal to given value"""
      LTE

      """Must be greater than given value"""
      GT

      """Must be greater than or equal to given value"""
      GTE
    }

    type Query {
      tests(where: TestWhere): [Test]
    }

    """String query with using operators"""
    input StringWhereOperator {
      """Query type of String with using operators"""
      type: StringWhereOperatorType!

      """Query value of String"""
      value: [String]!
    }

    """Query type of String with using operators"""
    enum StringWhereOperatorType {
      """Must match the string starts with the given data exactly"""
      STARTS_WITH

      """Must match the string ends with the given data exactly"""
      ENDS_WITH

      """Must match the given data exactly"""
      EQ

      """Must be different from the given data"""
      NOT_EQ

      """
      Determines whether the given string may be found within another string.
      """
      CONTAINS

      """Must be an element of the array"""
      IN

      """Must not be an element of the array"""
      NOT_IN
    }

    type Test {
      id: ID!
      name: String!
      texts: [String]
      age: Int
      age2: Int
      created_At: Date
      range: Float
      published: Boolean
      test: TestEnum
      test2: [TestEnum]
    }

    enum TestEnum {
      A
      B
    }

    """TestEnum query with using operators"""
    input TestEnumWhereOperator {
      """Query type of TestEnum with using operators"""
      type: TestEnumWhereOperatorType!

      """Query value of TestEnum"""
      value: [TestEnum]!
    }

    """Query type of TestEnum with using operators"""
    enum TestEnumWhereOperatorType {
      """Must match the given data exactly"""
      EQ

      """Must be different from the given data"""
      NOT_EQ

      """Must be an element of the array"""
      IN

      """Must not be an element of the array"""
      NOT_IN
    }

    """Query of Test with using operators"""
    input TestWhere {
      """Query with using id field"""
      id: [IDWhereOperator]

      """Query with using name field"""
      name: [StringWhereOperator]

      """Query with using texts field"""
      texts: [StringWhereOperator]

      """Query with using age field"""
      age: [IntWhereOperator]

      """Query with using created_At field"""
      created_At: [DateWhereOperator]

      """Query with using range field"""
      range: [FloatWhereOperator]

      """Query with using published field"""
      published: Boolean

      """Query with using test field"""
      test: [TestEnumWhereOperator]

      """Query with using test2 field"""
      test2: [TestEnumWhereOperator]
    }`),
        ),
      ),
    );
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
              whereArgment: {
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
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(`"""ID query with using operators"""
    input PreOperatorIDSufOperator {
      """Query type of ID with using operators"""
      type: PreOperatorTypeIDSufOperatorType!

      """Query value of ID"""
      value: [ID]!
    }

    """Query type of ID with using operators"""
    enum PreOperatorTypeIDSufOperatorType {
      """Must match the given data exactly"""
      EQ

      """Must be different from the given data"""
      NOT_EQ

      """Must be an element of the array"""
      IN

      """Must not be an element of the array"""
      NOT_IN
    }

    """Query of Test with using operators"""
    input PreWhereTypeTestSufWhereType {
      """Query with using id field"""
      id: [PreOperatorIDSufOperator]
    }

    type Query {
      tests(Hoge: PreWhereTypeTestSufWhereType): [Test]
    }

    type Test {
      id: ID!
      name: String
    }`),
        ),
      ),
    );
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
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(`
    type Test1 { id: ID, name: String! }
    type Test2 { id: ID, age: Int! }
    union Test = Test1 | Test2
    
    """ID query with using operators"""
    input IDWhereOperator {
      """Query type of ID with using operators"""
      type: IDWhereOperatorType!

      """Query value of ID"""
      value: [ID]!
    }

    """Query type of ID with using operators"""
    enum IDWhereOperatorType {
      """Must match the given data exactly"""
      EQ

      """Must be different from the given data"""
      NOT_EQ

      """Must be an element of the array"""
      IN

      """Must not be an element of the array"""
      NOT_IN
    }

    """Int query with using operators"""
    input IntWhereOperator {
      """Query type of Int with using operators"""
      type: IntWhereOperatorType!

      """Query value of Int"""
      value: [Int]!
    }

    """Query type of Int with using operators"""
    enum IntWhereOperatorType {
      """Must match the given data exactly"""
      EQ

      """Must be different from the given data"""
      NOT_EQ

      """Must be an element of the array"""
      IN

      """Must not be an element of the array"""
      NOT_IN

      """Must be less than given value"""
      LT

      """Must be less than or equal to given value"""
      LTE

      """Must be greater than given value"""
      GT

      """Must be greater than or equal to given value"""
      GTE
    }

    type Query {
      tests(where: TestWhere): [Test]
    }

    """String query with using operators"""
    input StringWhereOperator {
      """Query type of String with using operators"""
      type: StringWhereOperatorType!

      """Query value of String"""
      value: [String]!
    }

    """Query type of String with using operators"""
    enum StringWhereOperatorType {
      """Must match the string starts with the given data exactly"""
      STARTS_WITH

      """Must match the string ends with the given data exactly"""
      ENDS_WITH

      """Must match the given data exactly"""
      EQ

      """Must be different from the given data"""
      NOT_EQ

      """
      Determines whether the given string may be found within another string.
      """
      CONTAINS

      """Must be an element of the array"""
      IN

      """Must not be an element of the array"""
      NOT_IN
    }

    """Query of Test with using operators"""
    input TestWhere {
      """Query with using id field"""
      id: [IDWhereOperator]

      """Query with using name field"""
      name: [StringWhereOperator]

      """Query with using age field"""
      age: [IntWhereOperator]
    }`),
        ),
      ),
    );
  });
});
