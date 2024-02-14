import { Container, ContainerModule } from 'inversify';
import {
    configureCommand,
    configureModelElement, CreateElementCommand, creatingOnDragFeature, editLabelFeature, hoverFeedbackFeature, HtmlRootImpl, HtmlRootView, loadDefaultModules,
    overrideViewerOptions,
    PolylineEdgeView, popupFeature, PreRenderedElementImpl, PreRenderedView, RectangularNodeView,
    SGraphImpl, SGraphView, SLabelImpl, SLabelView, SModelRootImpl, SRoutingHandleImpl, SRoutingHandleView,
} from 'sprotty';
import { CreateTransitionPort, ER2CDSEntity, ER2CDSRelationship } from './model';

import '../css/diagram.css';
import 'sprotty/css/sprotty.css';
import { TriangleButtonView } from './views';

export default (containerId: string) => {
    const myModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        const context = { bind, unbind, isBound, rebind };

        configureModelElement(context, 'graph', SGraphImpl, SGraphView, {
            enable: [hoverFeedbackFeature, popupFeature]
        });

        configureModelElement(context, 'node', ER2CDSEntity, RectangularNodeView);
        configureModelElement(context, 'edge', ER2CDSRelationship, PolylineEdgeView);
        configureModelElement(context, 'label', SLabelImpl, SLabelView, {
            enable: [editLabelFeature]
        });
        configureModelElement(context, 'port', CreateTransitionPort, TriangleButtonView, {
            enable: [popupFeature, creatingOnDragFeature]
        });


        configureModelElement(context, 'html', HtmlRootImpl, HtmlRootView);
        configureModelElement(context, 'pre-rendered', PreRenderedElementImpl, PreRenderedView);
        configureModelElement(context, 'palette', SModelRootImpl, HtmlRootView);
        configureModelElement(context, 'routing-point', SRoutingHandleImpl, SRoutingHandleView);
        configureModelElement(context, 'volatile-routing-point', SRoutingHandleImpl, SRoutingHandleView);
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