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
  toConstanceCase,
} from '@anchan828/gen-graphql-schema-common';
import * as deepmerge from 'deepmerge';
import {
  DirectiveNode,
  DocumentNode,
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  ObjectTypeDefinitionNode,
  parse,
  TypeNode,
} from 'graphql';
import { DEFAULT_OPTIONS } from './constants';
import { GenWhereTypesOptions } from './options';
export class GenWhereTypesService {
  public genWhereTypes(): DocumentNode {
    if (
      !hasDirectiveInDocumentNode(
        this.documentNode,
        this.options.whereDirective!.name!,
      )
    ) {
      return this.documentNode;
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

      this.appendWhereArgumentToFieldNode(field, whereType);
      this.removeWhereDirective(field);
      this.removeWhereIgnoreDirective(field);
    }

    for (const operator of this.typeOperatorMap.values()) {
      appendDefinitionToDocumentNode(
        this.documentNode,
        operator.enumType,
        operator.inputObjectType,
      );
    }

    return this.documentNode;
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
                value: toConstanceCase(operatorName),
              },
            } as EnumValueDefinitionNode),
        ),
      },
      inputObjectType: {
        kind: 'InputObjectTypeDefinition',
        name: {
          kind: 'Name',
          value: `${this.options.whereOperator!.prefix}${typeName}${
            this.options.whereOperator!.suffix
          }`,
        },
        fields: [
          {
            kind: 'InputValueDefinition',
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
            kind: 'InputValueDefinition',
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
      } as InputObjectTypeDefinitionNode,
    });
  }

  private appendWhereArgumentToFieldNode(
    field: FieldDefinitionNode,
    whereTypeDefinition: InputObjectTypeDefinitionNode,
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
  ): InputObjectTypeDefinitionNode | undefined {
    const fieldType = getObjectTypeDefinition(this.documentNode, field);
    if (!fieldType) {
      return;
    }

    const fieldNameAndTypes = this.getWhereFieldNameAndTypes(fieldType);
    const fields: InputValueDefinitionNode[] = [];
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
        kind: 'InputValueDefinition',
        name: {
          kind: 'Name',
          value: name,
        },
        type: fieldTypeNode,
        directives: [],
      });
    }

    const whereTypeOptions = this.options.whereType!;
    const whereTypeName = `${whereTypeOptions.prefix}${
      getFieldTypeName(field).name
    }${whereTypeOptions.suffix}`;
    let whereType = getDefinitionByName(
      this.documentNode,
      whereTypeName,
    ) as InputObjectTypeDefinitionNode;
    if (whereType) {
      return whereType;
    }
    whereType = {
      kind: 'InputObjectTypeDefinition',
      name: {
        kind: 'Name',
        value: whereTypeName,
      },
      directives: [],
      fields,
    } as InputObjectTypeDefinitionNode;
    appendDefinitionToDocumentNode(this.documentNode, whereType);
    return whereType;
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

  private readonly documentNode: DocumentNode;
  private typeOperatorMap: Map<
    string,
    {
      enumType: EnumTypeDefinitionNode;
      inputObjectType: InputObjectTypeDefinitionNode;
    }
  > = new Map<
    string,
    {
      enumType: EnumTypeDefinitionNode;
      inputObjectType: InputObjectTypeDefinitionNode;
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
