import { configureActionHandler, TYPES } from 'sprotty';
import { SelectAction } from 'sprotty-protocol';
import { ContainerModule } from 'inversify';
import { PropertyPalette } from './property-palette';

const PropertyPaletteModule = new ContainerModule((bind, unbind, isBound, rebind) => {
    const context = { bind, unbind, isBound, rebind };

    bind(PropertyPalette).toSelf().inSingletonScope();

    configureActionHandler(context, SelectAction.KIND, PropertyPalette);
});

export default PropertyPaletteModule;
