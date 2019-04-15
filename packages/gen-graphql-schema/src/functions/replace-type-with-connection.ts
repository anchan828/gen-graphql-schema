import { FieldDefinitionNode, InputValueDefinitionNode } from 'graphql';
import { isRelayAndHasRelayArgmentDirective } from '../utils';

export const replaceTypeWithConnection = (
  field: FieldDefinitionNode,
  connectionNodeName: string | undefined,
): void => {
  if (!connectionNodeName) {
    return;
  }
  Reflect.set(field, 'type', {
    kind: 'NamedType',
    name: {
      kind: 'Name',
      value: `${connectionNodeName}Connection`,
    },
  });

  const connectionArguments = [
    ...(field.arguments || []),
    ...connectionBaseArguments,
  ];

  if (
    field.directives!.findIndex(directive =>
      isRelayAndHasRelayArgmentDirective('order', directive),
    ) !== -1
  ) {
    connectionArguments.push(getOrderArgument(connectionNodeName));
  }

  if (
    field.directives!.findIndex(directive =>
      isRelayAndHasRelayArgmentDirective('where', directive),
    ) !== -1
  ) {
    connectionArguments.push(getWhereArgument(connectionNodeName));
  }

  Reflect.set(field, 'arguments', connectionArguments);
};
const getOrderArgument = (
  connectionNodeName: string,
): InputValueDefinitionNode => {
  return {
    kind: 'InputValueDefinition',
    name: {
      kind: 'Name',
      value: 'orderBy',
    },
    type: {
      kind: 'ListType',
      type: {
        kind: 'NamedType',
        name: {
          kind: 'Name',
          value: `${connectionNodeName}NodeOrder`,
        },
      },
    },
    directives: [],
  };
};
const getWhereArgument = (
  connectionNodeName: string,
): InputValueDefinitionNode => {
  return {
    kind: 'InputValueDefinition',
    name: {
      kind: 'Name',
      value: 'where',
    },
    type: {
      kind: 'NamedType',
      name: {
        kind: 'Name',
        value: `${connectionNodeName}NodeWhere`,
      },
    },
    directives: [],
  };
};
const connectionBaseArguments: InputValueDefinitionNode[] = [
  {
    kind: 'InputValueDefinition',
    name: {
      kind: 'Name',
      value: 'before',
    },
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
    kind: 'InputValueDefinition',
    name: {
      kind: 'Name',
      value: 'after',
    },
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
    kind: 'InputValueDefinition',
    name: {
      kind: 'Name',
      value: 'first',
    },
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
    kind: 'InputValueDefinition',
    name: {
      kind: 'Name',
      value: 'last',
    },
    type: {
      kind: 'NamedType',
      name: {
        kind: 'Name',
        value: 'Int',
      },
    },
    directives: [],
  },
];
