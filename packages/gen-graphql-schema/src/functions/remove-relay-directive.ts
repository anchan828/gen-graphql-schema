import { DocumentNode, FieldDefinitionNode } from 'graphql';
import { isRelayDirective } from '../utils';

export const removeRelayDirective = (
  documentNode: DocumentNode,
): DocumentNode => {
  if (!Array.isArray(documentNode.definitions)) {
    return documentNode;
  }

  for (const definition of documentNode.definitions) {
    if (definition.kind === 'ObjectTypeDefinition') {
      if (!Array.isArray(definition.fields)) {
        continue;
      }
      for (const field of definition.fields as FieldDefinitionNode[]) {
        if (!Array.isArray(field.directives)) {
          continue;
        }

        Reflect.set(
          field,
          'directives',
          field.directives.filter(directive => !isRelayDirective(directive)),
        );
      }
    }
  }
  return documentNode;
};
