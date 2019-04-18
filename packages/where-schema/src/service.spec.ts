import { buildASTSchema, parse, printSchema } from 'graphql';
import { GenWhereTypesService } from './service';

describe('GenWhereTypesService', () => {
  it('should return same schema when no where directive', () => {
    const types = `type Test { id: ID }`;
    expect(
      printSchema(
        buildASTSchema(new GenWhereTypesService(types).genWhereTypes()),
      ),
    ).toEqual(printSchema(buildASTSchema(parse(types))));
  });

  it('should return added Where types when has where directive', () => {
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
                Date: [
                  'eq',
                  'not_eq',
                  'in',
                  'not_in',
                  'lt',
                  'lte',
                  'gt',
                  'gte',
                ],
              },
            },
          ).genWhereTypes(),
        ),
      ),
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
              `input IDWhereOperator { type: IDWhereOperatorType!, value: [ID]! }`,
              `input StringWhereOperator { type: StringWhereOperatorType!, value: [String]! }`,
              `input DateWhereOperator { type: DateWhereOperatorType!, value: [Date]! }`,
              `input IntWhereOperator { type: IntWhereOperatorType!, value: [Int]! }`,
              `input FloatWhereOperator { type: FloatWhereOperatorType!, value: [Float]! }`,
              `input TestEnumWhereOperator { type: TestEnumWhereOperatorType!, value: [TestEnum]! }`,
              `input TestWhere {
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
        ),
      ),
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(
            [
              `type Test { id: ID! name: String }`,
              `input PreOperatorIDSufOperator { type: PreOperatorTypeIDSufOperatorType! value: [ID]!}`,
              `enum PreOperatorTypeIDSufOperatorType { EQ NOT_EQ IN NOT_IN }`,
              `input PreWhereTypeTestSufWhereType { id: [PreOperatorIDSufOperator] }`,
              `type Query { tests(Hoge: PreWhereTypeTestSufWhereType): [Test] }`,
            ].join(`\n`),
          ),
        ),
      ),
    );
  });
});
