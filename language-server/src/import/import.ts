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

    const urlFromClause = ER2CDSGlobal.sapUrl + "sap/opu/odata/sap/ZER2CDS/ImportFromClause?$filter=EntityName eq '" + entityName + "'&$format=json&$top=9999&sap-client=" + ER2CDSGlobal.sapClient;
    const urlSelectList = ER2CDSGlobal.sapUrl + "sap/opu/odata/sap/ZER2CDS/ImportSelectList?$filter=EntityName eq '" + entityName + "'&$format=json&$top=9999&sap-client=" + ER2CDSGlobal.sapClient;
    const urlCondition = ER2CDSGlobal.sapUrl + "sap/opu/odata/sap/ZER2CDS/ImportCondition?$filter=EntityName eq'" + entityName + "'&$format=json&$top=9999&sap-client=" + ER2CDSGlobal.sapClient;
    const urlAssocDef = ER2CDSGlobal.sapUrl + "sap/opu/odata/sap/ZER2CDS/ImportAssocDef?$filter=EntityName eq'" + entityName + "'&$format=json&$top=9999&sap-client=" + ER2CDSGlobal.sapClient;

    const fromClause: IImportFromClause[] = await fetch(
        urlFromClause,
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
            return response.d.results.map((r: any) => r as IImportFromClause);
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
            return response.d.results.map((r: any) => r as IImportSelectionList)
                .sort((r1: IImportSelectionList, r2: IImportSelectionList) => r1.ElementPos - r2.ElementPos);
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
            return response.d.results.map((r: any) => r as IImportCondition)
                .sort((r1: IImportCondition, r2: IImportCondition) => r1.Pos !== r2.Pos ? r1.Pos - r2.Pos : r1.StackLine - r1.StackLine);
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

    if (!condition || condition.length <= 0) {
        connection.sendNotification('window/showMessage', {
            type: MessageType.Error,
            message: `CDS View Entity cannot be imported. CDS View Entity not found.`
        });

        return Promise.resolve();
    }

    const er2cds = convertToER2CDS(entityName, fromClause, selectionList, condition, assocDef);
    const source = serialize(er2cds);

    const fileUri = URI.parse(fileName);
    const generatedFileName = entityName + '-imported.er2cds';
    const generatedFilePath = fileUri.fsPath.substring(0, fileUri.fsPath.lastIndexOf('/')) + '/' + generatedFileName;

    ER2CDSFileSystem.fileSystemProvider().writeFile(URI.parse(generatedFilePath), source);

    connection.sendNotification('window/showMessage', {
        type: MessageType.Info,
        message: `CDS View Entity imported successfully.`
    });
}

export function convertToER2CDS(entityName: string, fromClause: IImportFromClause[], selectionList: IImportSelectionList[], condition: IImportCondition[], assocDef: IImportAssocDef[]): ER2CDS {
    let er2cds: ER2CDS = {
        $type: 'ER2CDS',
        name: entityName,
        entities: [],
        relationships: []
    };

    convertFromToER2CDS(er2cds, fromClause, selectionList, assocDef, condition);
    convertAssociationToER2CDS(er2cds, selectionList, assocDef, condition);

    er2cds.entities.map(e => e.attributes.filter(a => a.name === 'MANDT').map(a => a.datatype!.type = 'CLNT'));
    er2cds.entities.filter(e => e.alias?.charAt(0) === '=').map(e => e.alias = e.alias?.replace('=', ''));

    return er2cds;
}

export function convertFromToER2CDS(er2cds: ER2CDS, fromClause: IImportFromClause[], selectionList: IImportSelectionList[], assocDef: IImportAssocDef[], condition: IImportCondition[]): void {
    convertFromToER2CDSEntity(er2cds, selectionList, assocDef, condition);
    convertFromToER2CDSRelationship(er2cds, fromClause, condition);
}

export function convertFromToER2CDSEntity(er2cds: ER2CDS, selectionList: IImportSelectionList[], assocDef: IImportAssocDef[], condition: IImportCondition[]): void {
    condition.filter(c => c.ConditionType === 'FROM' && c.ExprType === 'TABLE_DATASOURCE').forEach(c => {
        let entityName = c.BaseobjName;
        let entityAlias = c.BaseobjAlias;

        if (c.BaseobjAlias) {
            const assocAlias = condition.find(sc => sc.ConditionType === 'ASSOC_ON' && sc.ExprType === 'TABLE_DATASOURCE' && sc.BaseobjAlias === c.BaseobjAlias)
            const association = assocDef.find(a => a.AssocName === assocAlias?.AssocName);
            if (assocAlias && association) {
                entityName = assocAlias.BaseobjName;
                entityAlias = association.AssocNameRaw;
            }
        }

        let entity: Entity = {
            $type: 'Entity',
            $container: er2cds,
            name: entityName,
            alias: entityAlias,
            attributes: []
        };

        let attributes = selectionList.filter(s => s.BaseObjName === c.BaseobjName && s.ExprType === 'ATOMIC').map(s => {
            const ss = selectionList.find(ss => ss.ElementPos === s.ElementPos && ss.ExprType === 'STDSELECTLIST_ENTRY');
            return <Attribute>{
                $type: 'Attribute',
                $container: entity,
                name: s.BaseElementName,
                type: ss?.Keyflag ? 'key' : '',
                alias: ss?.FieldNameRaw,
                datatype: {
                    $type: 'DataType',
                    $container: null!,
                    type: s.Datatype ? s.Datatype : ss?.Datatype
                }
            }
        });

        entity.attributes = attributes;
        er2cds.entities.push(entity);
    });
}

export function convertFromToER2CDSRelationship(er2cds: ER2CDS, fromClause: IImportFromClause[], condition: IImportCondition[]): void {
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

    let nextSourceEntity: Entity | undefined;

    condition.filter(c => c.ConditionType === 'FROM').forEach(c => {
        if (c.ExprType === 'TABLE_DATASOURCE') {
            if (!relationship?.source) {
                relationship.source = {
                    $type: 'RelationshipEntity',
                    $container: relationship,
                    target: {
                        ref: er2cds.entities.find(e => e.name === c.BaseobjName && e.alias === c.BaseobjAlias)!,
                        $refText: c.BaseobjName
                    }
                }
            } else if (!relationship.target) {
                relationship.target = {
                    $type: 'RelationshipEntity',
                    $container: relationship,
                    target: {
                        ref: er2cds.entities.find(e => e.name === c.BaseobjName && e.alias === c.BaseobjAlias)!,
                        $refText: c.BaseobjName
                    }
                }
            }
        }

        if (c.ExprType === 'ATOMIC') {
            if (!joinClause.firstAttribute) {
                joinClause.firstAttribute = {
                    ref: er2cds.entities.find(e => e.name === c.BaseobjName && e.alias === c.BaseobjAlias)?.attributes.find(a => a.name === c.FieldName),
                    $refText: c.FieldName
                };
            } else if (!joinClause.secondAttribute) {
                joinClause.secondAttribute = {
                    ref: er2cds.entities.find(e => e.name === c.BaseobjName && e.alias === c.BaseobjAlias)?.attributes.find(a => a.name === c.FieldName),
                    $refText: c.FieldName
                };
            }
        }

        if (c.ExprType === 'COMPARISON' && joinClause.firstAttribute && joinClause.secondAttribute) {
            const sourceEntity = er2cds.entities.find(e => e.name === relationship.source?.target.ref?.name && e.alias === relationship.source?.target.ref?.alias);
            if (sourceEntity && !sourceEntity.attributes.some(a => a.name === joinClause.firstAttribute.$refText)) {
                const attribute = condition.find(sc => sc.ConditionType === 'FROM' && sc.ExprType === 'ATOMIC' &&
                    sc.BaseobjName === sourceEntity.name && sc.FieldName === joinClause.firstAttribute.$refText);

                if (attribute) {
                    sourceEntity.attributes.push({
                        $type: 'Attribute',
                        $container: sourceEntity,
                        name: attribute?.FieldName,
                        type: 'no-out',
                        datatype: {
                            $type: 'DataType',
                            $container: null!,
                            type: attribute?.Datatype
                        }
                    });
                } else {
                    joinClause.firstAttribute = undefined!;
                }
            }

            const targetEntity = er2cds.entities.find(e => e.name === relationship.target?.target.ref?.name && e.alias === relationship.target?.target.ref?.alias);
            if (targetEntity && !targetEntity.attributes.some(a => a.name === joinClause.secondAttribute.$refText)) {
                const attribute = condition.find(sc => sc.ConditionType === 'FROM' && sc.ExprType === 'ATOMIC' &&
                    sc.BaseobjName === targetEntity.name && sc.FieldName === joinClause.secondAttribute.$refText);

                if (attribute) {
                    targetEntity.attributes.push({
                        $type: 'Attribute',
                        $container: targetEntity,
                        name: attribute.FieldName,
                        type: 'no-out',
                        datatype: {
                            $type: 'DataType',
                            $container: null!,
                            type: attribute.Datatype
                        }
                    });
                } else {
                    joinClause.secondAttribute = undefined!;
                }
            }

            if (joinClause.firstAttribute && joinClause.secondAttribute) {
                relationship.joinClauses.push(joinClause);
            }

            joinClause = {
                $type: 'RelationshipJoinClause',
                $container: null!,
                firstAttribute: null!,
                secondAttribute: null!
            };
        }

        if (c.ExprType === 'JOIN_DATASOURCE' && relationship.source && relationship.target && relationship.joinClauses && relationship.joinClauses.length > 0) {
            if (c.JoinOperation === 'INNER') {
                relationship.source.cardinality = '1';
                relationship.target.cardinality = '1';
            } else if (c.JoinOperation === 'LEFT') {
                relationship.source.cardinality = '1';
                relationship.target.cardinality = '0..N';
            } else if (c.JoinOperation === 'RIGHT') {
                relationship.source.cardinality = '0..N';
                relationship.target.cardinality = '1';
            }

            const fc = fromClause.find(f => f.BaseObjName === relationship.target?.target.$refText);
            relationship.joinOrder = fc ? fc.BaseObjPos - 1 : 1;
            er2cds.relationships.push(relationship);

            relationship = {
                $type: 'Relationship',
                $container: er2cds,
                name: null!,
                joinClauses: []
            };

            if (nextSourceEntity) {
                relationship.source = {
                    $type: 'RelationshipEntity',
                    $container: relationship,
                    target: {
                        ref: nextSourceEntity,
                        $refText: nextSourceEntity.name
                    }
                }

                nextSourceEntity = undefined;
            }

        }

        if (c.ExprType === 'BOOLEAN') {
            nextSourceEntity = relationship.source?.target.ref;
        }
    });
}

export function convertAssociationToER2CDS(er2cds: ER2CDS, selectionList: IImportSelectionList[], assocDef: IImportAssocDef[], condition: IImportCondition[]): void {
    convertAssociationToER2CDSEntity(er2cds, assocDef, condition);
    convertAssociationToER2CDSRelationship(er2cds, selectionList, assocDef, condition);
}

export function convertAssociationToER2CDSEntity(er2cds: ER2CDS, assocDef: IImportAssocDef[], condition: IImportCondition[]): void {
    condition.filter(c => c.ConditionType === 'ASSOC_ON' && c.ExprType === 'TABLE_DATASOURCE').forEach(c => {
        if (!condition.some(sc => sc.ConditionType === 'FROM' && sc.ExprType === 'TABLE_DATASOURCE' && sc.BaseobjName === c.BaseobjName) &&
            !er2cds.entities.some(e => e.name === c.BaseobjName && e.alias === c.AssocName)) {
            const association = assocDef.find(a => a.AssocName === c.AssocName);

            if (association) {
                er2cds.entities.push({
                    $type: 'Entity',
                    $container: er2cds,
                    name: c.BaseobjName,
                    alias: association?.AssocNameRaw,
                    attributes: []
                });
            }
        }
    });
}

export function convertAssociationToER2CDSRelationship(er2cds: ER2CDS, selectionList: IImportSelectionList[], assocDef: IImportAssocDef[], condition: IImportCondition[]): void {
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
                const association = assocDef.find(a => a.AssocName === c.AssocName);

                relationship.source = {
                    $type: 'RelationshipEntity',
                    $container: relationship,
                    target: {
                        ref: er2cds.entities.find(e => e.name === c.BaseobjName && e.alias === association?.AssocNameRaw)!,
                        $refText: c.BaseobjName
                    }
                }
            } else if (!relationship.target) {
                const association = assocDef.find(a => a.AssocName === c.AssocName);

                relationship.target = {
                    $type: 'RelationshipEntity',
                    $container: relationship,
                    target: {
                        ref: er2cds.entities.find(e => e.name === c.BaseobjName && e.alias === association?.AssocNameRaw)!,
                        $refText: c.BaseobjName
                    }
                }
            }

            if (c.BaseobjName === er2cds.name) {
                let sourceEntity: Entity | undefined;
                let sourceAttribute: Attribute | undefined;

                let ss = selectionList.find(s => s.ElementAlias === c.FieldName);
                if (ss) {
                    const sss = selectionList.find(s => s.ElementPos === ss?.ElementPos && s.ExprType === 'ATOMIC');
                    const association = assocDef.find(a => a.AssocName === sss?.AssocName);

                    if (association) {
                        sourceEntity = er2cds.entities.find(e => e.name === sss?.BaseObjName && e.alias === association?.AssocNameRaw);
                    } else {
                        sourceEntity = er2cds.entities.find(e => e.name === sss?.BaseObjName && e.alias === sss?.BaseObjAlias);
                    }

                    sourceAttribute = sourceEntity?.attributes.find(a => a.name === sss?.BaseElementName);
                } else {
                    ss = selectionList.find(s => (s.ExprType === 'ATOMIC' || s.ExprType === 'ATOMIC_VIA_PATH') && s.BaseElementName === c.FieldName);
                    const association = assocDef.find(a => a.AssocTarget === ss?.BaseObjName);

                    if (association) {
                        sourceEntity = er2cds.entities.find(e => e.name === ss?.BaseObjName && e.alias === association?.AssocNameRaw);
                    } else {
                        sourceEntity = er2cds.entities.find(e => e.name === ss?.BaseObjName && e.alias === ss?.BaseObjAlias);
                    }

                    sourceAttribute = sourceEntity?.attributes.find(a => a.name === ss?.BaseElementName);

                    if (!sourceAttribute) {
                        const association = assocDef.find(a => a.AssocNameRaw === sourceEntity?.alias);
                        const attribute = condition.find(sc => sc.ConditionType === 'ASSOC_ON' && sc.ExprType === 'ASSOC_ELEMENT' &&
                            sc.BaseobjName === sourceEntity?.name && sc.AssocName === association?.AssocName && sc.FieldName === c.FieldName);

                        if (attribute) {
                            sourceEntity?.attributes.push({
                                $type: 'Attribute',
                                $container: sourceEntity,
                                name: attribute?.FieldName,
                                type: 'key',
                                datatype: {
                                    $type: 'DataType',
                                    $container: null!,
                                    type: attribute.Datatype
                                }
                            });
                        }

                        sourceAttribute = sourceEntity?.attributes.find(a => a.name === ss?.BaseElementName);
                    }
                }

                if (sourceEntity && sourceAttribute) {
                    if (relationship.source.target.$refText === er2cds.name || relationship.source.target.$refText === relationship.target?.target.$refText) {
                        relationship.source = {
                            $type: 'RelationshipEntity',
                            $container: relationship,
                            target: {
                                ref: sourceEntity,
                                $refText: sourceEntity.name
                            }
                        };
                    }

                    joinClause.firstAttribute = {
                        ref: sourceAttribute,
                        $refText: sourceAttribute.name
                    };
                }
            } else {
                const association = assocDef.find(a => a.AssocName === c?.AssocName);

                const targetEntity = er2cds.entities.find(e => e.name === c.BaseobjName && e.alias === association?.AssocNameRaw);
                const targetAttribute = targetEntity?.attributes.find(a => a.name === c.FieldName);

                if (!targetAttribute) {
                    const association = assocDef.find(a => a.AssocNameRaw === targetEntity?.alias);
                    const attribute = condition.find(sc => sc.ConditionType === 'ASSOC_ON' && sc.ExprType === 'ASSOC_ELEMENT' &&
                        sc.BaseobjName === targetEntity?.name && sc.AssocName === association?.AssocName && sc.FieldName === c.FieldName);

                    if (attribute) {
                        targetEntity?.attributes.push({
                            $type: 'Attribute',
                            $container: targetEntity,
                            name: attribute?.FieldName,
                            type: 'no-out',
                            datatype: {
                                $type: 'DataType',
                                $container: null!,
                                type: attribute.Datatype
                            }
                        });
                    }
                }

                relationship.target = {
                    $type: 'RelationshipEntity',
                    $container: relationship,
                    target: {
                        ref: targetEntity,
                        $refText: c.BaseobjName
                    }
                };

                joinClause.secondAttribute = {
                    ref: targetAttribute,
                    $refText: c.FieldName
                };
            }
        }

        if (c.ExprType === 'COMPARISON' && joinClause.firstAttribute && joinClause.secondAttribute) {
            const sourceEntity = er2cds.entities.find(e => e.name === relationship.source?.target.ref?.name && e.alias === relationship.source?.target.ref?.alias);
            if (sourceEntity && !sourceEntity.attributes.some(a => a.name === joinClause.firstAttribute.$refText)) {
                const attribute = condition.find(sc => sc.ConditionType === 'ASSOC_ON' && sc.ExprType === 'ASSOC_ELEMENT' && sc.BaseobjName === sourceEntity.name && sc.FieldName === joinClause.firstAttribute.$refText);

                if (attribute) {
                    sourceEntity.attributes.push({
                        $type: 'Attribute',
                        $container: sourceEntity,
                        name: joinClause.firstAttribute.$refText,
                        type: 'no-out',
                        datatype: {
                            $type: 'DataType',
                            $container: null!,
                            type: attribute.Datatype
                        }
                    });
                }
            }

            const targetEntity = er2cds.entities.find(e => e.name === relationship.target?.target.ref?.name && e.alias === relationship.source?.target.ref?.alias);
            if (targetEntity && !targetEntity.attributes.some(a => a.name === joinClause.secondAttribute.$refText)) {
                const attribute = condition.find(sc => sc.ConditionType === 'ASSOC_ON' && sc.ExprType === 'ASSOC_ELEMENT' &&
                    sc.BaseobjName === targetEntity.name && sc.FieldName === joinClause.secondAttribute.$refText);

                if (attribute) {
                    targetEntity.attributes.push({
                        $type: 'Attribute',
                        $container: targetEntity,
                        name: attribute?.FieldName,
                        type: 'no-out',
                        datatype: {
                            $type: 'DataType',
                            $container: null!,
                            type: attribute.Datatype
                        }
                    });
                }
            }

            relationship.joinClauses.push(joinClause);
            joinClause = {
                $type: 'RelationshipJoinClause',
                $container: null!,
                firstAttribute: null!,
                secondAttribute: null!
            };
        }

        if (c.ExprType === 'ASSOCIATION' && relationship.source && relationship.target) {
            const association = assocDef.find(a => a.AssocName === c.AssocName);

            if (association) {
                if (association?.CardMin === 1) {
                    relationship.source.cardinality = '1';
                } else {
                    relationship.source.cardinality = '0..N';
                }

                if (association?.CardMax === 1) {
                    relationship.target.cardinality = '1';
                } else {
                    relationship.target.cardinality = '0..N';
                }

                relationship.type = 'association';
                er2cds.relationships.push(relationship);
            }

            relationship = {
                $type: 'Relationship',
                $container: er2cds,
                name: null!,
                joinClauses: []
            };
        }

        if (c.ExprType === 'TO_PARENT_ASSO' && relationship.source && relationship.target) {
            const associationToParent = assocDef.find(a => a.AssocName === c.AssocName);
            if (associationToParent?.CardMin === 1) {
                relationship.source.cardinality = '1';
            } else {
                relationship.source.cardinality = '0..N';
            }

            if (associationToParent?.CardMax === 1) {
                relationship.target.cardinality = '1';
            } else {
                relationship.target.cardinality = '0..N';
            }

            relationship.type = 'association-to-parent';
            er2cds.relationships.push(relationship);

            relationship = {
                $type: 'Relationship',
                $container: er2cds,
                name: null!,
                joinClauses: []
            };
        }

        if (c.ExprType === 'COMPOSITION' && relationship.source && relationship.target) {
            const composition = assocDef.find(a => a.AssocName === c.AssocName);
            if (composition?.CardMin === 1) {
                relationship.source.cardinality = '1';
            } else {
                relationship.source.cardinality = '0..N';
            }

            if (composition?.CardMax === 1) {
                relationship.target.cardinality = '1';
            } else {
                relationship.target.cardinality = '0..N';
            }

            relationship.type = 'composition';
            relationship.joinClauses = [];
            er2cds.relationships.push(relationship);

            relationship = {
                $type: 'Relationship',
                $container: er2cds,
                name: null!,
                joinClauses: []
            };
        }
    });
}

interface IImportFromClause {
    EntityName: string,
    UnionNumber: string,
    BaseObjAlias: string,
    BaseObjPos: number,
    ParameterName: string,
    ParameterComponent: string,
    As4local: string,
    ParameterValue: string,
    BaseObjName: string,
    BaseObjType: string,
    ParameterComponentName: string
}

interface IImportSelectionList {
    EntityName: string,
    UnionNumber: string,
    ElementAlias: string,
    ElementPos: number,
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
    Leng: string,
    Decimals: string,
    AnnoName: string,
    AnnoQualifier: string,
    AnnoValue: string,
    AnnoValueUnescaped: string,
    AnnoType: string,
    IsPathField: string,
    FieldNameRaw: string
}

interface IImportCondition {
    EntityName: string,
    UnionNumber: string,
    Pos: number,
    AssocName: string,
    StackLine: number,
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
    Leng: string,
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
    CardMin: number,
    CardMax: number,
    ExtendName: string,
    AssocNameRaw: string,
    RedefinedFromEntity: string,
    RedefinedFromAssocNam: string
}