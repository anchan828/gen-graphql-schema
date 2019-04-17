import {
  appendDefinitionToDocumentNode,
  getDefinitionByName,
  getDirectives,
  getFieldDefinitionsByDirective,
  getFieldTypeName,
  hasDirectiveInDocumentNode,
} from '@anchan828/gen-graphql-schema-common';
import * as deepmerge from 'deepmerge';
import {
  DocumentNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  InterfaceTypeDefinitionNode,
  ObjectTypeDefinitionNode,
  parse,
  TypeDefinitionNode,
  TypeNode,
} from 'graphql';
import { DEFAULT_OPTIONS } from './constants';
import { GenRelayTypesOptions } from './options';
export class GenRelayTypesService {
  public genRelayTypes(): DocumentNode {
    if (
      !hasDirectiveInDocumentNode(
        this.documentNode,
        this.options.relayDirective!.name!,
      )
    ) {
      return this.documentNode;
    }
    this.genRelayDifinitions();

    const fields = getFieldDefinitionsByDirective(
      this.documentNode,
      this.options.relayDirective!.name!,
    );

    for (const field of fields) {
      // TODO Connection とか生成
      const filedType = getFieldTypeName(field);
      this.addNodeInterface(filedType.name);
      this.genEdgeType(filedType.name);
      this.genConnectionType(filedType.name);
      this.replaceConnectionType(filedType.name, field);
      this.removeRelayDirective(field);
    }
    return this.documentNode;
  }

  private getEdgeTypeName(fieldTypeName: string): string {
    return `${this.options.relayEdgeType!.prefix!}${fieldTypeName}${
      this.options.relayEdgeType!.suffix
    }`;
  }
  private getConnectionTypeName(fieldTypeName: string): string {
    return `${this.options.relayCnnectionType!.prefix!}${fieldTypeName}${
      this.options.relayCnnectionType!.suffix
    }`;
  }
  private replaceConnectionType(
    fieldTypeName: string,
    field: FieldDefinitionNode,
  ): void {
    Reflect.set(field, 'type', {
      kind: 'NamedType',
      name: {
        kind: 'Name',
        value: this.getConnectionTypeName(fieldTypeName),
      },
    } as TypeNode);
    // before: String, after: String, first: Int, last: Int
    Reflect.set(field, 'arguments', [
      ...(field.arguments || []),
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
      },
    ] as InputValueDefinitionNode[]);
  }
  private genEdgeType(fieldTypeName: string): void {
    if (
      getDefinitionByName(
        this.documentNode,
        this.getEdgeTypeName(fieldTypeName),
      )
    ) {
      return;
    }
    const edgeDefinition = {
      kind: 'ObjectTypeDefinition',
      directives: [],
      name: {
        kind: 'Name',
        value: this.getEdgeTypeName(fieldTypeName),
      },
    } as ObjectTypeDefinitionNode;
    Reflect.set(edgeDefinition, 'fields', [
      {
        kind: 'FieldDefinition',
        directives: [],
        name: {
          kind: 'Name',
          value: 'node',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: fieldTypeName,
          },
        },
      },
      {
        kind: 'FieldDefinition',
        directives: [],
        name: {
          kind: 'Name',
          value: 'cursor',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: 'String',
          },
        },
      },
    ] as FieldDefinitionNode[]);
    Reflect.set(edgeDefinition, 'interfaces', [
      {
        kind: 'InterfaceTypeDefinition',
        name: {
          kind: 'Name',
          value: this.options.relayEdgeInterface!.name!,
        },
      },
    ]);
    appendDefinitionToDocumentNode(this.documentNode, edgeDefinition);
  }
  private genConnectionType(fieldTypeName: string): void {
    if (
      getDefinitionByName(
        this.documentNode,
        this.getConnectionTypeName(fieldTypeName),
      )
    ) {
      return;
    }
    const connectionDefinition = {
      kind: 'ObjectTypeDefinition',
      directives: [],
      name: {
        kind: 'Name',
        value: this.getConnectionTypeName(fieldTypeName),
      },
    } as ObjectTypeDefinitionNode;

    Reflect.set(connectionDefinition, 'fields', [
      {
        kind: 'FieldDefinition',
        directives: [],
        name: {
          kind: 'Name',
          value: 'totalCount',
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: this.options.relayCnnectionInterface!.totalCountType,
          },
        },
      },
      {
        kind: 'FieldDefinition',
        directives: [],
        name: {
          kind: 'Name',
          value: 'edges',
        },
        type: {
          kind: 'ListType',
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: this.getEdgeTypeName(fieldTypeName),
            },
          },
        },
      },
      {
        kind: 'FieldDefinition',
        directives: [],
        name: {
          kind: 'Name',
          value: 'pageInfo',
        },
        type: {
          kind: 'NonNullType',
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: this.options.relayPageInfoType!.name!,
            },
          },
        },
      },
    ] as FieldDefinitionNode[]);
    Reflect.set(connectionDefinition, 'interfaces', [
      {
        kind: 'InterfaceTypeDefinition',
        name: {
          kind: 'Name',
          value: this.options.relayCnnectionInterface!.name!,
        },
      },
    ]);
    appendDefinitionToDocumentNode(this.documentNode, connectionDefinition);
  }
  private addNodeInterface(fieldTypeName: string): void {
    const fieldType = getDefinitionByName(
      this.documentNode,
      fieldTypeName,
    ) as ObjectTypeDefinitionNode;

    if (
      !fieldType ||
      this.hasInterface(fieldType, this.options.relayNodeInterface!.name!)
    ) {
      return;
    }

    Reflect.set(fieldType, 'interfaces', [
      ...(fieldType.interfaces || []),
      {
        kind: 'InterfaceTypeDefinition',
        name: {
          kind: 'Name',
          value: 'Node',
        },
      } as InterfaceTypeDefinitionNode,
    ]);
  }
  private hasInterface(
    definition: ObjectTypeDefinitionNode,
    interfaceName: string,
  ): boolean {
    return (
      Array.isArray(definition.interfaces) &&
      definition.interfaces.find(
        (i: InterfaceTypeDefinitionNode) => i.name.value === interfaceName,
      )
    );
  }
  private removeRelayDirective(field: FieldDefinitionNode): void {
    const directives = getDirectives(field);
    Reflect.set(
      field,
      'directives',
      directives.filter(
        directive =>
          directive.name.value !== this.options.relayDirective!.name!,
      ),
    );
  }
  private genRelayDifinitions() {
    const difinitions: TypeDefinitionNode[] = [];
    if (
      !getDefinitionByName(
        this.documentNode,
        this.options.relayNodeInterface!.name!,
      )
    ) {
      difinitions.push({
        kind: 'InterfaceTypeDefinition',
        name: {
          kind: 'Name',
          value: this.options.relayNodeInterface!.name,
        },

        fields: [
          {
            kind: 'FieldDefinition',
            name: {
              kind: 'Name',
              value: this.options.relayNodeInterface!.idFieldName,
            },
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
          },
        ],
      } as InterfaceTypeDefinitionNode);
    }
    if (
      !getDefinitionByName(
        this.documentNode,
        this.options.relayEdgeInterface!.name!,
      )
    ) {
      difinitions.push({
        kind: 'InterfaceTypeDefinition',
        name: {
          kind: 'Name',
          value: this.options.relayEdgeInterface!.name,
        },

        fields: [
          {
            kind: 'FieldDefinition',
            name: {
              kind: 'Name',
              value: 'cursor',
            },
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: 'String',
              },
            },
          },
        ],
      } as InterfaceTypeDefinitionNode);
    }
    if (
      !getDefinitionByName(
        this.documentNode,
        this.options.relayCnnectionInterface!.name!,
      )
    ) {
      difinitions.push({
        kind: 'InterfaceTypeDefinition',
        name: {
          kind: 'Name',
          value: this.options.relayCnnectionInterface!.name!,
        },
        fields: [
          {
            kind: 'FieldDefinition',
            name: {
              kind: 'Name',
              value: 'totalCount',
            },
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: this.options.relayCnnectionInterface!.totalCountType,
              },
            },
          },
          {
            kind: 'FieldDefinition',
            name: {
              kind: 'Name',
              value: 'pageInfo',
            },
            type: {
              kind: 'NonNullType',
              type: {
                kind: 'NamedType',
                name: {
                  kind: 'Name',
                  value: this.options.relayPageInfoType!.name!,
                },
              },
            },
          },
          {
            kind: 'FieldDefinition',
            name: {
              kind: 'Name',
              value: 'edges',
            },
            type: {
              kind: 'ListType',
              type: {
                kind: 'NamedType',
                name: {
                  kind: 'Name',
                  value: this.options.relayEdgeInterface!.name!,
                },
              },
            },
          },
        ],
      } as InterfaceTypeDefinitionNode);
    }
    if (
      !getDefinitionByName(
        this.documentNode,
        this.options.relayPageInfoType!.name!,
      )
    ) {
      difinitions.push({
        kind: 'ObjectTypeDefinition',
        name: {
          kind: 'Name',
          value: this.options.relayPageInfoType!.name!,
        },
        fields: [
          {
            kind: 'FieldDefinition',
            name: {
              kind: 'Name',
              value: 'startCursor',
            },
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: 'String',
              },
            },
          },
          {
            kind: 'FieldDefinition',
            name: {
              kind: 'Name',
              value: 'endCursor',
            },
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: 'String',
              },
            },
          },
          {
            kind: 'FieldDefinition',
            name: {
              kind: 'Name',
              value: 'hasNextPage',
            },
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: 'Boolean',
              },
            },
          },
          {
            kind: 'FieldDefinition',
            name: {
              kind: 'Name',
              value: 'hasPreviousPage',
            },
            type: {
              kind: 'NamedType',
              name: {
                kind: 'Name',
                value: 'Boolean',
              },
            },
          },
        ],
      } as ObjectTypeDefinitionNode);
    }
    appendDefinitionToDocumentNode(this.documentNode, ...difinitions);
  }
  private readonly documentNode: DocumentNode;

  constructor(
    readonly types: string | DocumentNode,
    private readonly options: GenRelayTypesOptions = {},
  ) {
    this.options = deepmerge(DEFAULT_OPTIONS, options);
    this.documentNode = typeof types === 'string' ? parse(types) : types;
  }
}
