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
  ObjectTypeDefinitionNode,
  parse,
  printSchema,
  TypeNode,
} from 'graphql';
import { DEFAULT_OPTIONS } from './constants';
import { GenWhereTypesOptions } from './options';
export class GenWhereTypesService {
  public genWhereTypes(): string {
    if (!this.hasWhereDirective()) {
      return printSchema(buildASTSchema(this.documentNode));
    }
    const fields = getFieldDefinitionsByDirective(
      this.documentNode,
      this.options.whereDirective!.name!,
    );
    for (const field of fields) {
      const whereType = this.genWhereTypeDefinition(field);

      if (!whereType) {
        continue;
      }
      this.appendDefinitionToDocumentNode(whereType);
      this.appendWhereArgumentToFieldNode(field, whereType);
      this.removeWhereDirective(field);
      this.removeWhereIgnoreDirective(field);
    }

    for (const operator of this.typeOperatorMap.values()) {
      this.appendDefinitionToDocumentNode(
        operator.enumType,
        operator.objectType,
      );
    }

    return printSchema(buildASTSchema(this.documentNode));
  }

  private genOperatorDefinitions(typeName: string): void {
    if (this.typeOperatorMap.has(typeName)) {
      return;
    }
    let operatorNames = Reflect.get(
      this.options.supportOperatorTypes!,
      typeName,
    ) as string[];

    if (
      !Array.isArray(operatorNames) &&
      isEnumType(this.documentNode, typeName)
    ) {
      operatorNames = this.options.enumTypeOperator!;
    }
    if (!Array.isArray(operatorNames)) {
      return;
    }

    this.typeOperatorMap.set(typeName, {
      enumType: {
        kind: 'EnumTypeDefinition',
        name: {
          kind: 'Name',
          value: `${this.options.whereOperatorType!.prefix}${typeName}${
            this.options.whereOperatorType!.suffix
          }`,
        },
        values: operatorNames.map(
          operatorName =>
            ({
              kind: 'EnumValueDefinition',
              name: {
                kind: 'Name',
                value: operatorName.toUpperCase(),
              },
            } as EnumValueDefinitionNode),
        ),
      },
      objectType: {
        kind: 'ObjectTypeDefinition',
        name: {
          kind: 'Name',
          value: `${this.options.whereOperator!.prefix}${typeName}${
            this.options.whereOperator!.suffix
          }`,
        },
        fields: [
          {
            kind: 'FieldDefinition',
            name: {
              kind: 'Name',
              value: 'type',
            },
            type: {
              kind: 'NonNullType',
              type: {
                kind: 'NamedType',
                name: {
                  kind: 'Name',
                  value: `${this.options.whereOperatorType!.prefix}${typeName}${
                    this.options.whereOperatorType!.suffix
                  }`,
                },
              },
            },
          },
          {
            kind: 'FieldDefinition',
            name: {
              kind: 'Name',
              value: 'value',
            },
            type: {
              kind: 'NonNullType',
              type: {
                kind: 'ListType',
                type: {
                  kind: 'NamedType',
                  name: {
                    kind: 'Name',
                    value: typeName,
                  },
                },
              },
            },
          },
        ],
      } as ObjectTypeDefinitionNode,
    });
  }

  private appendWhereArgumentToFieldNode(
    field: FieldDefinitionNode,
    whereTypeDefinition: ObjectTypeDefinitionNode,
  ): void {
    Reflect.set(field, 'arguments', [
      ...(field.arguments || []),
      {
        kind: 'FieldDefinition',
        name: {
          kind: 'Name',
          value: this.options.whereArgment!.name!,
        },
        type: {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: whereTypeDefinition.name.value,
          },
        },
        directives: [],
      },
    ]);
  }

  private genWhereTypeDefinition(
    field: FieldDefinitionNode,
  ): ObjectTypeDefinitionNode | undefined {
    const fieldType = getObjectTypeDefinition(this.documentNode, field);
    if (!fieldType) {
      return;
    }

    const fieldNameAndTypes = this.getWhereFieldNameAndTypes(fieldType);
    const fields: FieldDefinitionNode[] = [];
    for (const { name, type } of fieldNameAndTypes) {
      this.genOperatorDefinitions(type);
      let fieldTypeNode: TypeNode;
      if (type === 'Boolean') {
        fieldTypeNode = {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: type,
          },
        };
      } else {
        fieldTypeNode = {
          kind: 'ListType',
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: `${this.options.whereOperator!.prefix}${type}${
                this.options.whereOperator!.suffix
              }`,
            },
          },
        };
      }
      fields.push({
        kind: 'FieldDefinition',
        name: {
          kind: 'Name',
          value: name,
        },
        arguments: [],
        type: fieldTypeNode,
        directives: [],
      });
    }

    const whereTypeOptions = this.options.whereType!;

    return {
      kind: 'ObjectTypeDefinition',
      name: {
        kind: 'Name',
        value: `${whereTypeOptions.prefix}${getFieldTypeName(field).name}${
          whereTypeOptions.suffix
        }`,
      },
      directives: [],
      fields,
    } as ObjectTypeDefinitionNode;
  }
  private getWhereFieldNameAndTypes(
    definition: ObjectTypeDefinitionNode,
  ): Array<{ name: string; type: string; isList: boolean }> {
    const fieldNames: Array<{
      name: string;
      type: string;
      isList: boolean;
    }> = [];
    for (const field of getFieldDefinitions(definition)) {
      const { name, isList } = getFieldTypeName(field);

      if (
        (isBasicType(name) ||
          isEnumType(this.documentNode, name) ||
          Reflect.get(this.options.supportOperatorTypes!, name)) &&
        !this.hasWhereIgnoreDirective(field)
      ) {
        fieldNames.push({ name: field.name.value, type: name, isList });
      }
    }

    return fieldNames;
  }
  private hasWhereIgnoreDirective(field: FieldDefinitionNode): boolean {
    const directives = getDirectives(field);
    if (
      directives.find(
        (d: DirectiveNode) =>
          d.name.value === this.options.whereIgnoreDirective!.name,
      )
    ) {
      return true;
    }

    return false;
  }
  private hasWhereDirective(): boolean {
    const definitions = getObjectTypeDefinitions(this.documentNode);
    for (const definition of definitions) {
      const fields = getFieldDefinitions(definition);

      for (const field of fields) {
        const directives = getDirectives(field);
        if (
          directives.find(
            (d: DirectiveNode) =>
              d.name.value === this.options.whereDirective!.name,
          )
        ) {
          return true;
        }
      }
    }
    return false;
  }

  private removeWhereDirective(field: FieldDefinitionNode): void {
    const directives = getDirectives(field);
    Reflect.set(
      field,
      'directives',
      directives.filter(
        directive => directive.name.value !== this.options.whereDirective!.name,
      ),
    );
  }
  private removeWhereIgnoreDirective(field: FieldDefinitionNode): void {
    const type = getObjectTypeDefinition(this.documentNode, field);
    if (!type) {
      return;
    }

    for (const f of getFieldDefinitions(type)) {
      if (!this.hasWhereIgnoreDirective(f)) {
        continue;
      }
      Reflect.set(
        f,
        'directives',
        getDirectives(f).filter(
          directive =>
            directive.name.value !== this.options.whereIgnoreDirective!.name,
        ),
      );
    }
  }
  private appendDefinitionToDocumentNode(
    ...definitions: DefinitionNode[]
  ): void {
    Reflect.set(this.documentNode, 'definitions', [
      ...this.documentNode.definitions,
      ...definitions,
    ]);
  }
  private readonly documentNode: DocumentNode;
  private typeOperatorMap: Map<
    string,
    {
      enumType: EnumTypeDefinitionNode;
      objectType: ObjectTypeDefinitionNode;
    }
  > = new Map<
    string,
    {
      enumType: EnumTypeDefinitionNode;
      objectType: ObjectTypeDefinitionNode;
    }
  >();
  constructor(
    readonly types: string | DocumentNode,
    private readonly options: GenWhereTypesOptions = {},
  ) {
    this.options = deepmerge(DEFAULT_OPTIONS, options);
    this.documentNode = typeof types === 'string' ? parse(types) : types;
  }
}
