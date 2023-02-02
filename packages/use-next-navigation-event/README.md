# use-next-navigation-event

Do something on Next.js router navigation event.  
Written in Typescript.  

## Why is born

While adding a scroll restoration flow to my Next.js app ([demo](#example---custom-scroll-restoration-flow)) I extracted the code that has nothing to do with scroll and created this package.  

## How it works

This package contains a React hook, `useNextNavigationEvent`.
This hook let you subscribe (and run a callback function) to events triggered by navigation in your Next.js app.  

A navigation is a transition from a page/route to an other one, it can be triggered by:
- `<Link>` click (from `next/link`)
- `router.push(...)` and similar methods of `next/router`
- Browser UI Navigation triggers, like "forward", "back", "refresh" button

## What's wrong with native next/router events

Nothing.  
This package extends some of `next/router` events handlers, just by adding 2 parameters.

With native `next/router`, in event handlers callbacks you only know which "url" you are going to.  

What if you want to know which "url" you are coming from ?  
Or do logic A when user clicked the browser back button, and logic B when user clicked on a link in the page ?  

## API

```ts
const Component = () => {

  useNextNavigationEvent({
    
    // this handler is invoked BEFORE transitioning to new page/route, 
    // <Link> click or router.push() and browser button start the transition
    onRouteChangeStart: ({ newUrl, options, oldUrl, type  }) => {
      // newUrl - string - url navigation is going to
      // options - object - options passed to <Link> or router.push when triggering navigation
      // oldUrl - string - url navigation is coming from
      // type - "BACK_OR_FORWARD" | "REGULAR_NAVIGATION" - which type of navigation is this
    },



    // this handler is invoked AFTER transitioning to new page/route
    // <Link> click or router.push() and browser button start the transition
    onRouteChangeComplete: ({ newUrl, options, oldUrl, type  }) => {
    // newUrl - string - url navigation is going to
    // options - object - options passed to <Link> or router.push when triggering navigation
    // oldUrl - string - url navigation is coming from
    // type - "BACK_OR_FORWARD" | "REGULAR_NAVIGATION" - which type of navigation is this
    },


    // This handler is invoked when the browser tab is going to be deactivated and closed
    onWindowBeforeUnload: (event: BeforeUnloadEvent) => {
      // event - BeforeUnloadEvent - native event
    }
  }

  return /* jsx */
}
```

## Example - Custom Scroll Restoration Flow

> NOTE:  
> Here it's pseudo code only.  
> For a copy paste solution go [here](https://github.com/tresorama/use-next-navigation-event/blob/main/apps/next13/src/components/use-scroll-restoration.ts)

```tsx
const _scrollRestoration = {
  persistScrollPositionSnapshot:(oldUrl) => {
    // save scroll position for this url in localStorage
    // oldUrl is the url you are exiting from
  },
  restoreScrollPositionSnapshot: (newUrl) => {
    // retrieve previously saved scroll position for this url 
    // from localStorage and restore scroll position
  },
  forget: () => {
    // clear loclStorage item used for scroll position
  }
}

const useScrollRestoration = () => {
  useNextNavigationEvent({
    onRouteChangeStart: ({ newUrl, options, oldUrl, type  }) => {
      _scrollRestoration.persistScrollPositionSnapshot(oldUrl);
    },
    onRouteChangeComplete: ({ newUrl, options, oldUrl, type }) => {
      if (type === 'BACK_OR_FORWARD') {
        _scrollRestoration.restoreScrollPositionSnapshot(newUrl);
      }
      if (type === 'REGULAR_NAVIGATION') {
        _scrollRestoration.scrollToTop();
      }
    },
    onWindowBeforeUnload: () => _scrollRestoration.forget(),
  });
};

const Component = () => {
  useScrollRestoration();

  return <div>...</div>
}
```

## TODO

[x] Minimal Example usage  
[x] Minimal Docs  
[x] TsDocs for intellisense  
[x] Docs  


## Found a bug ? Have suggestion ?

You are welcome, open an issue.

## Credits

Created by Jacopo Marrone
Email: jacopo.marrone27@gmail.com
Github: https://github.com/tresorama
