import { DirectiveNode, DocumentNode, FieldDefinitionNode } from 'graphql';
import {
  getDefinition,
  getFieldNameAndType,
  isRelayAndHasRelayArgmentDirective,
} from '../utils';
import { getwhereDefinitions } from './where-definitions';

export const genWhereField = (documentNode: DocumentNode): DocumentNode => {
  const connectionNames = getConnectionNamesHasWhere(documentNode);
  for (const connectionName of connectionNames) {
    const definition = getDefinition(documentNode, connectionName);

    if (!definition) {
      continue;
    }

    const fieldNameAndType = getFieldNameAndType(definition);
    Reflect.set(documentNode, 'definitions', [
      ...documentNode.definitions,
      getwhereDefinitions(connectionName, fieldNameAndType),
    ]);
  }
  return documentNode;
};

const getConnectionNamesHasWhere = (documentNode: DocumentNode): string[] => {
  const connectionNames: string[] = [];
  for (const definition of documentNode.definitions) {
    if (definition.kind === 'ObjectTypeDefinition') {
      if (Array.isArray(definition.fields)) {
        for (const field of definition.fields as FieldDefinitionNode[]) {
          if (!Array.isArray(field.directives)) {
            continue;
          }

          for (const directive of field.directives as DirectiveNode[]) {
            if (
              isRelayAndHasRelayArgmentDirective('where', directive) &&
              field.type.kind === 'NamedType'
            ) {
              connectionNames.push(
                field.type.name.value.replace(/Connection$/, ''),
              );
            }
          }
        }
      }
    }
  }
  return connectionNames;
};
