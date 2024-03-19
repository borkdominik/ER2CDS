import { ContainerModule } from 'inversify';
import { configureCommand, configureModelElement } from 'sprotty';
import { DrawMarqueeCommand, RemoveMarqueeCommand } from './actions';
import { MARQUEE } from './marquee-util';
import { MarqueeNode } from './model';
import { MarqueeView } from './views';
import { MarqueeKeyTool } from './marquee-key-tool';
import { MarqueeMouseTool } from './marquee-mouse-tool';

const MarqueeToolModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(MarqueeKeyTool).toSelf().inSingletonScope();
    bind(MarqueeMouseTool).toSelf().inSingletonScope();

    const context = { bind, unbind, isBound, rebind };
    configureCommand(context, DrawMarqueeCommand);
    configureCommand(context, RemoveMarqueeCommand);

    configureModelElement(context, MARQUEE, MarqueeNode, MarqueeView);
});

export default MarqueeToolModule;