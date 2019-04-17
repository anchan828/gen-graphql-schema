import { parse } from 'graphql';
import {
  getDirectives,
  getEnumTypeDefinitions,
  getFieldDefinitions,
  getFieldDefinitionsByDirective,
  getFieldTypeName,
  getObjectTypeDefinitions,
  isBasicType,
  isEnumType,
} from './utils';

describe('util', () => {
  describe('getObjectTypeDefinitions', () => {
    it('should return empty array', () => {
      expect(
        getObjectTypeDefinitions(
          parse(`enum Test {
          A
      }`),
        ),
      ).toHaveLength(0);
    });

    it('should return array', () => {
      expect(
        getObjectTypeDefinitions(
          parse(`type Test {
            A: ID
        }`),
        ),
      ).toHaveLength(1);
    });
  });

  describe('getEnumTypeDefinitions', () => {
    it('should return empty array', () => {
      expect(
        getEnumTypeDefinitions(
          parse(`type Test {
            A: ID
        }`),
        ),
      ).toHaveLength(0);
    });

    it('should return array', () => {
      expect(
        getEnumTypeDefinitions(
          parse(`enum Test {
          A
      }`),
        ),
      ).toHaveLength(1);
    });
  });

  describe('getFieldDefinitions', () => {
    it('should return array', () => {
      expect(
        getFieldDefinitions(
          getObjectTypeDefinitions(
            parse(`type Test {
            A: ID
        }`),
          )[0],
        ),
      ).toHaveLength(1);
    });
  });

  describe('getDirectives', () => {
    it('should return empty array', () => {
      expect(
        getDirectives(
          getFieldDefinitions(
            getObjectTypeDefinitions(
              parse(`type Test {
              A: ID
          }`),
            )[0],
          )[0],
        ),
      ).toHaveLength(0);
    });
    it('should return empty array', () => {
      const field = getFieldDefinitions(
        getObjectTypeDefinitions(
          parse(`type Test {
                A: ID
            }`),
        )[0],
      )[0];
      Reflect.set(field, 'directives', undefined);
      expect(getDirectives(field)).toHaveLength(0);
    });

    it('should return empty array', () => {
      expect(
        getDirectives(
          getFieldDefinitions(
            getObjectTypeDefinitions(
              parse(`type Test {
                A: ID @test
            }`),
            )[0],
          )[0],
        ),
      ).toHaveLength(1);
    });
  });

  describe('isBasicType', () => {
    it.each(['String', 'Int', 'Float', 'Boolean', 'ID'])(
      'should return true when %s',
      typeName => {
        expect(isBasicType(typeName)).toBeTruthy();
      },
    );

    it.each(['Date', 'Custom', 'Value', 'Hoge'])(
      'should return false when %s',
      typeName => {
        expect(isBasicType(typeName)).toBeFalsy();
      },
    );
  });

  describe('isEnumType', () => {
    it('should return true', () => {
      expect(
        isEnumType(
          parse(
            `enum Test {
          A
      }`,
          ),
          'Test',
        ),
      ).toBeTruthy();
    });
    it('should return false', () => {
      expect(
        isEnumType(
          parse(
            `type Test {
          A: ID
      }`,
          ),
          'Test',
        ),
      ).toBeFalsy();
    });
  });

  describe('getFieldTypeName', () => {
    it('should get name', () => {
      const type = getObjectTypeDefinitions(
        parse(`type Test {
          A: ID
          B: [String]
          C: Int!
          D: [[Boolean]]
          E: [[String]]!
          F: [[String]!]
      }`),
      )[0];
      const fields = getFieldDefinitions(type);
      expect(getFieldTypeName(fields[0])).toEqual({
        name: 'ID',
        isList: false,
      });
      expect(getFieldTypeName(fields[1])).toEqual({
        name: 'String',
        isList: true,
      });

      expect(getFieldTypeName(fields[2])).toEqual({
        name: 'Int',
        isList: false,
      });

      expect(getFieldTypeName(fields[3])).toEqual({
        name: 'Boolean',
        isList: true,
      });

      expect(getFieldTypeName(fields[4])).toEqual({
        name: 'String',
        isList: true,
      });

      expect(getFieldTypeName(fields[5])).toEqual({
        name: 'String',
        isList: true,
      });
    });
  });

  describe('getFieldDefinitionsByDirective', () => {
    it('should return empty array when no has directive', () => {
      expect(
        getFieldDefinitionsByDirective(
          parse(
            `type Test {
    A: ID
}`,
          ),
          'test',
        ),
      ).toHaveLength(0);
    });

    it('should return empty array when basic type has directive', () => {
      expect(
        getFieldDefinitionsByDirective(
          parse([`type Query { test: [ID] @test }`].join('\n')),
          'test',
        ),
      ).toHaveLength(0);
    });

    it('should return array when has directive', () => {
      expect(
        getFieldDefinitionsByDirective(
          parse(
            [`type Test { A: ID }`, `type Query { test: [Test] @test }`].join(
              '\n',
            ),
          ),
          'test',
        ),
      ).toHaveLength(1);
    });
    it('should return empty array when non list type has directive', () => {
      expect(
        getFieldDefinitionsByDirective(
          parse(
            [`type Test { A: ID }`, `type Query { test: Test @test }`].join(
              '\n',
            ),
          ),
          'test',
        ),
      ).toHaveLength(0);
    });
  });
});
