import { GenOrderTypesService } from '../service';

describe('getOrderFields', () => {
  it('should return empty array', () => {
    expect(
      new GenOrderTypesService(`type Test { id: ID }`)[
        'getOrderByFieldDefinitions'
      ](),
    ).toHaveLength(0);
  });

  it('should return empty array when field type is not ListType', () => {
    expect(
      new GenOrderTypesService(`type Test { id: ID @orderBy }`)[
        'getOrderByFieldDefinitions'
      ](),
    ).toHaveLength(0);
  });

  it('should return empty array when field type is basic types', () => {
    expect(
      new GenOrderTypesService(`type Test { id: [ID] @orderBy }`)[
        'getOrderByFieldDefinitions'
      ](),
    ).toHaveLength(0);
  });
  it('should return array when field type is ListType', () => {
    expect(
      new GenOrderTypesService(
        `type Test { id: ID }\ntype Query { tests: [Test] @orderBy }`,
      )['getOrderByFieldDefinitions'](),
    ).toHaveLength(1);
  });
  it('should return array when field type is ListType in NonNullType', () => {
    expect(
      new GenOrderTypesService(
        `type Test { id: ID }\ntype Query { tests: [Test]! @orderBy }`,
      )['getOrderByFieldDefinitions'](),
    ).toHaveLength(1);
  });
});
