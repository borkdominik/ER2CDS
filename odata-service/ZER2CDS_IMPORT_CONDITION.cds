@AccessControl.authorizationCheck: #NOT_REQUIRED
@Metadata.ignorePropagatedAnnotations: true
@EndUserText.label: 'ER2CDS Import Content'
define view entity ZER2CDS_IMPORT_CONDITION
  as select from    ddcds_condition as c
    left outer join dd03l           as dl  on  dl.tabname   = c.baseobj_name
                                           and dl.fieldname = c.field_name
    left outer join dd03nd          as dnd on  dnd.strucobjn = c.baseobj_name
                                           and dnd.fieldname = c.field_name
{
  key c.entity_name              as EntityName,
  key c.union_number             as UnionNumber,
  key c.pos                      as Pos,
  key c.assoc_name               as AssocName,
  key c.stack_line               as StackLine,
  key c.condition_type           as ConditionType,
  key c.as4local                 as As4local,
      c.expr_type                as ExprType,
      c.expr_paracount           as ExprParacount,
      c.baseobj_alias            as BaseobjAlias,
      c.baseobj_name             as BaseobjName,
      c.baseobj_type             as BaseobjType,
      c.field_name               as FieldName,
      c.field_index              as FieldIndex,
      c.function                 as Function,
      c.operator                 as Operator,
      c.literal                  as Literal,
      c.parameter_name           as ParameterName,
      c.assoc_base_type          as AssocBaseType,
      c.join_operation           as JoinOperation,
      c.session_var_expr         as SessionVarExpr,
      c.rollname                 as Rollname,

      case
        when dl.datatype <> '' then cast(dl.datatype as abap.char(4))
        when dnd.datatype <> '' then cast(dnd.datatype as abap.char(4))
        else cast(c.datatype as abap.char(4))
      end                        as Datatype,

      case
          when dl.datatype <> '' then dl.leng
          when dnd.datatype <> '' then dnd.leng
          else c.length
      end                        as Leng,

      case
        when dl.datatype <> '' then dl.decimals
        when dnd.datatype <> '' then dnd.decimals
        else c.decimals
      end                        as Decimals,

      c.assoc_is_defined_locally as AssocIsDefinedLocally,
      c.assoc_is_derived_locally as AssocIsDerivedLocally,
      c.assoc_is_exposed         as AssocIsExposed,
      c.is_generated             as IsGenerated,
      c.assoc_is_managed         as AssocIsManaged
}
where
  c.is_generated = ''
