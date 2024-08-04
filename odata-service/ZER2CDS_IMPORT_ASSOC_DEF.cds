@AccessControl.authorizationCheck: #NOT_REQUIRED
@Metadata.ignorePropagatedAnnotations: true
@EndUserText.label: 'ER2CDS Import Content'
define view entity ZER2CDS_IMPORT_ASSOC_DEF
  as select from ddcds_assoc_def
{
  key entity_name               as EntityName,
  key union_number              as UnionNumber,
  key assoc_name                as AssocName,
  key as4local                  as As4local,
      assoc_type                as AssocType,
      assoc_target              as AssocTarget,
      assoc_target_type         as AssocTargetType,
      card_min                  as CardMin,
      card_max                  as CardMax,
      extend_name               as ExtendName,
      assoc_name_raw            as AssocNameRaw,
      redefined_from_entity     as RedefinedFromEntity,
      redefined_from_assoc_name as RedefinedFromAssocName
}
