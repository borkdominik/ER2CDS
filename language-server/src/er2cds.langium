grammar ER2CDS

entry ER2CDS:
	'er2cds' name=ID
	(entities+=Entity | relationships+=Relationship)*;

Entity:
	'entity' name=ID '{'
		(attributes+=Attribute)*
	'}';

Attribute:
	name=ID (':' datatype=DataType)?;

DataType:
	type=ID ('(' size=INT (',' d=INT)? ')')?;

Relationship:
	'relationship' name=ID '{'
		((first=RelationshipEntity)? (('->' second=RelationshipEntity))?)?
		(attributes+=RelationshipAttribute)*
	'}';

RelationshipEntity:
	target=[Entity] ('[' 
		cardinality=CardinalityType ('|' role=STRING)?
	']')?;

RelationshipAttribute:
	(firstAttribute=[Attribute] '=' secondAttribute=[Attribute]);

type CardinalityType = '1' | 'N';
CardinalityType returns CardinalityType:
	ONE | MANY
;
ONE returns string:
	'1';
MANY returns string:
	'N';

terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING returns string: /[A-Za-z]+/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;