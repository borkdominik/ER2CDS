grammar ER2CDS

entry ER2CDS:
	'er2cds' name=ID
	(entities+=Entity | relationships+=Relationship)*;

Entity:
	(type=EntityType)? 'entity' name=ID '{'
		('alias' alias=ID)?
		(attributes+=Attribute)*
		('expose' (associations+=Association)*)?
		('where' (whereClauses+=EntityWhereClause)*)?
	'}';

Attribute:
	(type=AttributeType)? name=ID (':' datatype=DataType)? ('as' alias=ID)?;

Association:
	name=ID ('as' alias=ID)?;

EntityWhereClause:
	(attribute=[Attribute:ID] comparison=ComparisonType fixValue=FixValueType);

Relationship:
	(type=RelationshipType)? 'relationship' name=ID '{'
		((source=RelationshipEntity)? (('->' target=RelationshipEntity))?)?
		('join' 'order' joinOrder=JoinOrderType)?
		(joinClauses+=RelationshipJoinClause)*
	'}';

RelationshipEntity:
	target=[Entity:ID] ('[' 
		cardinality=CardinalityType
	']')?;

RelationshipJoinClause:
	(firstAttribute=[Attribute:ID] comparison=ComparisonType secondAttribute=[Attribute:ID]);

DataType:
	type=ID;

type EntityType = 'no-expose';
EntityType returns EntityType:
	NO_EXPOSE
;
NO_EXPOSE returns string:
	'no-expose';

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

type JoinOrderType = number;
JoinOrderType returns number:
	INT | ONE
;

type FixValueType = string | number;
FixValueType returns FixValueType:
	CHAR | INT | ONE
;

type ComparisonType = '=' | '<>' | '<' | '>' | '<=' | '>=';
ComparisonType returns ComparisonType:
	EQUAL | NOT_EQUAL | LOWER_THAN | GREATER_THAN | LOWER_EQUAL | GREATER_EQUAL
;
EQUAL returns string:
	'=';
NOT_EQUAL returns string:
	'<>';
LOWER_THAN returns string:
	'<';
GREATER_THAN returns string:
	'>';
LOWER_EQUAL returns string:
	'<=';
GREATER_EQUAL returns string:
	'>=';

terminal ID: /[_/a-zA-Z][\w_/]*/;
terminal INT returns number: /[0-9]+/;
terminal CHAR: /\'[\s\S]*?\'/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;