@AccessControl.authorizationCheck: #NOT_REQUIRED
@Metadata.ignorePropagatedAnnotations: true
@EndUserText.label: 'ER2CDS Service Entities'
define view entity ZER2CDS_ENTITIES
  as select from dd02l
{
  key tabname as Entity
}
where
  as4local = 'A'
union select from dd02b
{
  key strucobjn as Entity
}
where
  as4local = 'A'
