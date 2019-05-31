import {
  appendDefinitionToDocumentNode,
  getDefinitionByName,
  getDirectives,
  getFieldDefinitions,
  getFieldDefinitionsByDirective,
  getFieldTypeName,
  getObjectOrUnionTypeDefinition,
  getObjectTypeDefinitionsFromUnion,
  hasDirectiveInDocumentNode,
  isBasicType,
  isEnumType,
  isUnionType,
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
import { DEFAULT_OPTIONS, DESCRIPTIONS } from './constants';
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
      const orderFieldEnumType = this.genSortEnumTypeDefinition(field);
      const orderEnumInputType = this.genOrderInputObjectTypeDefinition(field);
      if (!orderFieldEnumType || !orderEnumInputType) {
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
      description: {
        kind: 'StringValue',
        value: DESCRIPTIONS.OEDER_DIRECTION.TYPE,
      },
      values: [
        {
          kind: 'EnumValueDefinition',
          name: {
            kind: 'Name',
            value: orderDirectionOptions.ascName!,
          },
          description: {
            kind: 'StringValue',
            value: DESCRIPTIONS.OEDER_DIRECTION.ASC,
          },
        },
        {
          kind: 'EnumValueDefinition',
          name: {
            kind: 'Name',
            value: orderDirectionOptions.descName!,
          },
          description: {
            kind: 'StringValue',
            value: DESCRIPTIONS.OEDER_DIRECTION.DESC,
          },
        },
      ],
    };
  }

  private genOrderInputObjectTypeDefinition(
    field: FieldDefinitionNode,
  ): InputObjectTypeDefinitionNode | undefined {
    const type = getObjectOrUnionTypeDefinition(this.documentNode, field);
    if (!type) {
      return;
    }
    const { name } = getFieldTypeName(field);
    const orderTypeOptions = this.options.orderType!;
    const orderFieldEnumOptions = this.options.orderFieldEnum!;
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
      description: {
        kind: 'StringValue',
        value: DESCRIPTIONS.ORDER.TYPE(name),
      },
      fields: [
        {
          kind: 'InputValueDefinition',
          name: {
            kind: 'Name',
            value: orderTypeOptions.fieldName,
          },
          description: {
            kind: 'StringValue',
            value: DESCRIPTIONS.ORDER.FIELD(name),
          },
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: `${orderFieldEnumOptions.prefix}${name}${
                orderFieldEnumOptions.suffix
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
          description: {
            kind: 'StringValue',
            value: DESCRIPTIONS.ORDER.DIRECTION,
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
    const type = getObjectOrUnionTypeDefinition(this.documentNode, field);
    if (!type) {
      return;
    }

    const { name } = getFieldTypeName(field);
    const orderableFieldNames: Set<string> = new Set<string>();

    if (isUnionType(type)) {
      const definitions = getObjectTypeDefinitionsFromUnion(
        this.documentNode,
        type,
      );

      for (const definition of definitions) {
        this.getOrderableFieldNames(definition).forEach(fName =>
          orderableFieldNames.add(fName),
        );
      }
    } else {
      this.getOrderableFieldNames(type).forEach(fName =>
        orderableFieldNames.add(fName),
      );
    }
    const orderFieldEnumOptions = this.options!.orderFieldEnum!;
    const orderFieldEnumName = `${orderFieldEnumOptions.prefix}${name}${
      orderFieldEnumOptions.suffix
    }`;
    let orderFieldEnum = getDefinitionByName(
      this.documentNode,
      orderFieldEnumName,
    ) as EnumTypeDefinitionNode;
    if (orderFieldEnum) {
      return orderFieldEnum;
    }
    orderFieldEnum = {
      kind: 'EnumTypeDefinition',
      name: {
        kind: 'Name',
        value: orderFieldEnumName,
      },
      description: {
        kind: 'StringValue',
        value: DESCRIPTIONS.ORDER_FIELD.ENUM(name),
      },
      values: [...orderableFieldNames.values()].map(orderableFieldName => ({
        kind: 'EnumValueDefinition',
        name: {
          kind: 'Name',
          value: orderableFieldName,
        },
        description: {
          kind: 'StringValue',
          value: DESCRIPTIONS.ORDER_FIELD.VALUE(name, orderableFieldName),
        },
      })) as EnumValueDefinitionNode[],
    };
    appendDefinitionToDocumentNode(this.documentNode, orderFieldEnum);
    return orderFieldEnum;
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
    const type = getObjectOrUnionTypeDefinition(this.documentNode, field);
    if (!type) {
      return;
    }

    const definitions: ObjectTypeDefinitionNode[] = [];

    if (isUnionType(type)) {
      definitions.push(
        ...getObjectTypeDefinitionsFromUnion(this.documentNode, type),
      );
    } else {
      definitions.push(type);
    }

    for (const definition of definitions) {
      for (const f of getFieldDefinitions(definition)) {
        if (!this.hasOrderByIgnoreDirective(f)) {
          continue;
        }
        Reflect.set(
          f,
          'directives',
          getDirectives(f).filter(
            directive =>
              directive.name.value !==
              this.options.orderByIgnoreDirective!.name,
          ),
        );
      }
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
