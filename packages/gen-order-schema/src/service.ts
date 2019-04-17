import {
  buildASTSchema,
  DirectiveNode,
  DocumentNode,
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  InputValueDefinitionNode,
  ListTypeNode,
  NamedTypeNode,
  ObjectTypeDefinitionNode,
  parse,
  printSchema,
} from 'graphql';
import { DEFAULT_OPTIONS } from './constants';
import { GenOrderTypesOptions } from './options';
import {
  getDirectives,
  getFieldDefinitions,
  getFieldTypeName,
  getObjectTypeDefinitions,
  isBasicType,
  isEnumType,
} from './utils';

export class GenOrderTypesService {
  genOrderTypes(): string {
    if (!this.hasOrderByDirective()) {
      return printSchema(buildASTSchema(this.documentNode));
    }

    const fields = this.getOrderByFieldDefinitions();

    for (const field of fields) {
      const enumTypeDefinition = this.genOrderByEnumTypeDefinition(field);
      if (!enumTypeDefinition) {
        continue;
      }

      this.appendDefinitionToDocumentNode(enumTypeDefinition);
      this.appendOrderByArgumentToFieldNode(field, enumTypeDefinition);
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
              d.name.value === this.options.orderByDirectiveName,
          )
        ) {
          return true;
        }
      }
    }

    return false;
  }
  private getOrderByFieldDefinitions(): FieldDefinitionNode[] {
    const results: FieldDefinitionNode[] = [];
    const definitions = getObjectTypeDefinitions(this.documentNode);
    for (const definition of definitions) {
      const fields = getFieldDefinitions(definition);

      for (const field of fields) {
        const directives = getDirectives(field);
        if (
          directives.find(
            (d: DirectiveNode) =>
              d.name.value === this.options.orderByDirectiveName,
          )
        ) {
          const { name, isList } = getFieldTypeName(field);
          if (!isList) {
            console.warn(
              `Found order directive, but type of ${
                field.name.value
              } was not ListType. So skip.`,
            );
          } else if (isBasicType(name)) {
            console.warn(
              `Found order directive, but type of ${
                field.name.value
              } was basic types. So skip.`,
            );
          } else {
            results.push(field);
          }
        }
      }
    }
    return results;
  }
  private getObjectTypeDefinition(
    field: FieldDefinitionNode,
  ): ObjectTypeDefinitionNode | undefined {
    const { name } = getFieldTypeName(field);

    return getObjectTypeDefinitions(this.documentNode).find(
      definition => definition.name.value === name,
    );
  }

  private hasOrderByIgnoreDirective(field: FieldDefinitionNode): boolean {
    const directives = getDirectives(field);
    if (
      directives.find(
        (d: DirectiveNode) =>
          d.name.value === this.options.orderByIgnoreDirectiveName,
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

  private genOrderByEnumTypeDefinition(
    field: FieldDefinitionNode,
  ): EnumTypeDefinitionNode | undefined {
    const type = this.getObjectTypeDefinition(field);
    if (!type) {
      return;
    }
    const { name } = getFieldTypeName(field);
    const orderableFieldNames = this.getOrderableFieldNames(type);
    return {
      kind: 'EnumTypeDefinition',
      name: {
        kind: 'Name',
        value: `${name}${this.options.orderEnumTypeSuffix}`,
      },
      directives: [],
      values: [
        ...Array.prototype.concat.apply(
          [],
          orderableFieldNames.map(orderableFieldName => [
            {
              kind: 'EnumValueDefinition',
              name: {
                kind: 'Name',
                value: `${orderableFieldName}_ASC`,
              },
              directives: [],
            },
            {
              kind: 'EnumValueDefinition',
              name: {
                kind: 'Name',
                value: `${orderableFieldName}_DESC`,
              },
              directives: [],
            },
          ]),
        ),
      ],
    };
  }
  private appendDefinitionToDocumentNode(
    enumTypeDefinition: EnumTypeDefinitionNode,
  ): void {
    Reflect.set(this.documentNode, 'definitions', [
      ...this.documentNode.definitions,
      enumTypeDefinition,
    ]);
  }
  private appendOrderByArgumentToFieldNode(
    field: FieldDefinitionNode,
    enumTypeDefinition: EnumTypeDefinitionNode,
  ): void {
    Reflect.set(field, 'arguments', [
      ...(field.arguments || []),
      this.genOrderByArgument(enumTypeDefinition),
    ]);
  }

  private genOrderByArgument(
    enumType: EnumTypeDefinitionNode,
  ): InputValueDefinitionNode {
    let type: NamedTypeNode | ListTypeNode = {
      kind: 'NamedType',
      name: {
        kind: 'Name',
        value: `${enumType.name.value}`,
      },
    };

    if (this.options.orderByArgumentTypeIsList) {
      type = {
        kind: 'ListType',
        type,
      };
    }

    return {
      kind: 'InputValueDefinition',
      name: {
        kind: 'Name',
        value: this.options.orderByArgumentName!,
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
        directive => directive.name.value !== this.options.orderByDirectiveName,
      ),
    );
  }
  private removeOrderByIgnoreDirective(field: FieldDefinitionNode): void {
    const type = this.getObjectTypeDefinition(field);
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
            directive.name.value !== this.options.orderByIgnoreDirectiveName,
        ),
      );
    }
  }
  private readonly documentNode: DocumentNode;
  constructor(
    readonly types: string | DocumentNode,
    private readonly options: GenOrderTypesOptions = {},
  ) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    this.documentNode = typeof types === 'string' ? parse(types) : types;
  }
}
