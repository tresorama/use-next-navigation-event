import { LocalStorage } from './utils.local-storage';
import { useEffect, useRef } from 'react';
import Router, { type NextRouter } from "next/router";

type LastNavigationEvent = { type: 'BACK_OR_FORWARD' | 'REGULAR_NAVIGATION'; oldUrl: string; };
const _lastNavigationEvent = {
  getStorage: () => new LocalStorage<LastNavigationEvent>('use-next-navigation-event__lastNavigationEvent'),
  saveEvent: (event: LastNavigationEvent) => {
    const storage = _lastNavigationEvent.getStorage();
    storage.save(event);
  },
  getEvent: (): LastNavigationEvent => {
    const storage = _lastNavigationEvent.getStorage();
    return storage.retrieve() ?? { type: 'REGULAR_NAVIGATION', oldUrl: '' };
  },
  forget: () => {
    const storage = _lastNavigationEvent.getStorage();
    storage.delete();
  }
};

type Options = {
  onRouteChangeStart?: (navigationEvent: NavigationEvent) => void,
  onRouteChangeComplete?: (navigationEvent: NavigationEvent) => void,
  onWindowBeforeUnload?: () => void,
};
type NavigationEvent = {
  type: LastNavigationEvent['type'],
  oldUrl: string,
  newUrl: string, // next 1st argument
  options: any; // next 2nd argument
};

export const useNextNavigationEvent = (options: Options) => {
  const _options = useRef(options);

  useEffect(() => {

    // Router.events.on handlers
    type NextEventHandler = Parameters<NextRouter['events']['on']>[1];
    // const beforeHistoryChange: NextEventHandler = (newUrl, options) => {
    // };
    // const hashChangeComplete: NextEventHandler = (newUrl, options) => {
    // };
    // const hashChangeStart: NextEventHandler = (newUrl, options) => {
    // };
    // const routeChangeError: NextEventHandler = (newUrl, options) => {
    // };
    const routeChangeStart: NextEventHandler = (newUrl, options) => {
      // Note:
      // this handler is invoked BEFORE transitioning to new page/route, 
      // <Link> click or router.push() and browser button start the transition

      // When navigation occurs because of "back" or "forward" browser button,
      // and not because of <Link> click or router.push()
      // "beforePopState" is invoked before this function.
      // In that case do not save navigation event 
      // because correct event is of type "BACK_OR_FORWARD"
      if (_lastNavigationEvent.getEvent().type !== 'BACK_OR_FORWARD') {
        _lastNavigationEvent.saveEvent({
          type: 'REGULAR_NAVIGATION',
          oldUrl: Router.asPath
        });
      }

      const navEvent: NavigationEvent = {
        type: _lastNavigationEvent.getEvent().type,
        oldUrl: _lastNavigationEvent.getEvent().oldUrl,
        newUrl,
        options,
      };
      _options.current.onRouteChangeStart?.(navEvent);
    };
    const routeChangeComplete: NextEventHandler = (newUrl, options) => {
      // Note:
      // this handler is invoked AFTER transitioning to new page/route

      const navEvent: NavigationEvent = {
        type: _lastNavigationEvent.getEvent().type,
        oldUrl: _lastNavigationEvent.getEvent().oldUrl,
        newUrl,
        options,
      };
      _options.current.onRouteChangeComplete?.(navEvent);
      _lastNavigationEvent.forget();
    };

    // Router.beforePopState
    const beforePopState: Parameters<NextRouter['beforePopState']>[0] = (state) => {
      // Note:
      // this handler is invoked BEFORE transitioning to new page/route 
      // but only when going "back" (or "forward") in history, usually via browser buttons
      // <Link> click or router.push() DOES NOT invoke this handler

      _lastNavigationEvent.saveEvent({
        type: 'BACK_OR_FORWARD',
        oldUrl: Router.asPath,
      });
      return true;
    };

    // Window.on('beforeunload')
    const onWindowBeforeUnload = (event: BeforeUnloadEvent) => {
      // Note:
      // This handler is invoked when the browser tab is going to be deactivated and closed

      _options.current.onWindowBeforeUnload?.(event);
      // delete event['returnValue'];
    };

    // Router.events.on('beforeHistoryChange', beforeHistoryChange);
    // Router.events.on('hashChangeComplete', hashChangeComplete);
    // Router.events.on('hashChangeStart', hashChangeStart);
    // Router.events.on('routeChangeError', routeChangeError);
    Router.events.on('routeChangeStart', routeChangeStart);
    Router.events.on('routeChangeComplete', routeChangeComplete);
    Router.beforePopState(beforePopState);
    window.addEventListener('beforeunload', onWindowBeforeUnload);

    return () => {
      // Router.events.off('beforeHistoryChange', beforeHistoryChange);
      // Router.events.off('hashChangeComplete', hashChangeComplete);
      // Router.events.off('hashChangeStart', hashChangeStart);
      // Router.events.off('routeChangeError', routeChangeError);
      Router.events.off('routeChangeStart', routeChangeStart);
      Router.events.off('routeChangeComplete', routeChangeComplete);
      Router.beforePopState(() => true);
      window.removeEventListener('beforeunload', onWindowBeforeUnload);
    };
  }, []);
};