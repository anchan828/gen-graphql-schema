import { buildASTSchema, parse, printSchema } from 'graphql';
import { GenOrderTypesService } from '../service';

describe('GenOrderTypesService', () => {
  it('should return same schema when no orderBy directive', () => {
    const types = `type Test { id: ID }`;
    expect(
      printSchema(
        buildASTSchema(new GenOrderTypesService(types).genOrderTypes()),
      ),
    ).toEqual(printSchema(buildASTSchema(parse(types))));
  });

  it('should return added Order enum when has orderBy directive', () => {
    expect(
      printSchema(
        buildASTSchema(
          new GenOrderTypesService(
            [
              `type Test { id: ID }`,
              `type Query { tests: [Test] @orderBy}`,
            ].join(`\n`),
          ).genOrderTypes(),
        ),
      ),
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(
            [
              `type Test { id: ID }`,
              `type Query { tests (orderBy: [TestOrder] ): [Test]}`,
              `
              """
              Sort the results in ascending or descending order
              """
              enum OrderDirection {
                """
                Sort the results in ascending order
                """
                ASC
                """
                Sort the results in descending order
                """
                DESC
              }
              `,

              `
              """
              Properties by which Test can be ordered.
              """
              enum TestOrderField {
                """
                Order Test by id
                """
                id
              }
              `,

              `
              """
              Ordering options for Test
              """
              input TestOrder {
                """
                The field to order Test by.
                """
                field: TestOrderField
                """
                The ordering direction.
                """
                direction: OrderDirection
              }
              `,
            ].join(`\n`),
          ),
        ),
      ),
    );
  });

  it('should ignore object type in enum', () => {
    expect(
      printSchema(
        buildASTSchema(
          new GenOrderTypesService(
            [
              `type Test1 { id: ID }`,
              `type Test2 { id: ID, test: Test1 }`,
              `type Query { tests: [Test2] @orderBy}`,
            ].join(`\n`),
          ).genOrderTypes(),
        ),
      ),
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(
            [
              `type Test1 { id: ID }`,
              `type Test2 { id: ID, test: Test1 }`,
              `type Query { tests (orderBy: [Test2Order] ): [Test2]}`,
              `
              """
              Sort the results in ascending or descending order
              """
              enum OrderDirection {
                """
                Sort the results in ascending order
                """
                ASC
                """
                Sort the results in descending order
                """
                DESC
              }
              `,
              `
              """
              Properties by which Test2 can be ordered.
              """
              enum Test2OrderField {
                """
                Order Test2 by id
                """
                id
              }
              `,
              `
              """
              Ordering options for Test2
              """
              input Test2Order {
                """
                The field to order Test2 by.
                """
                field: Test2OrderField
                """
                The ordering direction.
                """
                direction: OrderDirection
              }
              `,
            ].join(`\n`),
          ),
        ),
      ),
    );
  });
  it('should return added Order enum when change options', () => {
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
                name: 'hoge',
              },
              orderByIgnoreDirective: {
                name: 'ignore',
              },
              orderByArgument: {
                name: 'arg',
                isList: false,
              },
              orderType: {
                suffix: 'Changed',
              },
              supportOrderableTypes: ['Date'],
            },
          ).genOrderTypes(),
        ),
      ),
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(
            [
              `scalar Date`,
              `type Test { id: ID, name: String, date: Date }`,
              `type Query { tests (arg: TestChanged ): [Test]}`,
              `
              """
              Sort the results in ascending or descending order
              """
              enum OrderDirection {
                """
                Sort the results in ascending order
                """
                ASC
                """
                Sort the results in descending order
                """
                DESC
              }
              `,
              `
              """
              Properties by which Test can be ordered.
              """
              enum TestOrderField {
                """
                Order Test by id
                """
                id
                """
                Order Test by date
                """
                date
              }
              `,
              `
              """
              Ordering options for Test
              """
              input TestChanged {
                """
                The field to order Test by.
                """
                field: TestOrderField
                """
                The ordering direction.
                """
                direction: OrderDirection
              }
              `,
            ].join(`\n`),
          ),
        ),
      ),
    );
  });

  it('should return added Order enum', () => {
    expect(
      printSchema(
        buildASTSchema(
          new GenOrderTypesService(
            [
              `type Test { id: ID, name: String @ignore }`,
              `type Query { tests: [[Test!]]! @hoge}`,
            ].join(`\n`),
            {
              orderByDirective: {
                name: 'hoge',
              },
              orderByIgnoreDirective: {
                name: 'ignore',
              },
              orderByArgument: {
                name: 'arg',
              },
              orderType: {
                prefix: 'Prefix',
                suffix: 'Changed',
                fieldName: '_sort',
                directionName: '_direction',
              },
              orderDirection: {
                ascName: 'TOP',
                descName: 'BOTTOM',
                typeName: 'Position',
              },
              orderFieldEnum: {
                prefix: 'Prefix',
                suffix: 'Suffix',
              },
            },
          ).genOrderTypes(),
        ),
      ),
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(
            [
              `type Test { id: ID, name: String }`,
              `type Query { tests (arg: [PrefixTestChanged] ): [[Test!]]!}`,
              `
              """
              Sort the results in ascending or descending order
              """
              enum Position {
                """
                Sort the results in ascending order
                """
                TOP
                """
                Sort the results in descending order
                """
                BOTTOM
              }
              `,
              `
              """
              Properties by which Test can be ordered.
              """
              enum PrefixTestSuffix {
                """
                Order Test by id
                """
                id
              }
              `,
              `
              """
              Ordering options for Test
              """
              input PrefixTestChanged {
                """
                The field to order Test by.
                """
                _sort: PrefixTestSuffix
                """
                The ordering direction.
                """
                _direction: Position
              }
              `,
            ].join(`\n`),
          ),
        ),
      ),
    );
  });

  it('should support union type', () => {
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
            [
              `type Test1 { id: ID, name: String! }`,
              `type Test2 { id: ID, age: Int! }`,
              `union Test = Test1 | Test2`,
              `type Query { tests (orderBy: [TestOrder] ): [Test]}`,
              `
              """
              Sort the results in ascending or descending order
              """
              enum OrderDirection {
                """
                Sort the results in ascending order
                """
                ASC
                """
                Sort the results in descending order
                """
                DESC
              }
              `,
              `
              """
              Properties by which Test can be ordered.
              """
              enum TestOrderField {
                """
                Order Test by id
                """
                id
                """
                Order Test by name
                """
                name
                """
                Order Test by age
                """
                age
              }
              `,
              `
              """
              Ordering options for Test
              """
              input TestOrder {
                """
                The field to order Test by.
                """
                field: TestOrderField
                """
                The ordering direction.
                """
                direction: OrderDirection
              }
              `,
            ].join(`\n`),
          ),
        ),
      ),
    );
  });
});
