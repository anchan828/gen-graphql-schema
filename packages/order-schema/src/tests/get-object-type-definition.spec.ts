import { parse } from 'graphql';
import { GenOrderTypesService } from '../service';

describe('getObjectTypeDefinition', () => {
  it('should return undefined', () => {
    const types = parse([`type Query { tests: [ID]}`].join('\n'));
    const fields = Array.prototype.concat.apply(
      [],
      types.definitions.map((d: any) => d.fields!),
    );
    for (const field of fields) {
      expect(
        new GenOrderTypesService(types)['getObjectTypeDefinition'](field),
      ).toBeUndefined();
    }
  });

  it('should get ObjectTypeDefinition', () => {
    const types = parse(
      [`type Test { id: ID }`, `type Query { tests: [Test] @orderBy}`].join(
        '\n',
      ),
    );
    const service = new GenOrderTypesService(types);
    const fields = service['getOrderByFieldDefinitions']();
    for (const field of fields) {
      expect(
        new GenOrderTypesService(types)['getObjectTypeDefinition'](field),
      ).toBeDefined();
    }
  });
});
