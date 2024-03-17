import { ContainerModule } from 'inversify';
import { KeyTool, MouseTool } from 'sprotty';
import { MarqueeKeyTool } from './marquee-key-tool';
import { MarqueeMouseTool } from './marquee-mouse-tool';

const MarqueeToolModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    bind(MarqueeKeyTool).toSelf().inSingletonScope();
    rebind(KeyTool).toService(MarqueeKeyTool);

    bind(MarqueeMouseTool).toSelf().inSingletonScope();
    rebind(MouseTool).toService(MarqueeMouseTool);
});

export default MarqueeToolModule;