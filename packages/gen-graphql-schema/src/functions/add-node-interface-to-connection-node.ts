import { DocumentNode } from 'graphql';

export const addNodeInterfaceToConnectionNode = (
  documentNode: DocumentNode,
  connectionNames: string[],
): DocumentNode => {
  for (const definition of documentNode.definitions) {
    if (definition.kind === 'ObjectTypeDefinition') {
      if (connectionNames.includes(definition.name.value)) {
        Reflect.set(definition, 'interfaces', [
          ...(definition.interfaces || []),
          { kind: 'NamedType', name: { kind: 'Name', value: 'Node' } },
        ]);
      }
    }
  }
  return documentNode;
};
