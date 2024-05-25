grammar ER2CDS

entry ER2CDS:
	'er2cds' name=ID
	(entities+=Entity | relationships+=Relationship)*;

Entity:
	'entity' name=ID '{'
		('alias' alias=ID)?
		(attributes+=Attribute)*
	'}';

Attribute:
	(type=AttributeType)? name=ID (':' datatype=DataType)? ('as' alias=ID)?;

DataType:
	type=ID;

Relationship:
	(type=RelationshipType)? 'relationship' name=ID '{'
		((source=RelationshipEntity)? (('->' target=RelationshipEntity))?)?
		('join' 'order' joinOrder=JoinOrderType)?
		(joinClauses+=RelationshipJoinClause)*
	'}';

RelationshipEntity:
	target=[Entity] ('[' 
		cardinality=CardinalityType
	']')?;

RelationshipJoinClause:
	(firstAttribute=[Attribute:ID] '=' secondAttribute=[Attribute:ID]);

type AttributeType = 'key' | 'no-out';
AttributeType returns AttributeType:
	KEY | NO_OUT
;
KEY returns string:
	'key';
NO_OUT returns string:
	'no-out';

type RelationshipType = 'association' | 'association-to-parent' | 'composition';
RelationshipType returns RelationshipType:
	ASSOCIATION | ASSOCIATION_TO_PARENT | COMPOSITION
;
ASSOCIATION returns string:
	'association';
ASSOCIATION_TO_PARENT returns string:
	'association-to-parent';
COMPOSITION returns string:
	'composition';

type CardinalityType = '1' | '0..N';
CardinalityType returns CardinalityType:
	ONE | ZERO_MANY
;
ONE returns string:
	'1';
ZERO_MANY returns string:
	'0..N';

JoinOrderType returns number:
	INT | ONE
;

terminal ID: /[_a-zA-Z\/][\w_]*/;
terminal INT returns number: /[0-9]+/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;