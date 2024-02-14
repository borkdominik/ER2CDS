grammar ER2CDS

entry ER2CDS:
	'er2cds' name=ID
	(entities+=Entity | relationships+=Relationship)*;

Entity:
	(weak?='weak')? 'entity' name=ID ('extends' extends=[Entity])? '{'
		(attributes+=Attribute)*
	'}';

Relationship:
	(weak?='weak')? 'relationship' name=ID '{'
		(first=RelationshipEntity ((firstType=RelationshipType second=RelationshipEntity) (secondType=RelationshipType third=RelationshipEntity)?)?)?
		(attributes+=Attribute)*
	'}';

RelationshipEntity:
	target=[Entity] ('[' 
		cardinality=CardinalityType ('|' role=STRING)?
	']')?;

Attribute:
	(visibility=VisibilityType)? name=ID (':' datatype=DataType)? (type=AttributeType)?;

type RelationshipType = '->' | 'o-' | '-o' | '*-' | '-*';
RelationshipType returns RelationshipType:
	DEFAULT | AGGREGATION_LEFT | AGGREGATION_RIGHT | COMPOSITION_LEFT | COMPOSITION_RIGHT
;
DEFAULT returns string:
	'->';
AGGREGATION_LEFT returns string:
	'o-';
AGGREGATION_RIGHT returns string:
	'-o';
COMPOSITION_LEFT returns string:
	'*-';
COMPOSITION_RIGHT returns string:
	'-*';

type CardinalityType = 'none' | '0..1' | '0..N' | '1' | '1..1' | '1..N' | 'N';
CardinalityType returns CardinalityType:
	NONE | ZERO_OR_ONE | ZERO_OR_MANY | ONE | ONE_ONE | ONE_MANY | MANY
;
ZERO_OR_ONE returns string:
	'0..1';
ZERO_OR_MANY returns string:
	'0..N';
ONE returns string:
	'1';
ONE_ONE returns string:
	'1..1';
ONE_MANY returns string:
	'1..N';
MANY returns string:
	'N';

type AttributeType = 'none' | 'key' | 'partial-key' | 'optional' | 'derived' | 'multivalued';
AttributeType returns AttributeType:
	NONE | KEY | PARTIAL_KEY | OPTIONAL | DERIVED | MULTIVALUED
;
KEY returns string:
	'key';
PARTIAL_KEY returns string:
	'partial-key';
OPTIONAL returns string:
	'optional';
DERIVED returns string:
	'derived';
MULTIVALUED returns string:
	'multivalued';

type VisibilityType = 'none' | '+' | '#' | '-' | '~' | 'public' | 'protected' | 'private' | 'package';
VisibilityType returns VisibilityType:
	NONE | PUBLIC | PROTECTED | PRIVATE | PUBLIC_STRING | PROTECTED_STRING | PRIVATE_STRING | PACKAGE_STRING
;
PUBLIC returns string:
	'+';
PROTECTED returns string:
	'-';
PRIVATE returns string:
	'~';
PUBLIC_STRING returns string:
	'public';
PROTECTED_STRING returns string:
	'protected';
PRIVATE_STRING returns string:
	'private';
PACKAGE_STRING returns string:
	'package';

NONE returns string:
	'none';

DataType:
	type=ID ('(' size=INT (',' d=INT)? ')')?;

terminal ID: /[_a-zA-Z][\w_]*/;
terminal INT returns number: /[0-9]+/;
terminal STRING returns string: /[A-Za-z]+/;

hidden terminal WS: /\s+/;
hidden terminal ML_COMMENT: /\/\*[\s\S]*?\*\//;
hidden terminal SL_COMMENT: /\/\/[^\n\r]*/;