/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  appendDefinitionToDocumentNode,
  getDefinitionByName,
  getDirectives,
  getFieldDefinitionsByDirective,
  getFieldTypeName,
  getObjectTypeDefinitionsFromUnion,
  hasDirectiveInDocumentNode,
  isUnionType,
} from "@anchan828/gen-graphql-schema-common";
import * as deepmerge from "deepmerge";
import {
  DocumentNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  Kind,
  NamedTypeNode,
  ObjectTypeDefinitionNode,
  parse,
  TypeDefinitionNode,
  TypeNode,
} from "graphql";
import { DEFAULT_OPTIONS, DESCRIPTIONS } from "./constants";
import { GenRelayTypesOptions } from "./options";
export class GenRelayTypesService {
  public genRelayTypes(): DocumentNode {
    if (!hasDirectiveInDocumentNode(this.documentNode, this.options.relayDirective!.name!)) {
      return this.documentNode;
    }
    this.genRelayDifinitions();

    const fields = getFieldDefinitionsByDirective(this.documentNode, this.options.relayDirective!.name!).filter(
      (field) => field.type.kind === "ListType",
    );

    for (const field of fields) {
      if (field.type.kind === "NamedType") {
        continue;
      }
      const filedType = getFieldTypeName(field);

      if (
        this.options &&
        this.options.relayCnnectionType &&
        this.options.relayCnnectionType.prefix &&
        filedType.name.startsWith(this.options.relayCnnectionType.prefix)
      ) {
        continue;
      }

      if (
        this.options &&
        this.options.relayCnnectionType &&
        this.options.relayCnnectionType.suffix &&
        filedType.name.endsWith(this.options.relayCnnectionType.suffix)
      ) {
        continue;
      }

      this.addNodeInterface(filedType.name);
      this.genEdgeType(filedType.name);
      this.genConnectionType(filedType.name);
      this.replaceConnectionType(filedType.name, field);
      this.removeRelayDirective(field);
    }
    return this.documentNode;
  }

  private getEdgeTypeName(fieldTypeName: string): string {
    return `${this.options.relayEdgeType!.prefix!}${fieldTypeName}${this.options.relayEdgeType!.suffix}`;
  }

  private getConnectionTypeName(fieldTypeName: string): string {
    return `${this.options.relayCnnectionType!.prefix!}${fieldTypeName}${this.options.relayCnnectionType!.suffix}`;
  }

  private replaceConnectionType(fieldTypeName: string, field: FieldDefinitionNode): void {
    Reflect.set(field, "type", {
      kind: Kind.NON_NULL_TYPE,
      type: {
        kind: Kind.NAMED_TYPE,
        name: {
          kind: Kind.NAME,
          value: this.getConnectionTypeName(fieldTypeName),
        },
      },
    } as TypeNode);
    // before: String, after: String, first: Int, last: Int
    Reflect.set(field, "arguments", [
      ...(field.arguments || []),
      {
        kind: Kind.INPUT_VALUE_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: "before",
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: "String",
          },
        },
      },
      {
        kind: Kind.INPUT_VALUE_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: "after",
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: "String",
          },
        },
      },
      {
        kind: Kind.INPUT_VALUE_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: "first",
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: "Int",
          },
        },
      },
      {
        kind: Kind.INPUT_VALUE_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: "last",
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: "Int",
          },
        },
      },
    ] as InputValueDefinitionNode[]);
  }

  private genEdgeType(fieldTypeName: string): void {
    if (getDefinitionByName(this.documentNode, this.getEdgeTypeName(fieldTypeName))) {
      return;
    }
    const edgeDefinition = {
      kind: Kind.OBJECT_TYPE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: this.getEdgeTypeName(fieldTypeName),
      },
      description: {
        kind: Kind.STRING,
        value: DESCRIPTIONS.EDGE_TYPE.TYPE(this.getConnectionTypeName(fieldTypeName)),
      },
    } as ObjectTypeDefinitionNode;
    Reflect.set(edgeDefinition, "fields", [
      {
        kind: Kind.FIELD_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: "node",
        },
        description: {
          kind: Kind.STRING,
          value: DESCRIPTIONS.EDGE_TYPE.NODE,
        },
        type: {
          kind: Kind.NON_NULL_TYPE,
          type: {
            kind: Kind.NAMED_TYPE,
            name: {
              kind: Kind.NAME,
              value: fieldTypeName,
            },
          },
        },
      },
      {
        kind: Kind.FIELD_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: "cursor",
        },
        description: {
          kind: Kind.STRING,
          value: DESCRIPTIONS.EDGE_INTERFACE.CURSOR,
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: "String",
          },
        },
      },
    ] as FieldDefinitionNode[]);
    Reflect.set(edgeDefinition, "interfaces", [
      {
        kind: Kind.INTERFACE_TYPE_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: this.options.relayEdgeInterface!.name!,
        },
      },
    ]);
    appendDefinitionToDocumentNode(this.documentNode, edgeDefinition);
  }

  private genConnectionType(fieldTypeName: string): void {
    if (getDefinitionByName(this.documentNode, this.getConnectionTypeName(fieldTypeName))) {
      return;
    }
    const connectionDefinition = {
      kind: Kind.OBJECT_TYPE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: this.getConnectionTypeName(fieldTypeName),
      },
      description: {
        kind: Kind.STRING,
        value: DESCRIPTIONS.CONNECTION_TYPE.TYPE(fieldTypeName),
      },
    } as ObjectTypeDefinitionNode;

    Reflect.set(connectionDefinition, "fields", [
      {
        kind: Kind.FIELD_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: "totalCount",
        },
        description: {
          kind: Kind.STRING,
          value: DESCRIPTIONS.CONNECTION_TYPE.TOTAL_COUNT(fieldTypeName),
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: this.options.relayCnnectionInterface!.totalCountType,
          },
        },
      },
      {
        kind: Kind.FIELD_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: "edges",
        },
        description: {
          kind: Kind.STRING,
          value: DESCRIPTIONS.CONNECTION_TYPE.EDGES(this.getEdgeTypeName(fieldTypeName)),
        },
        type: {
          kind: Kind.LIST_TYPE,
          type: {
            kind: Kind.NAMED_TYPE,
            name: {
              kind: Kind.NAME,
              value: this.getEdgeTypeName(fieldTypeName),
            },
          },
        },
      },
      {
        kind: Kind.FIELD_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: "pageInfo",
        },
        description: {
          kind: Kind.STRING,
          value: DESCRIPTIONS.CONNECTION_INTERFACE.PAGE_INFO,
        },
        type: {
          kind: Kind.NON_NULL_TYPE,
          type: {
            kind: Kind.NAMED_TYPE,
            name: {
              kind: Kind.NAME,
              value: this.options.relayPageInfoType!.name!,
            },
          },
        },
      },
    ] as FieldDefinitionNode[]);
    Reflect.set(connectionDefinition, "interfaces", [
      {
        kind: Kind.INTERFACE_TYPE_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: this.options.relayCnnectionInterface!.name!,
        },
      },
    ]);
    appendDefinitionToDocumentNode(this.documentNode, connectionDefinition);
  }

  private addNodeInterface(fieldTypeName: string): void {
    const definition = getDefinitionByName(this.documentNode, fieldTypeName) as ObjectTypeDefinitionNode;
    const filedTypes: ObjectTypeDefinitionNode[] = [];
    if (isUnionType(definition)) {
      filedTypes.push(...getObjectTypeDefinitionsFromUnion(this.documentNode, definition));
    } else {
      filedTypes.push(definition);
    }
    for (const fieldType of filedTypes) {
      if (!fieldType || this.hasInterface(fieldType, this.options.relayNodeInterface!.name!)) {
        continue;
      }

      Reflect.set(fieldType, "interfaces", [
        ...(fieldType.interfaces || []),
        {
          kind: Kind.INTERFACE_TYPE_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: "Node",
          },
        } as InterfaceTypeDefinitionNode,
      ]);
    }
  }

  private hasInterface(definition: ObjectTypeDefinitionNode, interfaceName: string): boolean {
    return (
      Array.isArray(definition.interfaces) &&
      definition.interfaces.some((i: NamedTypeNode) => i.name.value === interfaceName)
    );
  }

  private removeRelayDirective(field: FieldDefinitionNode): void {
    const directives = getDirectives(field);
    Reflect.set(
      field,
      "directives",
      directives.filter((directive) => directive.name.value !== this.options.relayDirective!.name!),
    );
  }

  private genRelayDifinitions(): void {
    const difinitions: TypeDefinitionNode[] = [];
    if (!getDefinitionByName(this.documentNode, this.options.relayNodeInterface!.name!)) {
      difinitions.push({
        kind: Kind.INTERFACE_TYPE_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: this.options.relayNodeInterface!.name,
        },
        description: {
          kind: Kind.STRING,
          value: DESCRIPTIONS.NODE_INTERFACE.INTERFACE,
        },
        fields: [
          {
            kind: Kind.FIELD_DEFINITION,
            name: {
              kind: Kind.NAME,
              value: this.options.relayNodeInterface!.idFieldName,
            },
            description: {
              kind: Kind.STRING,
              value: DESCRIPTIONS.NODE_INTERFACE.ID,
            },
            type: {
              kind: Kind.NON_NULL_TYPE,
              type: {
                kind: Kind.NAMED_TYPE,
                name: {
                  kind: Kind.NAME,
                  value: "ID",
                },
              },
            },
          },
        ],
      } as InterfaceTypeDefinitionNode);
    }
    if (!getDefinitionByName(this.documentNode, this.options.relayEdgeInterface!.name!)) {
      difinitions.push({
        kind: Kind.INTERFACE_TYPE_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: this.options.relayEdgeInterface!.name,
        },
        description: {
          kind: Kind.STRING,
          value: DESCRIPTIONS.EDGE_INTERFACE.INTERFACE,
        },
        fields: [
          {
            kind: Kind.FIELD_DEFINITION,
            name: {
              kind: Kind.NAME,
              value: "cursor",
            },
            description: {
              kind: Kind.STRING,
              value: DESCRIPTIONS.EDGE_INTERFACE.CURSOR,
            },
            type: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: "String",
              },
            },
          },
        ],
      } as InterfaceTypeDefinitionNode);
    }
    if (!getDefinitionByName(this.documentNode, this.options.relayCnnectionInterface!.name!)) {
      difinitions.push({
        kind: Kind.INTERFACE_TYPE_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: this.options.relayCnnectionInterface!.name!,
        },
        description: {
          kind: Kind.STRING,
          value: DESCRIPTIONS.CONNECTION_INTERFACE.INTERFACE,
        },
        fields: [
          {
            kind: Kind.FIELD_DEFINITION,
            name: {
              kind: Kind.NAME,
              value: "totalCount",
            },
            description: {
              kind: Kind.STRING,
              value: DESCRIPTIONS.CONNECTION_INTERFACE.TOTAL_COUNT,
            },
            type: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: this.options.relayCnnectionInterface!.totalCountType,
              },
            },
          },
          {
            kind: Kind.FIELD_DEFINITION,
            name: {
              kind: Kind.NAME,
              value: "pageInfo",
            },
            description: {
              kind: Kind.STRING,
              value: DESCRIPTIONS.CONNECTION_INTERFACE.PAGE_INFO,
            },
            type: {
              kind: Kind.NON_NULL_TYPE,
              type: {
                kind: Kind.NAMED_TYPE,
                name: {
                  kind: Kind.NAME,
                  value: this.options.relayPageInfoType!.name!,
                },
              },
            },
          },
          {
            kind: Kind.FIELD_DEFINITION,
            name: {
              kind: Kind.NAME,
              value: "edges",
            },
            description: {
              kind: Kind.STRING,
              value: DESCRIPTIONS.CONNECTION_INTERFACE.EDGES,
            },
            type: {
              kind: Kind.LIST_TYPE,
              type: {
                kind: Kind.NAMED_TYPE,
                name: {
                  kind: Kind.NAME,
                  value: this.options.relayEdgeInterface!.name!,
                },
              },
            },
          },
        ],
      } as InterfaceTypeDefinitionNode);
    }
    if (!getDefinitionByName(this.documentNode, this.options.relayPageInfoType!.name!)) {
      difinitions.push({
        kind: Kind.OBJECT_TYPE_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: this.options.relayPageInfoType!.name!,
        },
        description: {
          kind: Kind.STRING,
          value: DESCRIPTIONS.PAGE_INFO_TYPE.TYPE,
        },
        fields: [
          {
            kind: Kind.FIELD_DEFINITION,
            name: {
              kind: Kind.NAME,
              value: "startCursor",
            },
            description: {
              kind: Kind.STRING,
              value: DESCRIPTIONS.PAGE_INFO_TYPE.START_CURSOR,
            },
            type: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: "String",
              },
            },
          },
          {
            kind: Kind.FIELD_DEFINITION,
            name: {
              kind: Kind.NAME,
              value: "endCursor",
            },
            description: {
              kind: Kind.STRING,
              value: DESCRIPTIONS.PAGE_INFO_TYPE.END_CURSOR,
            },
            type: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: "String",
              },
            },
          },
          {
            kind: Kind.FIELD_DEFINITION,
            name: {
              kind: Kind.NAME,
              value: "hasNextPage",
            },
            description: {
              kind: Kind.STRING,
              value: DESCRIPTIONS.PAGE_INFO_TYPE.HAS_NEXT_PAGE,
            },
            type: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: "Boolean",
              },
            },
          },
          {
            kind: Kind.FIELD_DEFINITION,
            name: {
              kind: Kind.NAME,
              value: "hasPreviousPage",
            },
            description: {
              kind: Kind.STRING,
              value: DESCRIPTIONS.PAGE_INFO_TYPE.HAS_PREVIOUS_PAGE,
            },
            type: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: "Boolean",
              },
            },
          },
        ],
      } as ObjectTypeDefinitionNode);
    }
    appendDefinitionToDocumentNode(this.documentNode, ...difinitions);
  }

  private readonly documentNode: DocumentNode;

  constructor(readonly types: string | DocumentNode, private readonly options: GenRelayTypesOptions = {}) {
    this.options = deepmerge(DEFAULT_OPTIONS, options);
    this.documentNode = typeof types === "string" ? parse(types) : types;
  }
}
