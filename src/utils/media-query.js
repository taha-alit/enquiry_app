import { useState, useCallback, useEffect } from 'react';


export const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState(getScreenSize());
  const onSizeChanged = useCallback(() => {
    setScreenSize(getScreenSize());
  }, []);

  useEffect(() => {
    subscribe(onSizeChanged);

    return () => {
      unsubscribe(onSizeChanged);
    };
  }, [onSizeChanged]);

  return screenSize;
};

export const useScreenSizeClass = () => {
  const screenSize = useScreenSize();

  if (screenSize.isExLarge) {
    return 'screen-ex-large';
  }

  if (screenSize.isLarge) {
    return 'screen-large';
  }

  if (screenSize.isMedium) {
    return 'screen-medium';
  }

  if (screenSize.isSmall) {
    return 'screen-small';
  }

  if (screenSize.isXSmall) {
    return 'screen-x-small';
  }

  if (screenSize.isXXSmall) {
    return 'screen-xx-small';
  }
  return 'screen-ex-small';
}

let handlers = [];
const exSmallMedia = window.matchMedia('(max-width: 374.99px)');
const xxSmallMedia = window.matchMedia('(min-width: 375px) and (max-width: 479.99px)') 
const xSmallMedia = window.matchMedia('(min-width: 480px) and (max-width: 767.99px)');
const smallMedia = window.matchMedia('(min-width: 768px) and (max-width: 959.99px)');
const mediumMedia = window.matchMedia('(min-width: 960px) and (max-width: 1279.99px)');
const largeMedia = window.matchMedia('(min-width: 1280px) and (max-width: 1919.99px)');
const exLargeMedia = window.matchMedia('(min-width: 1920px)');

[exSmallMedia, xxSmallMedia, xSmallMedia, smallMedia, mediumMedia, largeMedia, exLargeMedia].forEach(media => {
  media.addListener((e) => {
    e.matches && handlers.forEach(handler => handler());
  });
});

const subscribe = (handler) => handlers.push(handler);

const unsubscribe = (handler) => {
  handlers = handlers.filter(item => item !== handler);
};

function getScreenSize() {
  return {
    isExSmall: exSmallMedia.matches,
    isXXSmall: xxSmallMedia.matches,
    isXSmall: xSmallMedia.matches,
    isSmall: smallMedia.matches,
    isMedium: mediumMedia.matches,
    isLarge: largeMedia.matches,
    isExLarge: exLargeMedia.matches
  };
}
