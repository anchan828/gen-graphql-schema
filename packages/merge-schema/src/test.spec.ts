import { mergeTypes } from './index';

describe('mergeTypes', () => {
  it('should merge types', () => {
    const types = [`type Test {id: ID}`, `type Test2 {id: ID}`];
    expect(mergeTypes(types)).toMatchSnapshot();
  });
  it('should work orderBy directive', () => {
    const types = [`type Test {id: ID}`, `type Test2 {tests: [Test] @orderBy}`];
    expect(mergeTypes(types)).toMatchSnapshot();
  });
  it('should work where directive', () => {
    const types = [`type Test {id: ID}`, `type Test2 {tests: [Test] @where }`];
    expect(mergeTypes(types)).toMatchSnapshot();
  });
  it('should work relay directive', () => {
    const types = [`type Test {id: ID}`, `type Test2 {tests: [Test] @relay }`];

    expect(mergeTypes(types)).toMatchSnapshot();
  });
  it('should work orderBy, where, and relay directive', () => {
    const types = [
      `type Test {id: ID}`,
      `type Test2 {tests: [Test] @orderBy @where @relay }`,
    ];
    expect(mergeTypes(types)).toMatchSnapshot();
  });
});
