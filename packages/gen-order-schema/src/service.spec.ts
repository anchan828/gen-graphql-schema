import { buildASTSchema, parse, printSchema } from 'graphql';
import { GenOrderTypesService } from './service';

describe('GenOrderTypesService', () => {
  it('should return same schema when no orderBy directive', () => {
    const types = `type Test { id: ID }`;
    expect(new GenOrderTypesService(types).genOrderTypes()).toEqual(
      printSchema(buildASTSchema(parse(types))),
    );
  });

  it('should return added Order enum when has orderBy directive', () => {
    expect(
      new GenOrderTypesService(
        [`type Test { id: ID }`, `type Query { tests: [Test] @orderBy}`].join(
          `\n`,
        ),
      ).genOrderTypes(),
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(
            [
              `type Test { id: ID }`,
              `type Query { tests (orderBy: [TestOrder] ): [Test]}`,
              `enum TestOrder { id_ASC, id_DESC }`,
            ].join(`\n`),
          ),
        ),
      ),
    );
  });

  it('should ignore object type in enum', () => {
    expect(
      new GenOrderTypesService(
        [
          `type Test1 { id: ID }`,
          `type Test2 { id: ID, test: Test1 }`,
          `type Query { tests: [Test2] @orderBy}`,
        ].join(`\n`),
      ).genOrderTypes(),
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(
            [
              `type Test1 { id: ID }`,
              `type Test2 { id: ID, test: Test1 }`,
              `type Query { tests (orderBy: [Test2Order] ): [Test2]}`,
              `enum Test2Order { id_ASC, id_DESC }`,
            ].join(`\n`),
          ),
        ),
      ),
    );
  });
  it('should return added Order enum when change options', () => {
    expect(
      new GenOrderTypesService(
        [
          `scalar Date`,
          `type Test { id: ID, name: String @ignore, date: Date }`,
          `type Query { tests: [Test] @hoge}`,
        ].join(`\n`),
        {
          orderByDirectiveName: 'hoge',
          orderByIgnoreDirectiveName: 'ignore',
          orderByArgumentName: 'arg',
          orderByArgumentTypeIsList: false,
          orderEnumTypeSuffix: 'Changed',
          supportOrderableTypes: ['Date'],
        },
      ).genOrderTypes(),
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(
            [
              `scalar Date`,
              `type Test { id: ID, name: String, date: Date }`,
              `type Query { tests (arg: TestChanged ): [Test]}`,
              `enum TestChanged { id_ASC, id_DESC, date_ASC, date_DESC }`,
            ].join(`\n`),
          ),
        ),
      ),
    );
  });

  it('should return added Order enum', () => {
    expect(
      new GenOrderTypesService(
        [
          `type Test { id: ID, name: String @ignore }`,
          `type Query { tests: [[Test!]]! @hoge}`,
        ].join(`\n`),
        {
          orderByDirectiveName: 'hoge',
          orderByIgnoreDirectiveName: 'ignore',
          orderByArgumentName: 'arg',
          orderEnumTypeSuffix: 'Changed',
        },
      ).genOrderTypes(),
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(
            [
              `type Test { id: ID, name: String }`,
              `type Query { tests (arg: [TestChanged] ): [[Test!]]!}`,
              `enum TestChanged { id_ASC, id_DESC }`,
            ].join(`\n`),
          ),
        ),
      ),
    );
  });
});
