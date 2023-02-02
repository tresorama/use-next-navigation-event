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
  /**
   * Handler invoked `BEFORE` transitioning to new page/route, 
   */
  onRouteChangeStart?: (navigationEvent: NavigationEvent) => void,
  /**
   * Handler invoked `AFTER` transitioning to new page/route, 
   */
  onRouteChangeComplete?: (navigationEvent: NavigationEvent) => void,
  /**
   * Handler invoked when the browser tab is going to be deactivated and closed.  
   */
  onWindowBeforeUnload?: (event: BeforeUnloadEvent) => void,
};
type NavigationEvent = {
  /**
   * How this navigation transition was triggered ?
   */
  type: LastNavigationEvent['type'],
  /**
   * Url navigation is coming from.  
   */
  oldUrl: string,
  /**
   * Url navigation is going to.  
   * This is the 1nd argument passed by `next/router`
   */
  newUrl: string, // next 1st argument
  /**
   * Options passed to `<Link>` or `router.push(...)` when triggering navigation
   * This is the 2nd argument passed by `next/router`
   */
  options: any; // next 2nd argument
};

/**
 * React hooks that let you subscribe (and run a callback function) to events triggered by navigation in your Next.js app.  
 *   
 * A navigation is a transition from a page/route to an other one, it can be triggered by:
 * - `<Link>` click (from `next/link`)
 * - `router.push(...)` and similar methods of `next/router`
 * - Browser UI Navigation triggers, like "forward", "back", "refresh" button
 */
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