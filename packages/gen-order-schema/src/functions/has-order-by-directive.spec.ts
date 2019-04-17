import { GenOrderTypesService } from '../service';

describe('hasOrderDirective', () => {
  it('should be false', () => {
    expect(
      new GenOrderTypesService(`
    type Test {
        id: ID
    }
    `)['hasOrderByDirective'](),
    ).toBeFalsy();
  });

  it('should be true', () => {
    expect(
      new GenOrderTypesService(`
    type Test {
        id: ID
    }

    type Query {
        tests : [Test] @orderBy
    }
    `)['hasOrderByDirective'](),
    ).toBeTruthy();
  });
});
