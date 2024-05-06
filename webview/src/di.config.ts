import { Container, ContainerModule } from 'inversify';
import {
    configureModelElement, ConsoleLogger, editLabelFeature, expandFeature, HtmlRootImpl, HtmlRootView, loadDefaultModules, LogLevel, overrideViewerOptions, PreRenderedElementImpl,
    PreRenderedView, SCompartmentImpl, SCompartmentView, SLabelImpl, SLabelView, SModelRootImpl, SRoutingHandleImpl, SRoutingHandleView, TYPES
} from 'sprotty';
import {
    ER2CDSRoot, EntityNode, RelationshipNode, Edge, CardinalityLabel,
    GRAPH, NODE_ENTITY, NODE_RELATIONSHIP,
    COMP_ATTRIBUTES, COMP_ATTRIBUTES_ROW, COMP_ENTITY_HEADER, EDGE,
    LABEL_ENTITY, LABEL_ATTRIBUTE, LABEL_CARDINALITY, LABEL_SEPARATOR, LABEL_RELATIONSHIP
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
import '../css/popup.css';
import '../css/property-palette.css';
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

export default (containerId: string) => {
    const DiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
        rebind(TYPES.LogLevel).toConstantValue(LogLevel.log);

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
        configureModelElement(context, COMP_ATTRIBUTES_ROW, SCompartmentImpl, SCompartmentView);

        // Labels
        configureModelElement(context, LABEL_ENTITY, SLabelImpl, SLabelView, { enable: [editLabelFeature] });
        configureModelElement(context, LABEL_RELATIONSHIP, SLabelImpl, SLabelView, { enable: [editLabelFeature] });
        configureModelElement(context, LABEL_ATTRIBUTE, SLabelImpl, SLabelView, { enable: [editLabelFeature] });
        configureModelElement(context, LABEL_SEPARATOR, SLabelImpl, SLabelView);
        configureModelElement(context, LABEL_CARDINALITY, CardinalityLabel, SLabelView);

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
    container.load(AttributeToolModule);

    container.load(EditorPanelModule);
    container.load(PropertyPaletteModule);

    container.load(PopupModule);
    container.load(HelperLineModule);

    overrideViewerOptions(container, {
        needsClientLayout: true,
        needsServerLayout: true,
        baseDiv: containerId,
        hiddenDiv: containerId + '_hidden'
    });

    return container;
}