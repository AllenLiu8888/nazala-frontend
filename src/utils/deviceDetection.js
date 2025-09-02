// Device detection utilities for Nazala Frontend
// 用于检测用户设备类型，决定显示大屏幕界面还是手机界面

/**
 * 检测是否为移动设备
 * @returns {boolean} 如果是移动设备返回true
 */
export const isMobile = () => {
  // 检查屏幕宽度和用户代理字符串
  return window.innerWidth < 768 || 
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * 检测是否为大屏幕设备（用于显示游戏Dashboard）
 * @returns {boolean} 如果是大屏幕设备返回true
 */
export const isLargeScreen = () => {
  return window.innerWidth >= 1024 && !isMobile();
};

/**
 * 获取设备类型
 * @returns {'mobile' | 'screen' | 'tablet'} 设备类型
 */
export const getDeviceType = () => {
  if (isMobile()) return 'mobile';
  if (isLargeScreen()) return 'screen';
  return 'tablet'; // 平板设备暂时按大屏处理
};

/**
 * 检测是否为触摸设备
 * @returns {boolean} 如果支持触摸返回true
 */
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * 获取屏幕方向
 * @returns {'portrait' | 'landscape'} 屏幕方向
 */
export const getScreenOrientation = () => {
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
};

/**
 * 创建设备检测的React Hook（用于响应式更新）
 * 需要在组件中使用useState和useEffect配合
 */
export const createDeviceDetector = () => {
  const getCurrentDevice = () => ({
    type: getDeviceType(),
    isMobile: isMobile(),
    isLargeScreen: isLargeScreen(),
    isTouchDevice: isTouchDevice(),
    orientation: getScreenOrientation(),
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight
  });
  
  return getCurrentDevice;
};