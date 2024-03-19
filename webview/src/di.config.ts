import { Container, ContainerModule } from 'inversify';
import {
    configureModelElement, ConsoleLogger, editLabelFeature, expandFeature, HtmlRootImpl, HtmlRootView, loadDefaultModules, LogLevel, overrideViewerOptions, PreRenderedElementImpl,
    PreRenderedView, SLabelImpl, SLabelView, SModelRootImpl, SRoutingHandleImpl, SRoutingHandleView, TYPES
} from 'sprotty';
import { ER2CDSModel, EntityNode, GRAPH, LABEL_ENTITY, LABEL_RELATIONSHIP, NODE_ENTITY, NODE_RELATIONSHIP, RelationshipNode } from './model';
import { ER2CDSModelView, EntityNodeView, RelationshipNodeView } from './views';

import 'sprotty/css/sprotty.css';
import '@vscode/codicons/dist/codicon.css';

import '../css/diagram.css';
import '../css/tool-palette.css';

import ToolPaletteModule from './tool-palette/di.config';
import ToolsModule from './tool-palette/tools/di.config';
import MarqueeToolModule from './tool-palette/tools/marquee-tool/di.config';
import DeleteToolModule from './tool-palette/tools/delete-tool/di.config';
import ServicesModule from './services/di.config';

export default (containerId: string) => {
    const DiagramModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
        rebind(TYPES.LogLevel).toConstantValue(LogLevel.info);

        const context = { bind, unbind, isBound, rebind };

        // Graph
        configureModelElement(context, GRAPH, ER2CDSModel, ER2CDSModelView);

        // Nodes
        configureModelElement(context, NODE_ENTITY, EntityNode, EntityNodeView, { enable: [expandFeature] });
        configureModelElement(context, NODE_RELATIONSHIP, RelationshipNode, RelationshipNodeView);

        // Labels
        configureModelElement(context, LABEL_ENTITY, SLabelImpl, SLabelView, { enable: [editLabelFeature] });
        configureModelElement(context, LABEL_RELATIONSHIP, SLabelImpl, SLabelView, { enable: [editLabelFeature] });

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

    overrideViewerOptions(container, {
        needsClientLayout: true,
        needsServerLayout: true,
        baseDiv: containerId,
        hiddenDiv: containerId + '_hidden'
    });

    return container;
}