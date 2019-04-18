import {
  appendDefinitionToDocumentNode,
  getDefinitionByName,
  getDirectives,
  getFieldDefinitions,
  getFieldDefinitionsByDirective,
  getFieldTypeName,
  getObjectTypeDefinition,
  hasDirectiveInDocumentNode,
  isBasicType,
  isEnumType,
} from '@anchan828/gen-graphql-schema-common';
import * as deepmerge from 'deepmerge';
import {
  DirectiveNode,
  DocumentNode,
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  ListTypeNode,
  NamedTypeNode,
  ObjectTypeDefinitionNode,
  parse,
} from 'graphql';
import { DEFAULT_OPTIONS } from './constants';
import { GenOrderTypesOptions } from './options';
export class GenOrderTypesService {
  genOrderTypes(): DocumentNode {
    if (
      !hasDirectiveInDocumentNode(
        this.documentNode,
        this.options.orderByDirective!.name!,
      )
    ) {
      return this.documentNode;
    }

    const fields = getFieldDefinitionsByDirective(
      this.documentNode,
      this.options.orderByDirective!.name!,
    );
    appendDefinitionToDocumentNode(
      this.documentNode,
      this.genOrderDirectionEnumDefinition(),
    );
    for (const field of fields) {
      const sortEnumType = this.genSortEnumTypeDefinition(field);
      const orderEnumInputType = this.genOrderInputObjectTypeDefinition(field);
      if (!sortEnumType || !orderEnumInputType) {
        continue;
      }

      this.appendOrderByArgumentToFieldNode(field, orderEnumInputType);

      this.removeOrderByDirective(field);
      this.removeOrderByIgnoreDirective(field);
    }

    return this.documentNode;
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

  private genOrderInputObjectTypeDefinition(
    field: FieldDefinitionNode,
  ): InputObjectTypeDefinitionNode | undefined {
    const type = getObjectTypeDefinition(this.documentNode, field);
    if (!type) {
      return;
    }
    const { name } = getFieldTypeName(field);
    const orderTypeOptions = this.options.orderType!;
    const sortEnumOptions = this.options.sortEnum!;
    const orderDirectionOptions = this.options!.orderDirection!;
    const orderTypeName = `${orderTypeOptions.prefix}${name}${
      orderTypeOptions.suffix
    }`;
    let orderType = getDefinitionByName(
      this.documentNode,
      orderTypeName,
    ) as InputObjectTypeDefinitionNode;
    if (orderType) {
      return orderType;
    }
    orderType = {
      kind: 'InputObjectTypeDefinition',
      name: {
        kind: 'Name',
        value: orderTypeName,
      },
      directives: [],
      fields: [
        {
          kind: 'InputValueDefinition',
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
          kind: 'InputValueDefinition',
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
    } as InputObjectTypeDefinitionNode;
    appendDefinitionToDocumentNode(this.documentNode, orderType);
    return orderType;
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
    const sortEnumName = `${sortEnumOptions.prefix}${name}${
      sortEnumOptions.suffix
    }`;
    let sortEnum = getDefinitionByName(
      this.documentNode,
      sortEnumName,
    ) as EnumTypeDefinitionNode;
    if (sortEnum) {
      return sortEnum;
    }
    sortEnum = {
      kind: 'EnumTypeDefinition',
      name: {
        kind: 'Name',
        value: sortEnumName,
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
    appendDefinitionToDocumentNode(this.documentNode, sortEnum);
    return sortEnum;
  }

  private appendOrderByArgumentToFieldNode(
    field: FieldDefinitionNode,
    orderInputTypeDefinition: InputObjectTypeDefinitionNode,
  ): void {
    Reflect.set(field, 'arguments', [
      ...(field.arguments || []),
      this.genOrderByArgument(orderInputTypeDefinition),
    ]);
  }

  private genOrderByArgument(
    orderInputTypeDefinition: InputObjectTypeDefinitionNode,
  ): FieldDefinitionNode {
    let type: NamedTypeNode | ListTypeNode = {
      kind: 'NamedType',
      name: {
        kind: 'Name',
        value: `${orderInputTypeDefinition.name.value}`,
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
