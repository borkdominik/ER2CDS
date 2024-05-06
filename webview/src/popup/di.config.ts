import { ContainerModule } from 'inversify';
import { PopupMouseTool, TYPES, configureModelElement } from 'sprotty';
import { PopupButton } from './model';
import { PopupButtonView } from './views';
import { ER2CDSPopupMouseTool } from './popup-mouse-tool';

const PopupModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(ER2CDSPopupMouseTool).toSelf().inSingletonScope();
    rebind(PopupMouseTool).toService(ER2CDSPopupMouseTool);

    const context = { bind, unbind, isBound, rebind };
    configureModelElement(context, 'button:yes', PopupButton, PopupButtonView);
    configureModelElement(context, 'button:no', PopupButton, PopupButtonView);
});

export default PopupModule;