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
              `enum OrderDirection { ASC, DESC }`,
              `enum TestSort { ID }`,
              `type TestOrder { sort: TestSort, direction: OrderDirection }`,
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
              `enum OrderDirection { ASC, DESC }`,
              `enum Test2Sort { ID }`,
              `type Test2Order { sort: Test2Sort, direction: OrderDirection }`,
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
              `enum OrderDirection { ASC, DESC }`,
              `enum TestSort { ID, DATE }`,
              `type TestChanged { sort: TestSort, direction: OrderDirection }`,
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
                sortName: '_sort',
                directionName: '_direction',
              },
              orderDirection: {
                ascName: 'TOP',
                descName: 'BOTTOM',
                typeName: 'Position',
              },
              sortEnum: {
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
              `enum Position { TOP, BOTTOM }`,
              `enum PrefixTestSuffix { ID }`,
              `type PrefixTestChanged { _sort: PrefixTestSuffix, _direction: Position }`,
            ].join(`\n`),
          ),
        ),
      ),
    );
  });
});
