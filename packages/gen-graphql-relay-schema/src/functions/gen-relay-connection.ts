import { DefinitionNode, DocumentNode, FieldDefinitionNode } from 'graphql';
import { hasRelayDirective } from './has-relay-directive';
import {
  genRelayDefinitions,
  relayCommonDefinitions,
} from './relay-definitions';
import { replaceTypeWithConnection } from './replace-type-with-connection';

export const genRelayConnection = (
  documentNode: DocumentNode,
): [DocumentNode, string[]] => {
  let hasRelayConnection = false;
  const connectionMap: Map<string, DefinitionNode[]> = new Map<
    string,
    DefinitionNode[]
  >();
  for (const definition of documentNode.definitions) {
    if (definition.kind === 'ObjectTypeDefinition') {
      if (Array.isArray(definition.fields)) {
        for (const field of definition.fields as FieldDefinitionNode[]) {
          if (
            Array.isArray(field.directives) &&
            hasRelayDirective(field.directives)
          ) {
            hasRelayConnection = true;
            let connectionNodeName = '';
            if (field.type.kind === 'ListType') {
              if (field.type.type.kind === 'NamedType') {
                connectionNodeName = `${field.type.type.name.value}`;
                connectionMap.set(
                  connectionNodeName,
                  genRelayDefinitions(field.type.type.name.value),
                );
              }
            }
            replaceTypeWithConnection(field, connectionNodeName);
          }
        }
      }
    }
  }

  if (hasRelayConnection) {
    const connections = Array.prototype.concat.apply(
      [],
      [...connectionMap.values()],
    );
    Reflect.set(documentNode, 'definitions', [
      ...documentNode.definitions,
      ...relayCommonDefinitions,
      ...connections,
    ]);
  }
  return [documentNode, [...connectionMap.keys()]];
};
