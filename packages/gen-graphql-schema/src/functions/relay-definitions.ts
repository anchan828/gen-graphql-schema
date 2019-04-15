import { DefinitionNode } from 'graphql';

export const genRelayDefinitions = (name: string): any[] => {
  return [
    {
      kind: 'ObjectTypeDefinition',
      name: {
        kind: 'Name',
        value: `${name}Edge`,
      },
      interfaces: [
        {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Edge',
          },
        },
      ],
      directives: [],
      fields: [
        {
          kind: 'FieldDefinition',
          name: {
            kind: 'Name',
            value: 'node',
          },
          arguments: [],
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: name,
            },
          },
          directives: [],
        },
        {
          kind: 'FieldDefinition',
          name: {
            kind: 'Name',
            value: 'cursor',
          },
          arguments: [],
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: 'String',
            },
          },
          directives: [],
        },
      ],
    },
    {
      kind: 'ObjectTypeDefinition',
      name: {
        kind: 'Name',
        value: `${name}Connection`,
      },
      interfaces: [
        {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Connection',
          },
        },
      ],
      directives: [],
      fields: [
        {
          kind: 'FieldDefinition',
          name: {
            kind: 'Name',
            value: 'totalCount',
          },
          arguments: [],
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: 'Int',
            },
          },
          directives: [],
        },
        {
          kind: 'FieldDefinition',
          name: {
            kind: 'Name',
            value: 'edges',
          },
          arguments: [],
          type: {
            kind: 'ListType',
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: `${name}Edge`,
              },
            },
          },
          directives: [],
        },
        {
          kind: 'FieldDefinition',
          name: {
            kind: 'Name',
            value: 'pageInfo',
          },
          arguments: [],
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: 'PageInfo',
                loc: {
                  start: 172,
                  end: 180,
                },
              },
            },
          },
          directives: [],
        },
      ],
    },
  ];
};

export const relayCommonDefinitions: DefinitionNode[] = [
  {
    kind: 'InterfaceTypeDefinition',
    name: {
      kind: 'Name',
      value: 'Connection',
    },
    directives: [],
    fields: [
      {
        kind: 'FieldDefinition',
        name: {
          kind: 'Name',
          value: 'totalCount',
        },
        arguments: [],
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Int',
          },
        },
        directives: [],
      },
      {
        kind: 'FieldDefinition',
        name: {
          kind: 'Name',
          value: 'pageInfo',
        },
        arguments: [],
        type: {
          kind: 'NonNullType',
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: 'PageInfo',
            },
          },
        },
        directives: [],
      },
      {
        kind: 'FieldDefinition',
        name: {
          kind: 'Name',
          value: 'edges',
        },
        arguments: [],
        type: {
          kind: 'ListType',
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: 'Edge',
            },
          },
        },
        directives: [],
      },
    ],
  },
  {
    kind: 'InterfaceTypeDefinition',
    name: {
      kind: 'Name',
      value: 'Node',
    },
    directives: [],
    fields: [
      {
        kind: 'FieldDefinition',
        name: {
          kind: 'Name',
          value: 'id',
        },
        arguments: [],
        type: {
          kind: 'NonNullType',
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: 'ID',
            },
          },
        },
        directives: [],
      },
    ],
  },
  {
    kind: 'InterfaceTypeDefinition',
    name: {
      kind: 'Name',
      value: 'Edge',
    },
    directives: [],
    fields: [
      {
        kind: 'FieldDefinition',
        name: {
          kind: 'Name',
          value: 'cursor',
        },
        arguments: [],
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
        directives: [],
      },
    ],
  },
  {
    kind: 'ObjectTypeDefinition',
    name: {
      kind: 'Name',
      value: 'PageInfo',
    },
    interfaces: [],
    directives: [],
    fields: [
      {
        kind: 'FieldDefinition',
        name: {
          kind: 'Name',
          value: 'startCursor',
        },
        arguments: [],
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
        directives: [],
      },
      {
        kind: 'FieldDefinition',
        name: {
          kind: 'Name',
          value: 'endCursor',
        },
        arguments: [],
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
        directives: [],
      },
      {
        kind: 'FieldDefinition',
        name: {
          kind: 'Name',
          value: 'hasNextPage',
        },
        arguments: [],
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Boolean',
          },
        },
        directives: [],
      },
      {
        kind: 'FieldDefinition',
        name: {
          kind: 'Name',
          value: 'hasPreviousPage',
        },
        arguments: [],
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'Boolean',
          },
        },
        directives: [],
      },
    ],
  },
];
