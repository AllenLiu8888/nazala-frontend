// Device detection utilities
export const isMobile = () => {
  return window.innerWidth < 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isLargeScreen = () => {
  return window.innerWidth >= 1024 && !isMobile();
};

export const getDeviceType = () => {
  if (isMobile()) return 'mobile';
  if (isLargeScreen()) return 'screen';
  return 'tablet';
};