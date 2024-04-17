import { configureActionHandler, TYPES } from 'sprotty';
import { ContainerModule } from 'inversify';
import { EnableEditorPanelAction } from './actions';
import { EditorPanel } from './editor-panel';

const EditorPanelModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    const context = { bind, unbind, isBound, rebind };

    bind(EditorPanel).toSelf().inSingletonScope();
    bind(TYPES.IUIExtension).toService(EditorPanel);

    configureActionHandler(context, EnableEditorPanelAction.KIND, EditorPanel);
});

export default EditorPanelModule;
