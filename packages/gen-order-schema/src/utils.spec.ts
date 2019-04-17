import { parse } from 'graphql';
import {
  getDirectives,
  getFieldDefinitions,
  getObjectTypeDefinitions,
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
});
