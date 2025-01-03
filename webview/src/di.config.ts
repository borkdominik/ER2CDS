import { Container, ContainerModule } from 'inversify';
import {
    configureModelElement, ConsoleLogger, EmptyView, expandFeature, HtmlRootImpl, HtmlRootView, loadDefaultModules, LogLevel, overrideViewerOptions, PreRenderedElementImpl,
    PreRenderedView, SCompartmentImpl, SCompartmentView, SLabelImpl, SLabelView, SModelRootImpl, SRoutingHandleImpl, SRoutingHandleView, TYPES
} from 'sprotty';
import {
    ER2CDSRoot, EntityNode, RelationshipNode, Edge, CardinalityLabel,
    GRAPH, NODE_ENTITY, NODE_RELATIONSHIP,
    COMP_ATTRIBUTES, COMP_ATTRIBUTE, COMP_ENTITY_HEADER, EDGE,
    LABEL_ENTITY, LABEL_ENTITY_ALIAS, LABEL_ATTRIBUTE, LABEL_CARDINALITY, LABEL_SEPARATOR, LABEL_RELATIONSHIP, LABEL_VALUE,
    LABEL_ATTRIBUTE_KEY,
    COMP_JOIN_CLAUSES,
    COMP_JOIN_CLAUSE,
    COMP_JOIN_TABLE,
    LABEL_JOIN_TABLE,
    LABEL_JOIN_ORDER,
    LABEL_JOIN_CLAUSE,
    LABEL_JOIN_CLAUSE_COMPARISON,
    LABEL_ATTRIBUTE_NO_OUT,
    LABEL_RELATIONSHIP_ASSOCIATION,
    LABEL_RELATIONSHIP_ASSOCIATION_TO_PARENT,
    LABEL_RELATIONSHIP_COMPOSITION,
    COMP_WHERE_CLAUSES,
    COMP_WHERE_CLAUSE,
    LABEL_ASSOCIATION,
    COMP_ASSOCIATIONS,
    COMP_ASSOCIATION,
    LABEL_ENTITY_NO_EXPOSE,
} from './model';
import { ER2CDSRootView, EdgeView, EntityNodeView, RelationshipNodeView } from './views';

import 'sprotty/css/sprotty.css';
import '@vscode/codicons/dist/codicon.css';
import '@vscode/webview-ui-toolkit/dist/toolkit.js'

import '../css/auto-complete.css';
import '../css/compartment.css';
import '../css/diagram.css';
import '../css/editor-panel.css';
import '../css/helper-lines.css';
import '../css/labels.css';
import '../css/popup.css';
import '../css/property-palette.css';
import '../css/status.css';
import '../css/tool-palette.css';

import ToolPaletteModule from './tool-palette/di.config';
import ToolsModule from './tool-palette/tools/di.config';
import MarqueeToolModule from './tool-palette/tools/marquee-tool/di.config';
import DeleteToolModule from './tool-palette/tools/delete-tool/di.config';
import ServicesModule from './services/di.config';
import EdgeCreateToolModule from './tool-palette/tools/edge-create-tool/di.config';
import HelperLineModule from './helper-lines/di.config';
import AttributeToolModule from './tool-palette/tools/attribute-create-tool/di.config';
import EditorPanelModule from './editor-panel/di.config';
import PropertyPaletteModule from './property-palette/di.config';
import PopupModule from './popup/di.config';
import JoinClauseToolModule from './tool-palette/tools/join-clause-create-tool/di.config';
import ValidationModule from './validation/di.config';

export default (containerId: string) => {
    const DiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
        rebind(TYPES.LogLevel).toConstantValue(LogLevel.info);

        const context = { bind, unbind, isBound, rebind };

        // Graph
        configureModelElement(context, GRAPH, ER2CDSRoot, ER2CDSRootView);

        // Nodes
        configureModelElement(context, NODE_ENTITY, EntityNode, EntityNodeView, { enable: [expandFeature] });
        configureModelElement(context, NODE_RELATIONSHIP, RelationshipNode, RelationshipNodeView);

        // Edge
        configureModelElement(context, EDGE, Edge, EdgeView);

        // Compartments
        configureModelElement(context, COMP_ENTITY_HEADER, SCompartmentImpl, SCompartmentView);
        configureModelElement(context, COMP_ATTRIBUTES, SCompartmentImpl, SCompartmentView);
        configureModelElement(context, COMP_ATTRIBUTE, SCompartmentImpl, SCompartmentView);
        configureModelElement(context, COMP_ASSOCIATIONS, SCompartmentImpl, SCompartmentView);
        configureModelElement(context, COMP_ASSOCIATION, SCompartmentImpl, SCompartmentView);
        configureModelElement(context, COMP_WHERE_CLAUSES, SCompartmentImpl, SCompartmentView);
        configureModelElement(context, COMP_WHERE_CLAUSE, SCompartmentImpl, SCompartmentView);
        configureModelElement(context, COMP_JOIN_TABLE, SCompartmentImpl, EmptyView);
        configureModelElement(context, COMP_JOIN_CLAUSES, SCompartmentImpl, EmptyView);
        configureModelElement(context, COMP_JOIN_CLAUSE, SCompartmentImpl, EmptyView);

        // Labels
        configureModelElement(context, LABEL_ENTITY, SLabelImpl, SLabelView);
        configureModelElement(context, LABEL_ENTITY_NO_EXPOSE, SLabelImpl, SLabelView);
        configureModelElement(context, LABEL_ENTITY_ALIAS, SLabelImpl, SLabelView);
        configureModelElement(context, LABEL_ATTRIBUTE, SLabelImpl, SLabelView);
        configureModelElement(context, LABEL_ATTRIBUTE_KEY, SLabelImpl, SLabelView);
        configureModelElement(context, LABEL_ATTRIBUTE_NO_OUT, SLabelImpl, SLabelView);
        configureModelElement(context, LABEL_ASSOCIATION, SLabelImpl, SLabelView);
        configureModelElement(context, LABEL_SEPARATOR, SLabelImpl, SLabelView);
        configureModelElement(context, LABEL_VALUE, SLabelImpl, SLabelView);

        configureModelElement(context, LABEL_RELATIONSHIP, SLabelImpl, SLabelView);
        configureModelElement(context, LABEL_RELATIONSHIP_ASSOCIATION, SLabelImpl, SLabelView);
        configureModelElement(context, LABEL_RELATIONSHIP_ASSOCIATION_TO_PARENT, SLabelImpl, SLabelView);
        configureModelElement(context, LABEL_RELATIONSHIP_COMPOSITION, SLabelImpl, SLabelView);
        configureModelElement(context, LABEL_CARDINALITY, CardinalityLabel, SLabelView);

        configureModelElement(context, LABEL_JOIN_TABLE, SLabelImpl, SLabelView);
        configureModelElement(context, LABEL_JOIN_ORDER, SLabelImpl, SLabelView);
        configureModelElement(context, LABEL_JOIN_CLAUSE, SLabelImpl, SLabelView);
        configureModelElement(context, LABEL_JOIN_CLAUSE_COMPARISON, SLabelImpl, SLabelView);

        // Sprotty
        configureModelElement(context, 'html', HtmlRootImpl, HtmlRootView);
        configureModelElement(context, 'pre-rendered', PreRenderedElementImpl, PreRenderedView);
        configureModelElement(context, 'palette', SModelRootImpl, HtmlRootView);
        configureModelElement(context, 'routing-point', SRoutingHandleImpl, SRoutingHandleView);
        configureModelElement(context, 'volatile-routing-point', SRoutingHandleImpl, SRoutingHandleView);
    });

    const container = new Container();

    loadDefaultModules(container);

    container.load(DiagramModule);

    container.load(ServicesModule);
    container.load(EditorPanelModule);

    container.load(ToolPaletteModule);
    container.load(ToolsModule);
    container.load(MarqueeToolModule);
    container.load(DeleteToolModule);
    container.load(EdgeCreateToolModule);
    container.load(AttributeToolModule);
    container.load(JoinClauseToolModule);

    container.load(PropertyPaletteModule);

    container.load(HelperLineModule);
    container.load(PopupModule);

    container.load(ValidationModule);

    overrideViewerOptions(container, {
        needsClientLayout: true,
        needsServerLayout: true,
        baseDiv: containerId,
        hiddenDiv: containerId + '_hidden'
    });

    return container;
}