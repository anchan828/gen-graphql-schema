import { getObjectTypeDefinitions } from '@anchan828/gen-graphql-schema-common';
import {
  DocumentNode,
  InterfaceTypeDefinitionNode,
  parse,
  StringValueNode,
} from 'graphql';
type TypeName = string;
type Description = string;
export class MergeSchemaService {
  private descriptionMap: Map<TypeName, Description> = new Map<
    TypeName,
    Description
  >();

  private interfaceMap: Map<TypeName, InterfaceTypeDefinitionNode[]> = new Map<
    TypeName,
    InterfaceTypeDefinitionNode[]
  >();

  public cache(type: string | DocumentNode): void {
    if (typeof type === 'string') {
      type = parse(type);
    }
    this.cacheDescriptions(type);
    this.cacheInterfaces(type);
  }
  public apply(type: DocumentNode): void {
    this.applyDescriptions(type);
    this.applyInterfaces(type);
  }
  private cacheInterfaces(type: DocumentNode): void {
    for (const definition of getObjectTypeDefinitions(type)) {
      if (!Array.isArray(definition.interfaces)) {
        continue;
      }
      if (!this.interfaceMap.has(definition.name.value)) {
        this.interfaceMap.set(definition.name.value, []);
      }

      const cachedInterfaces = this.interfaceMap.get(definition.name.value)!;

      for (const interfaceDefinition of definition.interfaces) {
        if (
          !cachedInterfaces.find(
            ci => interfaceDefinition.name.value === ci.name.value,
          )
        ) {
          cachedInterfaces.push(interfaceDefinition);
        }
      }
      this.interfaceMap.set(definition.name.value, cachedInterfaces);
    }
  }
  private cacheDescriptions(type: DocumentNode): void {
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

  public applyDescriptions(type: DocumentNode): void {
    for (const definition of getObjectTypeDefinitions(type)) {
      if (this.descriptionMap.has(definition.name.value)) {
        Reflect.set(definition, 'description', {
          kind: 'StringValue',
          value: this.descriptionMap.get(definition.name.value),
        } as StringValueNode);
      }
    }
  }
  public applyInterfaces(type: DocumentNode): void {
    for (const definition of getObjectTypeDefinitions(type)) {
      if (this.interfaceMap.has(definition.name.value)) {
        const interfaces = Object.assign(
          [],
          definition.interfaces || [],
        ) as InterfaceTypeDefinitionNode[];
        const cachedInterfaces = this.interfaceMap.get(definition.name.value);
        if (!Array.isArray(cachedInterfaces)) {
          continue;
        }
        for (const cachedInterface of cachedInterfaces) {
          if (
            !interfaces.find(
              (i: InterfaceTypeDefinitionNode) =>
                i.name.value === cachedInterface.name.value,
            )
          ) {
            interfaces.push(cachedInterface);
          }
        }

        Reflect.set(definition, 'interfaces', interfaces);
      }
    }
  }
}
