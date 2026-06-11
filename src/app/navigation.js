// src/app/navigation.js
// Holds a reference to the active router so non-component modules
// (socket handlers, interceptors) can navigate without window.location.
let routerRef = null;

export const registerRouter = (router) => {
  routerRef = router;
};

export const navigateTo = (path) => {
  if (routerRef && typeof path === 'string') {
    routerRef.navigate(path);
  }
};
