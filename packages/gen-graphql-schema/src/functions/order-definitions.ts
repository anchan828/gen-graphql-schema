import { EnumTypeDefinitionNode } from 'graphql';

export const getOrderDefinitions = (
  connectionName: string,
  fieldNames: string[],
): EnumTypeDefinitionNode => ({
  kind: 'EnumTypeDefinition',
  name: {
    kind: 'Name',
    value: `${connectionName}NodeOrder`,
  },
  directives: [],
  values: [
    ...Array.prototype.concat.apply(
      [],
      fieldNames.map(propertyName => [
        {
          kind: 'EnumValueDefinition',
          name: {
            kind: 'Name',
            value: `${propertyName}_ASC`,
          },
          directives: [],
        },
        {
          kind: 'EnumValueDefinition',
          name: {
            kind: 'Name',
            value: `${propertyName}_DESC`,
          },
          directives: [],
        },
      ]),
    ),
  ],
});
