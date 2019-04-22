import { getObjectTypeDefinitions } from '@anchan828/gen-graphql-schema-common';
import { DocumentNode, parse, StringValueNode } from 'graphql';
type TypeName = string;
type Description = string;
export class MergeSchemaService {
  private descriptionMap: Map<TypeName, Description> = new Map<
    TypeName,
    Description
  >();

  public cacheDescriptions(type: string | DocumentNode): void {
    if (typeof type === 'string') {
      type = parse(type);
    }

    for (const definition of getObjectTypeDefinitions(type)) {
      if (!(definition.description && definition.description.value)) {
        continue;
      }

      let description = definition.description.value;

      if (this.descriptionMap.has(definition.name.value)) {
        description = [
          this.descriptionMap.get(definition.name.value),
          definition.name.value,
        ].join('\n');
      }

      this.descriptionMap.set(definition.name.value, description);
    }
  }

  public setDescriptions(type: DocumentNode): void {
    for (const definition of getObjectTypeDefinitions(type)) {
      if (this.descriptionMap.has(definition.name.value)) {
        Reflect.set(definition, 'description', {
          kind: 'StringValue',
          value: this.descriptionMap.get(definition.name.value),
        } as StringValueNode);
      }
    }
  }
}
