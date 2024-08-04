@AccessControl.authorizationCheck: #NOT_REQUIRED
@Metadata.ignorePropagatedAnnotations: true
@EndUserText.label: 'ER2CDS Import Select List'
define view entity ZER2CDS_IMPORT_SELECTLIST
  as select from    ddcds_selectlist as s
    left outer join dd03nd           as d on d.strucobjn   = s.entity_name
                                          and(
                                            d.fieldname    = s.element_alias
                                            or d.fieldname = s.base_element_name
                                          )
{
  key s.entity_name                    as EntityName,
  key s.union_number                   as UnionNumber,
  key s.element_alias                  as ElementAlias,
  key s.element_pos                    as ElementPos,
  key s.stack_line                     as StackLine,
  key s.as4local                       as As4local,
      s.expr_type                      as ExprType,
      s.expr_subtype                   as ExprSubtype,
      s.expr_param_count               as ExprParamCount,
      s.base_obj_alias                 as BaseObjAlias,
      s.base_obj_name                  as BaseObjName,
      s.base_obj_type                  as BaseObjType,
      s.base_element_name              as BaseElementName,
      s.base_element_name_raw          as BaseElementNameRaw,
      s.function_name                  as FunctionName,
      s.is_type_preserving             as IsTypePreserving,
      s.operator                       as Operator,
      s.literal_value                  as LiteralValue,
      s.parameter_name                 as ParameterName,
      s.session_var_expr               as SessionVarExpr,
      s.data_element                   as DataElement,
      s.keyflag                        as Keyflag,
      s.is_virtual                     as IsVirtual,
      s.is_generated                   as IsGenerated,
      s.is_generated_localized         as IsGeneratedLocalized,
      s.assoc_name                     as AssocName,
      s.assoc_base_type                as AssocBaseType,
      cast(d.datatype as abap.char(4)) as Datatype,
      d.leng                           as Leng,
      d.decimals                       as Decimals,
      s.anno_name                      as AnnoName,
      s.anno_qualifier                 as AnnoQualifier,
      s.anno_value                     as AnnoValue,
      s.anno_value_unescaped           as AnnoValueUnescaped,
      s.anno_type                      as AnnoType,
      s.is_path_field                  as IsPathField,
      d.fieldname_raw                  as FieldNameRaw
}
