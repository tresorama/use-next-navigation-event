# use-next-navigation-event

Do something on Next.js router navigation event.  
Written in Typescript.  

## When using this over native next/router events

With next/router, in event handlers callback you only know which "url" you are going to.  
What if you want to know which "url" you are coming from ?  
Or maybe have a callback logic if user clicked the browser back button, and an other logic if clicked on a link in the page.  

API of this package extends some of next/router events handlers.  
It just add two parameters.

```ts
const Component = () => {

  useNextNavigationEvent({

    // this handler is invoked BEFORE transitioning to new page/route, 
    // <Link> click or router.push() and browser button start the transition
    onRouteChangeStart: ({ newUrl, options, oldUrl, type  }) => {
      // newUrl - string - url navigation is going to (string)
      // options - object - options passed to <Link> or router.push when triggering navigation
      // oldUrl - string - url navigation is coming from
      // type - "BACK_OR_FORWARD" | "REGULAR_NAVIGATION" - which type of navigation is this
      },



    // Note:
    // this handler is invoked AFTER transitioning to new page/route
    onRouteChangeComplete: ({ newUrl, options, oldUrl, type  }) => {
    // newUrl - string - url navigation is going to (string)
    // options - object - options passed to <Link> or router.push when triggering navigation
    // oldUrl - string - url navigation is coming from
    // type - "BACK_OR_FORWARD" | "REGULAR_NAVIGATION" - which type of navigation is this
    },


    // Note:
    // This handler is invoked when the browser tab is going to be deactivated and closed
    onWindowBeforeUnload: () => {
      //
    }
  }

  return /* jsx */
}
```


## Example - Custom Scroll Restoration Flow

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

export const useScrollRestoration = () => {
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
```



## TODO

[x] Minimal Example usage
[x] Minimal Docs
[] TsDocs for intellisense
[] Docs


