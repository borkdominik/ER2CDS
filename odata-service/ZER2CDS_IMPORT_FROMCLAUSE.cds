@AccessControl.authorizationCheck: #NOT_REQUIRED
@Metadata.ignorePropagatedAnnotations: true
@EndUserText.label: 'ER2CDS Import Content'
define view entity ZER2CDS_IMPORT_FROMCLAUSE
  as select from ddcds_fromclause
{
  key entity_name              as EntityName,
  key union_number             as UnionNumber,
  key base_obj_alias           as BaseObjAlias,
  key base_obj_pos             as BaseObjPos,
  key parameter_name           as ParameterName,
  key parameter_component      as ParameterComponent,
  key as4local                 as As4local,
      parameter_value          as ParameterValue,
      base_obj_name            as BaseObjName,
      base_obj_type            as BaseObjType,
      parameter_component_name as ParameterComponentName
}
