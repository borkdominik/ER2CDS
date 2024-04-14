import { Container, ContainerModule } from 'inversify';
import {
    configureModelElement, ConsoleLogger, editLabelFeature, expandFeature, HtmlRootImpl, HtmlRootView, loadDefaultModules, LogLevel, overrideViewerOptions, PreRenderedElementImpl,
    PreRenderedView, SCompartmentImpl, SCompartmentView, SLabelImpl, SLabelView, SModelRootImpl, SRoutingHandleImpl, SRoutingHandleView, TYPES
} from 'sprotty';
import { COMP_ATTRIBUTES, COMP_ATTRIBUTES_ROW, COMP_ENTITY_HEADER, CardinalityLabel, EDGE, EDGE_INHERITANCE, EDGE_PARTIAL, ER2CDSRoot, Edge, EdgeInheritance, EntityNode, GRAPH, LABEL_BOTTOM, LABEL_BOTTOM_LEFT, LABEL_BOTTOM_RIGHT, LABEL_DERIVED, LABEL_ENTITY, LABEL_KEY, LABEL_PARTIAL_KEY, LABEL_RELATIONSHIP, LABEL_TEXT, LABEL_TOP, LABEL_TOP_LEFT, LABEL_TOP_RIGHT, LABEL_SEPARATOR, LeftCardinalityLabel, LeftRoleLabel, NODE_ENTITY, NODE_RELATIONSHIP, RelationshipNode, RightCardinalityLabel, RightRoleLabel, RoleLabel } from './model';
import { ER2CDSRootView, EdgeInheritanceView, EdgeView, EntityNodeView, RelationshipNodeView } from './views';

import 'sprotty/css/sprotty.css';
import '@vscode/codicons/dist/codicon.css';

import '../css/compartment.css';
import '../css/diagram.css';
import '../css/helper-lines.css';
import '../css/labels.css';
import '../css/tool-palette.css';

import ToolPaletteModule from './tool-palette/di.config';
import ToolsModule from './tool-palette/tools/di.config';
import MarqueeToolModule from './tool-palette/tools/marquee-tool/di.config';
import DeleteToolModule from './tool-palette/tools/delete-tool/di.config';
import ServicesModule from './services/di.config';
import EdgeCreateToolModule from './tool-palette/tools/edge-create-tool/di.config';
import HelperLineModule from './helper-lines/di.config';
import EdgeEditToolModule from './tool-palette/tools/edge-edit-tool/di.config';

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

        // Edges
        configureModelElement(context, EDGE, Edge, EdgeView);
        configureModelElement(context, EDGE_PARTIAL, Edge, EdgeView);
        configureModelElement(context, EDGE_INHERITANCE, EdgeInheritance, EdgeInheritanceView);

        // Labels
        configureModelElement(context, LABEL_ENTITY, SLabelImpl, SLabelView, { enable: [editLabelFeature] });
        configureModelElement(context, LABEL_RELATIONSHIP, SLabelImpl, SLabelView, { enable: [editLabelFeature] });

        configureModelElement(context, LABEL_TOP, CardinalityLabel, SLabelView);
        configureModelElement(context, LABEL_TOP_LEFT, LeftCardinalityLabel, SLabelView);
        configureModelElement(context, LABEL_TOP_RIGHT, RightCardinalityLabel, SLabelView);
        configureModelElement(context, LABEL_BOTTOM, RoleLabel, SLabelView);
        configureModelElement(context, LABEL_BOTTOM_LEFT, LeftRoleLabel, SLabelView);
        configureModelElement(context, LABEL_BOTTOM_RIGHT, RightRoleLabel, SLabelView);

        configureModelElement(context, LABEL_KEY, SLabelImpl, SLabelView, { enable: [editLabelFeature] });
        configureModelElement(context, LABEL_PARTIAL_KEY, SLabelImpl, SLabelView, { enable: [editLabelFeature] });
        configureModelElement(context, LABEL_DERIVED, SLabelImpl, SLabelView, { enable: [editLabelFeature] });
        configureModelElement(context, LABEL_TEXT, SLabelImpl, SLabelView, { enable: [editLabelFeature] });
        configureModelElement(context, LABEL_SEPARATOR, SLabelImpl, SLabelView);

        // Compartments
        configureModelElement(context, COMP_ENTITY_HEADER, SCompartmentImpl, SCompartmentView);
        configureModelElement(context, COMP_ATTRIBUTES, SCompartmentImpl, SCompartmentView);
        configureModelElement(context, COMP_ATTRIBUTES_ROW, SCompartmentImpl, SCompartmentView);

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

    container.load(ToolPaletteModule);
    container.load(ToolsModule);
    container.load(MarqueeToolModule);
    container.load(DeleteToolModule);
    container.load(EdgeCreateToolModule);
    // container.load(EdgeEditToolModule);
    container.load(HelperLineModule);

    overrideViewerOptions(container, {
        needsClientLayout: true,
        needsServerLayout: true,
        baseDiv: containerId,
        hiddenDiv: containerId + '_hidden'
    });

    return container;
}