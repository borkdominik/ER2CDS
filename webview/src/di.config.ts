import { Container, ContainerModule } from 'inversify';
import {
    configureModelElement, editLabelFeature, expandFeature, HtmlRootImpl, HtmlRootView, loadDefaultModules, overrideViewerOptions, PreRenderedElementImpl,
    PreRenderedView, SLabelImpl, SLabelView, SModelRootImpl, SRoutingHandleImpl, SRoutingHandleView
} from 'sprotty';
import { ER2CDSModel, EntityNode, RelationshipNode } from './model';

import '../css/diagram.css';
import 'sprotty/css/sprotty.css';
import { ER2CDSModelView, EntityNodeView, RelationshipNodeView } from './views';

export default (containerId: string) => {
    const myModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        const context = { bind, unbind, isBound, rebind };

        configureModelElement(context, 'graph', ER2CDSModel, ER2CDSModelView);

        // Nodes
        configureModelElement(context, 'node:entity', EntityNode, EntityNodeView, { enable: [expandFeature] });
        configureModelElement(context, 'node:relationship', RelationshipNode, RelationshipNodeView);

        // Labels
        configureModelElement(context, 'label:entity', SLabelImpl, SLabelView, { enable: [editLabelFeature] });
        configureModelElement(context, 'label:relationship', SLabelImpl, SLabelView, { enable: [editLabelFeature] });

        // Sprotty
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