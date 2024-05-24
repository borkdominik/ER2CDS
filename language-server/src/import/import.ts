import { Agent } from 'https';
import { ER2CDSGlobal } from '../er2cds-module.js';
import fetch from 'node-fetch';
import { connection } from '../server.js';
import { MessageType } from 'vscode-languageserver-protocol';
import { Attribute, ER2CDS, Entity, Relationship, RelationshipJoinClause } from '../generated/ast.js';
import { serialize } from '../serializer/serializer.js';
import { URI } from 'langium';
import { ER2CDSFileSystem } from '../er2cds-file-system-provider.js';

export async function importCds(entityName: string, fileName: string): Promise<void> {
    const agent = new Agent({ rejectUnauthorized: false });
    const urlSelectList = ER2CDSGlobal.sapUrl + "sap/opu/odata/sap/ZER2CDS/ImportSelectList?$filter=EntityName eq '" + entityName + "'&$format=json&sap-client=" + ER2CDSGlobal.sapClient;
    const urlCondition = ER2CDSGlobal.sapUrl + "sap/opu/odata/sap/ZER2CDS/ImportCondition?$filter=EntityName eq'" + entityName + "'&$format=json&sap-client=" + ER2CDSGlobal.sapClient;
    const urlAssocDef = ER2CDSGlobal.sapUrl + "sap/opu/odata/sap/ZER2CDS/ImportAssocDef?$filter=EntityName eq'" + entityName + "'&$format=json&sap-client=" + ER2CDSGlobal.sapClient;

    const selectionList: IImportSelectionList[] = await fetch(
        urlSelectList,
        {
            agent: agent,
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + btoa(ER2CDSGlobal.sapUsername + ':' + ER2CDSGlobal.sapPassword)
            }
        }
    ).then(
        (response: any) => response.json()
    ).then(
        (response: any) => {
            return response.d.results.map((r: any) => r as IImportSelectionList);
        }
    ).catch(
        (error: any) => {
            connection.sendNotification('window/showMessage', {
                type: MessageType.Error,
                message: `CDS View Entity cannot be imported. ${error}`
            });

            return Promise.resolve();
        }
    )

    const condition: IImportCondition[] = await fetch(
        urlCondition,
        {
            agent: agent,
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + btoa(ER2CDSGlobal.sapUsername + ':' + ER2CDSGlobal.sapPassword)
            }
        }
    ).then(
        (response: any) => response.json()
    ).then(
        (response: any) => {
            return response.d.results.map((r: any) => r as IImportCondition);
        }
    ).catch(
        (error: any) => {
            connection.sendNotification('window/showMessage', {
                type: MessageType.Error,
                message: `CDS View Entity cannot be imported. ${error}`
            });

            return Promise.resolve();
        }
    )

    const assocDef: IImportAssocDef[] = await fetch(
        urlAssocDef,
        {
            agent: agent,
            method: 'GET',
            headers: {
                'Authorization': 'Basic ' + btoa(ER2CDSGlobal.sapUsername + ':' + ER2CDSGlobal.sapPassword)
            }
        }
    ).then(
        (response: any) => response.json()
    ).then(
        (response: any) => {
            return response.d.results.map((r: any) => r as IImportAssocDef);
        }
    ).catch(
        (error: any) => {
            connection.sendNotification('window/showMessage', {
                type: MessageType.Error,
                message: `CDS View Entity cannot be imported. ${error}`
            });

            return Promise.resolve();
        }
    )

    if (!selectionList || !condition)
        return Promise.resolve();

    const er2cds = convertToER2CDS(entityName, selectionList, condition, assocDef);
    const source = serialize(er2cds);

    const fileUri = URI.parse(fileName);
    const generatedFileName = entityName + '-imported.er2cds';
    const generatedFilePath = fileUri.fsPath.substring(0, fileUri.fsPath.lastIndexOf('/')) + '/' + generatedFileName;

    ER2CDSFileSystem.fileSystemProvider().writeFile(URI.parse(generatedFilePath), source);
}

export function convertToER2CDS(entityName: string, selectionList: IImportSelectionList[], condition: IImportCondition[], assocDef: IImportAssocDef[]): ER2CDS {
    let er2cds: ER2CDS = {
        $type: 'ER2CDS',
        name: entityName,
        entities: [],
        relationships: []
    };

    convertFromToER2CDS(er2cds, selectionList, condition);
    convertAssociationToER2CDS(er2cds, selectionList, assocDef, condition);

    return er2cds;
}

export function convertFromToER2CDS(er2cds: ER2CDS, selectionList: IImportSelectionList[], condition: IImportCondition[]): ER2CDS {
    er2cds = convertFromToER2CDSEntity(er2cds, selectionList, condition);
    er2cds = convertFromToER2CDSRelationship(er2cds, selectionList, condition);

    return er2cds;
}

export function convertFromToER2CDSEntity(er2cds: ER2CDS, selectionList: IImportSelectionList[], condition: IImportCondition[]): ER2CDS {
    condition.filter(c => c.ConditionType === 'FROM' && c.ExprType === 'TABLE_DATASOURCE').forEach(c => {
        let entity: Entity = {
            $type: 'Entity',
            $container: er2cds,
            name: c.BaseobjName,
            attributes: []
        };

        let attributes = selectionList.filter(s => s.BaseObjName === c.BaseobjName).map(s => {
            const ss = selectionList.find(ss => ss.ElementPos === s.ElementPos && ss.ExprType !== s.ExprType);
            return <Attribute>{
                $type: 'Attribute',
                $container: entity,
                name: s.BaseElementName,
                type: ss?.Keyflag === 'X' ? 'key' : '',
                alias: ss?.ElementAlias
            }
        });

        entity.attributes = attributes;
        er2cds.entities.push(entity);
    });

    return er2cds;
}

export function convertFromToER2CDSRelationship(er2cds: ER2CDS, selectionList: IImportSelectionList[], condition: IImportCondition[]): ER2CDS {
    let relationship: Relationship = {
        $type: 'Relationship',
        $container: er2cds,
        name: null!,
        joinClauses: []
    };

    let joinClause: RelationshipJoinClause = {
        $type: 'RelationshipJoinClause',
        $container: null!,
        firstAttribute: null!,
        secondAttribute: null!
    };

    condition.filter(c => c.ConditionType === 'FROM').forEach(c => {
        if (c.ExprType === 'TABLE_DATASOURCE' && relationship.source && relationship.target) {
            er2cds.relationships.push(relationship);
            relationship = {
                $type: 'Relationship',
                $container: er2cds,
                name: null!,
                joinClauses: []
            };;
        }

        if (c.ExprType === 'ATOMIC') {
            if (!relationship?.source) {
                relationship.source = {
                    $type: 'RelationshipEntity',
                    $container: relationship,
                    target: {
                        ref: er2cds.entities.find(e => e.name === c.BaseobjName)!,
                        $refText: c.BaseobjName
                    }
                }
            } else if (!relationship.target) {
                relationship.target = {
                    $type: 'RelationshipEntity',
                    $container: relationship,
                    target: {
                        ref: er2cds.entities.find(e => e.name === c.BaseobjName)!,
                        $refText: c.BaseobjName
                    }
                }
            }

            if (!joinClause.firstAttribute) {
                joinClause.firstAttribute = {
                    ref: er2cds.entities.find(e => e.name === c.BaseobjName)?.attributes.find(a => a.name === c.FieldName),
                    $refText: c.FieldName
                };
            } else if (!joinClause.secondAttribute) {
                joinClause.secondAttribute = {
                    ref: er2cds.entities.find(e => e.name === c.BaseobjName)?.attributes.find(a => a.name === c.FieldName),
                    $refText: c.FieldName
                };
            }
        }

        if (c.ExprType === 'COMPARISON' && joinClause.firstAttribute && joinClause.secondAttribute) {
            const sourceEntity = er2cds.entities.find(e => e.name === relationship.source?.target.$refText);
            if (sourceEntity && !sourceEntity.attributes.some(a => a.name === joinClause.firstAttribute.$refText)) {
                sourceEntity.attributes.push({
                    $type: 'Attribute',
                    $container: sourceEntity,
                    name: joinClause.firstAttribute.$refText,
                    type: 'no-out'
                });
            }

            const targetEntity = er2cds.entities.find(e => e.name === relationship.target?.target.$refText);
            if (targetEntity && !targetEntity.attributes.some(a => a.name === joinClause.secondAttribute.$refText)) {
                targetEntity.attributes.push({
                    $type: 'Attribute',
                    $container: targetEntity,
                    name: joinClause.secondAttribute.$refText,
                    type: 'no-out'
                });
            }

            relationship.joinClauses.push(joinClause);
            joinClause = {
                $type: 'RelationshipJoinClause',
                $container: null!,
                firstAttribute: null!,
                secondAttribute: null!
            };
        }

        if (c.ExprType === 'JOIN_DATASOURCE') {
            if (c.JoinOperation === 'INNER') {
                relationship.source!.cardinality = '1';
                relationship.target!.cardinality = '1';
            } else if (c.JoinOperation === 'LEFT') {
                relationship.source!.cardinality = '1';
                relationship.target!.cardinality = '0..N';
            } else if (c.JoinOperation === 'RIGHT') {
                relationship.source!.cardinality = '0..N';
                relationship.target!.cardinality = '1';
            }
        }
    });

    if (relationship.source && relationship.target) {
        er2cds.relationships.push(relationship);
    }

    return er2cds;
}

export function convertAssociationToER2CDS(er2cds: ER2CDS, selectionList: IImportSelectionList[], assocDef: IImportAssocDef[], condition: IImportCondition[]): ER2CDS {
    er2cds = convertAssociationToER2CDSEntity(er2cds, assocDef, condition);
    er2cds = convertAssociationToER2CDSRelationship(er2cds, selectionList, assocDef, condition);

    return er2cds;
}

export function convertAssociationToER2CDSEntity(er2cds: ER2CDS, assocDef: IImportAssocDef[], condition: IImportCondition[]): ER2CDS {
    condition.filter(c => c.AssocName).forEach(c => {
        if (!er2cds.entities.some(e => e.name === c.AssocName)) {
            er2cds.entities.push({
                $type: 'Entity',
                $container: er2cds,
                name: c.AssocName,
                attributes: []
            });
        }
    });

    return er2cds;
}

export function convertAssociationToER2CDSRelationship(er2cds: ER2CDS, selectionList: IImportSelectionList[], assocDef: IImportAssocDef[], condition: IImportCondition[]): ER2CDS {
    let relationship: Relationship = {
        $type: 'Relationship',
        $container: er2cds,
        name: null!,
        joinClauses: []
    };

    let joinClause: RelationshipJoinClause = {
        $type: 'RelationshipJoinClause',
        $container: null!,
        firstAttribute: null!,
        secondAttribute: null!
    };

    condition.filter(c => c.ConditionType === 'ASSOC_ON').forEach(c => {
        if (c.ExprType === 'ASSOC_ELEMENT') {
            if (!relationship?.source) {
                relationship.source = {
                    $type: 'RelationshipEntity',
                    $container: relationship,
                    target: {
                        ref: er2cds.entities.find(e => e.name === c.BaseobjName)!,
                        $refText: c.BaseobjName
                    }
                }
            } else if (!relationship.target) {
                relationship.target = {
                    $type: 'RelationshipEntity',
                    $container: relationship,
                    target: {
                        ref: er2cds.entities.find(e => e.name === c.BaseobjName)!,
                        $refText: c.BaseobjName
                    }
                }
            }

            if (!joinClause.firstAttribute) {
                const ss = selectionList.find(s => s.ElementAlias === c.FieldName);
                const sss = selectionList.find(s => s.ElementPos === ss?.ElementPos && s.ExprType !== ss?.ExprType);

                relationship.source = {
                    $type: 'RelationshipEntity',
                    $container: relationship,
                    target: {
                        ref: er2cds.entities.find(e => e.name === sss?.BaseObjName)!,
                        $refText: c.BaseobjName
                    }
                };

                joinClause.firstAttribute = {
                    ref: er2cds.entities.find(e => e.name === sss?.BaseObjName)?.attributes.find(a => a.name === sss?.BaseElementName),
                    $refText: c.FieldName
                };
            } else if (!joinClause.secondAttribute) {
                joinClause.secondAttribute = {
                    ref: er2cds.entities.find(e => e.name === c.BaseobjName)?.attributes.find(a => a.name === c.FieldName),
                    $refText: c.FieldName
                };
            }
        }

        if (c.ExprType === 'COMPARISON' && joinClause.firstAttribute && joinClause.secondAttribute) {
            const sourceEntity = er2cds.entities.find(e => e.name === relationship.source?.target.$refText);
            if (sourceEntity && !sourceEntity.attributes.some(a => a.name === joinClause.firstAttribute.$refText)) {
                sourceEntity.attributes.push({
                    $type: 'Attribute',
                    $container: sourceEntity,
                    name: joinClause.firstAttribute.$refText,
                    type: 'no-out'
                });
            }

            const targetEntity = er2cds.entities.find(e => e.name === relationship.target?.target.$refText);
            if (targetEntity && !targetEntity.attributes.some(a => a.name === joinClause.secondAttribute.$refText)) {
                targetEntity.attributes.push({
                    $type: 'Attribute',
                    $container: targetEntity,
                    name: joinClause.secondAttribute.$refText,
                    type: 'no-out'
                });
            }

            relationship.joinClauses.push(joinClause);
            joinClause = {
                $type: 'RelationshipJoinClause',
                $container: null!,
                firstAttribute: null!,
                secondAttribute: null!
            };
        }

        if (c.ExprType === 'ASSOCIATION') {
            const association = assocDef.find(a => a.AssocName === c.AssocName);
            if (association?.CardMin === '1') {
                relationship.source!.cardinality = '1';
            } else {
                relationship.source!.cardinality = '0..N';
            }

            if (association?.CardMax === '1') {
                relationship.target!.cardinality = '1';
            } else {
                relationship.target!.cardinality = '0..N';
            }

            relationship.type = 'association';
            er2cds.relationships.push(relationship);
            relationship = {
                $type: 'Relationship',
                $container: er2cds,
                name: null!,
                joinClauses: []
            };
        }
    });

    if (relationship.source && relationship.target) {
        er2cds.relationships.push(relationship);
    }

    return er2cds;
}

interface IImportSelectionList {
    EntityName: string,
    UnionNumber: string,
    ElementAlias: string,
    ElementPos: string,
    StackLine: string,
    As4local: string,
    ExprType: string,
    ExprSubtype: string,
    ExprParamCount: string,
    BaseObjAlias: string,
    BaseObjName: string,
    BaseObjType: string,
    BaseElementName: string,
    BaseElementNameRaw: string,
    FunctionName: string,
    IsTypePreserving: string,
    Operator: string,
    LiteralValue: string,
    ParameterName: string,
    SessionVarExpr: string,
    DataElement: string,
    Keyflag: string,
    IsVirtual: string,
    IsGenerated: string,
    IsGeneratedLocalized: string,
    AssocName: string,
    AssocBaseType: string,
    Datatype: string,
    Length: string,
    Decimals: string,
    AnnoName: string,
    AnnoQualifier: string,
    AnnoValue: string,
    AnnoValueUnescaped: string,
    AnnoType: string,
    IsPathField: string
}

interface IImportCondition {
    EntityName: string,
    UnionNumber: string,
    Pos: string,
    AssocName: string,
    StackLine: string,
    ConditionType: string,
    As4local: string,
    ExprType: string,
    ExprParacount: string,
    BaseobjAlias: string,
    BaseobjName: string,
    BaseobjType: string,
    FieldName: string,
    FieldIndex: string,
    Function: string,
    Operator: string,
    Literal: string,
    ParameterName: string,
    AssocBaseType: string,
    JoinOperation: string,
    SessionVarExpr: string,
    Rollname: string,
    Datatype: string,
    Length: string,
    Decimals: string,
    AssocIsDefinedLocally: string,
    AssocIsDerivedLocally: string,
    AssocIsExposed: string,
    IsGenerated: string,
    AssocIsManage: string
}

interface IImportAssocDef {
    EntityName: string,
    UnionNumber: string,
    AssocName: string,
    As4local: string,
    AssocType: string,
    AssocTarget: string,
    AssocTargetType: string,
    CardMin: string,
    CardMax: string,
    ExtendName: string,
    AssocNameRaw: string,
    RedefinedFromEntity: string,
    RedefinedFromAssocNam: string
}