import { DirectiveNode, DocumentNode, FieldDefinitionNode } from 'graphql';
import {
  basicTypeNames,
  getDefinition,
  getFieldNameAndType,
  isEnumType,
  isRelayAndHasRelayArgmentDirective,
} from '../utils';
import { getOrderDefinitions } from './order-definitions';

export const genOrderField = (documentNode: DocumentNode): DocumentNode => {
  const connectionNames = getConnectionNamesHasOrder(documentNode);

  for (const connectionName of connectionNames) {
    const definition = getDefinition(documentNode, connectionName);

    if (!definition) {
      continue;
    }

    const fieldNames = getFieldNameAndType(definition)
      .filter(x => !x.isList)
      .filter(
        x =>
          basicTypeNames.includes(x.type) || isEnumType(documentNode, x.type),
      );
    Reflect.set(documentNode, 'definitions', [
      ...documentNode.definitions,
      getOrderDefinitions(connectionName, fieldNames.map(x => x.name)),
    ]);
  }

  return documentNode;
};

const getConnectionNamesHasOrder = (documentNode: DocumentNode): string[] => {
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
              isRelayAndHasRelayArgmentDirective('order', directive) &&
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
