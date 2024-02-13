import { Container, ContainerModule } from 'inversify';
import {
    configureCommand,
    configureModelElement, CreateElementCommand, editLabelFeature, hoverFeedbackFeature, HtmlRootImpl, HtmlRootView, loadDefaultModules,
    overrideViewerOptions,
    PolylineEdgeView, popupFeature, PreRenderedElementImpl, PreRenderedView, RectangularNodeView,
    SGraphImpl, SGraphView, SLabelImpl, SLabelView, SModelRootImpl, SRoutingHandleImpl, SRoutingHandleView,
} from 'sprotty';
import { StatesNode, StatesEdge } from './model';

import '../css/diagram.css';
import 'sprotty/css/sprotty.css';

export default (containerId: string) => {
    const myModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        const context = { bind, unbind, isBound, rebind };

        configureModelElement(context, 'graph', SGraphImpl, SGraphView, {
            enable: [hoverFeedbackFeature, popupFeature]
        });

        configureModelElement(context, 'node', StatesNode, RectangularNodeView);
        configureModelElement(context, 'label', SLabelImpl, SLabelView, {
            enable: [editLabelFeature]
        });
        configureModelElement(context, 'label:xref', SLabelImpl, SLabelView, {
            enable: [editLabelFeature]
        });
        configureModelElement(context, 'edge', StatesEdge, PolylineEdgeView);
        configureModelElement(context, 'html', HtmlRootImpl, HtmlRootView);
        configureModelElement(context, 'pre-rendered', PreRenderedElementImpl, PreRenderedView);
        configureModelElement(context, 'palette', SModelRootImpl, HtmlRootView);
        configureModelElement(context, 'routing-point', SRoutingHandleImpl, SRoutingHandleView);
        configureModelElement(context, 'volatile-routing-point', SRoutingHandleImpl, SRoutingHandleView);

        configureCommand(context, CreateElementCommand);
    });


    const container = new Container();
    loadDefaultModules(container);
    container.load(myModule);
    overrideViewerOptions(container, {
        needsClientLayout: true,
        needsServerLayout: true
    });
    return container;
}