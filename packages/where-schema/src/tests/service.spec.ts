import { buildASTSchema, parse, printSchema } from 'graphql';
import { GenWhereTypesService } from '../service';

describe('GenWhereTypesService', () => {
  it('should return same schema when no where directive', () => {
    const types = `type Test { id: ID }`;
    expect(new GenWhereTypesService(types).genWhereTypes()).toEqual(
      printSchema(buildASTSchema(parse(types))),
    );
  });

  it('should return added Where types when has where directive', () => {
    expect(
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
            Date: ['eq', 'not_eq', 'in', 'not_in', 'lt', 'lte', 'gt', 'gte'],
          },
        },
      ).genWhereTypes(),
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(
            [
              `scalar Date`,
              `enum TestEnum { A B }`,
              `type Test {
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
            }`,
              `type Query { tests (where: TestWhere): [Test]}`,
              `enum IDWhereOperatorType { EQ, NOT_EQ, IN, NOT_IN }`,
              `enum StringWhereOperatorType { STARTS_WITH, ENDS_WITH, EQ, NOT_EQ, IN, NOT_IN }`,
              `enum DateWhereOperatorType { EQ, NOT_EQ, IN, NOT_IN, LT, LTE, GT, GTE }`,
              `enum IntWhereOperatorType { EQ, NOT_EQ, IN, NOT_IN, LT, LTE, GT, GTE }`,
              `enum FloatWhereOperatorType { EQ, NOT_EQ, IN, NOT_IN, LT, LTE, GT, GTE }`,
              `enum TestEnumWhereOperatorType { EQ, NOT_EQ, IN, NOT_IN }`,
              `type IDWhereOperator { type: IDWhereOperatorType!, value: [ID]! }`,
              `type StringWhereOperator { type: StringWhereOperatorType!, value: [String]! }`,
              `type DateWhereOperator { type: DateWhereOperatorType!, value: [Date]! }`,
              `type IntWhereOperator { type: IntWhereOperatorType!, value: [Int]! }`,
              `type FloatWhereOperator { type: FloatWhereOperatorType!, value: [Float]! }`,
              `type TestEnumWhereOperator { type: TestEnumWhereOperatorType!, value: [TestEnum]! }`,
              `type TestWhere {
                id: [IDWhereOperator]
                name: [StringWhereOperator]
                texts: [StringWhereOperator]
                age: [IntWhereOperator]
                created_At: [DateWhereOperator]
                range: [FloatWhereOperator]
                published: Boolean
                test: [TestEnumWhereOperator]
                test2: [TestEnumWhereOperator]
              }`,
            ].join(`\n`),
          ),
        ),
      ),
    );
  });

  it('should return added Where types when has custom directive', () => {
    expect(
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
            name: 'Hoge',
          },
          whereDirective: {
            name: 'fuga',
          },
          whereIgnoreDirective: {
            name: 'foo',
          },
          whereOperator: {
            prefix: 'PreOperator',
            suffix: 'SufOperator',
          },
          whereOperatorType: {
            prefix: 'PreOperatorType',
            suffix: 'SufOperatorType',
          },
          whereType: {
            prefix: 'PreWhereType',
            suffix: 'SufWhereType',
          },
        },
      ).genWhereTypes(),
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(
            [
              `type Test { id: ID! name: String }`,
              `type PreOperatorIDSufOperator { type: PreOperatorTypeIDSufOperatorType! value: [ID]!}`,
              `enum PreOperatorTypeIDSufOperatorType { EQ NOT_EQ IN NOT_IN }`,
              `type PreWhereTypeTestSufWhereType { id: [PreOperatorIDSufOperator] }`,
              `type Query { tests(Hoge: PreWhereTypeTestSufWhereType): [Test] }`,
            ].join(`\n`),
          ),
        ),
      ),
    );
  });
});
