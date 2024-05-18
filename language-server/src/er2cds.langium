grammar ER2CDS

entry ER2CDS:
	'er2cds' name=ID
	(entities+=Entity | relationships+=Relationship)*;

Entity:
	'entity' name=ID '{'
		(attributes+=Attribute)*
	'}';

Attribute:
	name=ID (':' datatype=DataType)? (type=AttributeType)?;

DataType:
	type=ID;

Relationship:
	'relationship' name=ID '{'
		((source=RelationshipEntity)? (('->' target=RelationshipEntity))?)?
		('join' 'order' joinOrder=JoinOrderType)?
		(joinClauses+=RelationshipJoinClause)*
	'}';

RelationshipEntity:
	target=[Entity] ('[' 
		cardinality=CardinalityType
	']')?;

RelationshipJoinClause:
	(firstAttribute=[Attribute] '=' secondAttribute=[Attribute]);

type AttributeType = 'key';
AttributeType returns AttributeType:
	KEY
;
KEY returns string:
	'key';

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