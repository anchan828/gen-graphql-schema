import {
  getDirectives,
  getFieldDefinitions,
  getFieldDefinitionsByDirective,
  getFieldTypeName,
  getObjectTypeDefinition,
  getObjectTypeDefinitions,
  isBasicType,
  isEnumType,
} from '@anchan828/gen-graphql-schema-common';
import * as deepmerge from 'deepmerge';
import {
  buildASTSchema,
  DefinitionNode,
  DirectiveNode,
  DocumentNode,
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  ListTypeNode,
  NamedTypeNode,
  ObjectTypeDefinitionNode,
  parse,
  printSchema,
} from 'graphql';
import { DEFAULT_OPTIONS } from './constants';
import { GenOrderTypesOptions } from './options';
export class GenOrderTypesService {
  genOrderTypes(): string {
    if (!this.hasOrderByDirective()) {
      return printSchema(buildASTSchema(this.documentNode));
    }

    const fields = getFieldDefinitionsByDirective(
      this.documentNode,
      this.options.orderByDirective!.name!,
    );
    this.appendDefinitionToDocumentNode(this.genOrderDirectionEnumDefinition());
    for (const field of fields) {
      const sortEnumType = this.genSortEnumTypeDefinition(field);
      const orderEnumType = this.genOrderObjectTypeDefinition(field);
      if (!sortEnumType || !orderEnumType) {
        continue;
      }

      this.appendDefinitionToDocumentNode(sortEnumType, orderEnumType);
      this.appendOrderByArgumentToFieldNode(field, orderEnumType);

      this.removeOrderByDirective(field);
      this.removeOrderByIgnoreDirective(field);
    }

    return printSchema(buildASTSchema(this.documentNode));
  }
  private hasOrderByDirective(): boolean {
    const definitions = getObjectTypeDefinitions(this.documentNode);
    for (const definition of definitions) {
      const fields = getFieldDefinitions(definition);

      for (const field of fields) {
        const directives = getDirectives(field);
        if (
          directives.find(
            (d: DirectiveNode) =>
              d.name.value === this.options.orderByDirective!.name,
          )
        ) {
          return true;
        }
      }
    }

    return false;
  }

  private hasOrderByIgnoreDirective(field: FieldDefinitionNode): boolean {
    const directives = getDirectives(field);
    if (
      directives.find(
        (d: DirectiveNode) =>
          d.name.value === this.options.orderByIgnoreDirective!.name,
      )
    ) {
      return true;
    }

    return false;
  }
  private getOrderableFieldNames(
    definition: ObjectTypeDefinitionNode,
  ): string[] {
    const orderableFieldNames: string[] = [];
    for (const field of getFieldDefinitions(definition)) {
      const { name } = getFieldTypeName(field);

      if (
        (isBasicType(name) ||
          isEnumType(this.documentNode, name) ||
          this.options.supportOrderableTypes!.includes(name)) &&
        !this.hasOrderByIgnoreDirective(field)
      ) {
        orderableFieldNames.push(field.name.value);
      }
    }

    return orderableFieldNames;
  }

  private genOrderDirectionEnumDefinition(): EnumTypeDefinitionNode {
    const orderDirectionOptions = this.options!.orderDirection!;
    return {
      kind: 'EnumTypeDefinition',
      name: {
        kind: 'Name',
        value: orderDirectionOptions.typeName!,
      },
      directives: [],
      values: [
        {
          kind: 'EnumValueDefinition',
          name: {
            kind: 'Name',
            value: orderDirectionOptions.ascName!,
          },
          directives: [],
        },
        {
          kind: 'EnumValueDefinition',
          name: {
            kind: 'Name',
            value: orderDirectionOptions.descName!,
          },
          directives: [],
        },
      ],
    };
  }

  private genOrderObjectTypeDefinition(
    field: FieldDefinitionNode,
  ): ObjectTypeDefinitionNode | undefined {
    const type = getObjectTypeDefinition(this.documentNode, field);
    if (!type) {
      return;
    }
    const { name } = getFieldTypeName(field);
    const orderTypeOptions = this.options.orderType!;
    const sortEnumOptions = this.options.sortEnum!;
    const orderDirectionOptions = this.options!.orderDirection!;
    return {
      kind: 'ObjectTypeDefinition',
      name: {
        kind: 'Name',
        value: `${orderTypeOptions.prefix}${name}${orderTypeOptions.suffix}`,
      },
      directives: [],
      fields: [
        {
          kind: 'FieldDefinition',
          name: {
            kind: 'Name',
            value: orderTypeOptions.sortName,
          },
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: `${sortEnumOptions.prefix}${name}${
                sortEnumOptions.suffix
              }`,
            },
          },
        },
        {
          kind: 'FieldDefinition',
          name: {
            kind: 'Name',
            value: orderTypeOptions.directionName,
          },
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: orderDirectionOptions.typeName!,
            },
          },
        },
      ],
    } as ObjectTypeDefinitionNode;
  }
  private genSortEnumTypeDefinition(
    field: FieldDefinitionNode,
  ): EnumTypeDefinitionNode | undefined {
    const type = getObjectTypeDefinition(this.documentNode, field);
    if (!type) {
      return;
    }
    const { name } = getFieldTypeName(field);
    const orderableFieldNames = this.getOrderableFieldNames(type);
    const sortEnumOptions = this.options!.sortEnum!;
    return {
      kind: 'EnumTypeDefinition',
      name: {
        kind: 'Name',
        value: `${sortEnumOptions.prefix}${name}${sortEnumOptions.suffix}`,
      },
      directives: [],
      values: orderableFieldNames.map(orderableFieldName => ({
        kind: 'EnumValueDefinition',
        name: {
          kind: 'Name',
          value: `${orderableFieldName.toUpperCase()}`,
        },
        directives: [],
      })) as EnumValueDefinitionNode[],
    };
  }
  private appendDefinitionToDocumentNode(
    ...definitions: DefinitionNode[]
  ): void {
    Reflect.set(this.documentNode, 'definitions', [
      ...this.documentNode.definitions,
      ...definitions,
    ]);
  }
  private appendOrderByArgumentToFieldNode(
    field: FieldDefinitionNode,
    orderTypeDefinition: ObjectTypeDefinitionNode,
  ): void {
    Reflect.set(field, 'arguments', [
      ...(field.arguments || []),
      this.genOrderByArgument(orderTypeDefinition),
    ]);
  }

  private genOrderByArgument(
    orderTypeDefinition: ObjectTypeDefinitionNode,
  ): FieldDefinitionNode {
    let type: NamedTypeNode | ListTypeNode = {
      kind: 'NamedType',
      name: {
        kind: 'Name',
        value: `${orderTypeDefinition.name.value}`,
      },
    };
    const orderByArgumentOptions = this.options!.orderByArgument!;
    if (orderByArgumentOptions.isList) {
      type = {
        kind: 'ListType',
        type,
      };
    }

    return {
      kind: 'FieldDefinition',
      name: {
        kind: 'Name',
        value: orderByArgumentOptions.name!,
      },
      type,
      directives: [],
    };
  }

  private removeOrderByDirective(field: FieldDefinitionNode): void {
    const directives = getDirectives(field);
    Reflect.set(
      field,
      'directives',
      directives.filter(
        directive =>
          directive.name.value !== this.options.orderByDirective!.name,
      ),
    );
  }
  private removeOrderByIgnoreDirective(field: FieldDefinitionNode): void {
    const type = getObjectTypeDefinition(this.documentNode, field);
    if (!type) {
      return;
    }

    for (const f of getFieldDefinitions(type)) {
      if (!this.hasOrderByIgnoreDirective(f)) {
        continue;
      }
      Reflect.set(
        f,
        'directives',
        getDirectives(f).filter(
          directive =>
            directive.name.value !== this.options.orderByIgnoreDirective!.name,
        ),
      );
    }
  }
  private readonly documentNode: DocumentNode;
  constructor(
    readonly types: string | DocumentNode,
    private readonly options: GenOrderTypesOptions = {},
  ) {
    this.options = deepmerge(DEFAULT_OPTIONS, options);
    this.documentNode = typeof types === 'string' ? parse(types) : types;
  }
}
