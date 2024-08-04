@AccessControl.authorizationCheck: #NOT_REQUIRED
@Metadata.ignorePropagatedAnnotations: true
@EndUserText.label: 'ER2CDS Service Fields'
define view entity ZER2CDS_ATTRIBUTES
  as select from dd03l
{
  key tabname                        as Entity,
  key fieldname                      as Attribute,
      cast(datatype as abap.char(4)) as Datatype
}
where
      as4local =  'A'
  and datatype <> ''
union select from dd03nd
{
  key strucobjn                      as Entity,
  key fieldname                      as Attribute,
      cast(datatype as abap.char(4)) as Datatype
}
where
      as4local =  'A'
  and datatype <> ''
