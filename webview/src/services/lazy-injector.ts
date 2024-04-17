import { getServiceIdentifierAsString, interfaces } from 'inversify';
import { NOT_REGISTERED } from 'inversify/lib/constants/error_msgs';

export interface BindingContext {
    bind: interfaces.Bind;
    unbind: interfaces.Unbind;
    isBound: interfaces.IsBound;
    rebind: interfaces.Rebind;
}

export interface LazyInjector {
    get<T extends object>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T;
    getOptional<T extends object>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T | undefined;
    getAll<T extends object>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T[];
}

export const LazyInjector = Symbol('LazyInjector');

export class DefaultLazyInjector implements LazyInjector {
    protected cache = new Map<interfaces.ServiceIdentifier<object>, object | object[] | undefined>();

    constructor(protected readonly container: interfaces.Container) { }

    get<T extends object>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
        const service = this.getOptional(serviceIdentifier);
        if (service === undefined) {
            throw new Error(NOT_REGISTERED + getServiceIdentifierAsString(serviceIdentifier));
        }
        return service;
    }

    getOptional<T extends object>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T | undefined {
        if (this.cache.has(serviceIdentifier)) {
            return this.cache.get(serviceIdentifier) as T | undefined;
        }

        const service = this.container.isBound(serviceIdentifier) ? this.container.get<T>(serviceIdentifier) : undefined;
        this.cache.set(serviceIdentifier, service);
        return service;
    }

    getAll<T extends object>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T[] {
        if (this.cache.has(serviceIdentifier)) {
            return this.cache.get(serviceIdentifier) as T[];
        }
        const services = this.container.isBound(serviceIdentifier) ? this.container.getAll<T>(serviceIdentifier) : [];
        this.cache.set(serviceIdentifier, services);
        return services;
    }
}

export function bindLazyInjector(context: Pick<BindingContext, 'bind'> | interfaces.Bind): void {
    const bind = typeof context === 'object' ? context.bind.bind(context) : context;
    bind(LazyInjector).toDynamicValue(ctx => new DefaultLazyInjector(ctx.container));
}