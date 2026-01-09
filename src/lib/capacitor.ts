// Capacitor native bridge utilities
// These imports are optional - only available in native builds
let Capacitor: typeof import('@capacitor/core').Capacitor | null = null;
let Camera: typeof import('@capacitor/camera').Camera | null = null;
let CameraResultType: typeof import('@capacitor/camera').CameraResultType | null = null;
let CameraSource: typeof import('@capacitor/camera').CameraSource | null = null;
let Share: typeof import('@capacitor/share').Share | null = null;
let StatusBar: typeof import('@capacitor/status-bar').StatusBar | null = null;
let Style: typeof import('@capacitor/status-bar').Style | null = null;
let Keyboard: typeof import('@capacitor/keyboard').Keyboard | null = null;
let App: typeof import('@capacitor/app').App | null = null;
let PushNotifications: typeof import('@capacitor/push-notifications').PushNotifications | null = null;

// Try to import Capacitor - will fail gracefully if not available
// Using dynamic imports to avoid build errors when Capacitor is not installed
if (typeof window !== 'undefined') {
  // Dynamic imports are async, so we load them in the background
  // This allows the code to work even if Capacitor packages aren't installed
  void Promise.all([
    import('@capacitor/core').catch(() => null),
    import('@capacitor/camera').catch(() => null),
    import('@capacitor/share').catch(() => null),
    import('@capacitor/status-bar').catch(() => null),
    import('@capacitor/keyboard').catch(() => null),
    import('@capacitor/app').catch(() => null),
    import('@capacitor/push-notifications').catch(() => null),
  ]).then(([core, camera, share, statusBar, keyboard, app, push]) => {
    if (core) Capacitor = core.Capacitor;
    if (camera) {
      Camera = camera.Camera;
      CameraResultType = camera.CameraResultType;
      CameraSource = camera.CameraSource;
    }
    if (share) Share = share.Share;
    if (statusBar) {
      StatusBar = statusBar.StatusBar;
      Style = statusBar.Style;
    }
    if (keyboard) Keyboard = keyboard.Keyboard;
    if (app) App = app.App;
    if (push) PushNotifications = push.PushNotifications;
  }).catch(() => {
    // Capacitor not available - this is fine for web builds
  });
}

export const isNative = Capacitor?.isNativePlatform() ?? false;
export const platform = Capacitor?.getPlatform() ?? 'web';

// Initialize native features
export async function initNativeFeatures() {
  if (!isNative || !StatusBar || !Style || !Keyboard || !App || !PushNotifications) return;

  try {
    // Set status bar style
    await StatusBar.setStyle({ style: Style.Dark });
    
    // Configure keyboard
    Keyboard.setAccessoryBarVisible({ isVisible: true });
    
    // Handle app state changes
    App.addListener('appStateChange', ({ isActive }) => {
      // Log app state changes for debugging
      if (process.env.NODE_ENV === 'development') {
        // Using logger would require importing it, but this is optional native code
        // Keeping minimal logging here to avoid dependencies
      }
    });

    // Initialize push notifications
    await PushNotifications.requestPermissions();
    const permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === 'granted') {
      await PushNotifications.register();
    }
  } catch (error) {
    // Silently fail - native features are optional
    logger.error("Error initializing native features", error instanceof Error ? error : new Error(String(error)));
  }
}

// Camera integration
export async function capturePhoto(): Promise<string | null> {
  if (!Camera || !CameraResultType || !CameraSource) return null;
  
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });
    return image.dataUrl || null;
  } catch (error) {
    logger.error("Error capturing photo", error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

export async function pickFromGallery(): Promise<string | null> {
  if (!Camera || !CameraResultType || !CameraSource) return null;
  
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });
    return image.dataUrl || null;
  } catch (error) {
    logger.error("Error picking from gallery", error instanceof Error ? error : new Error(String(error)));
    return null;
  }
}

// Native share
export async function nativeShare(options: { title: string; text?: string; url?: string }) {
  if (!Share) return;
  
  try {
    await Share.share({
      title: options.title,
      text: options.text,
      url: options.url,
    });
  } catch (error) {
    logger.error("Error sharing content", error instanceof Error ? error : new Error(String(error)));
  }
}

// Keyboard events
export function onKeyboardShow(callback: (height: number) => void) {
  if (!Keyboard) return;
  
  Keyboard.addListener('keyboardWillShow', (info) => {
    callback(info.keyboardHeight);
  });
}

export function onKeyboardHide(callback: () => void) {
  if (!Keyboard) return;
  
  Keyboard.addListener('keyboardWillHide', () => {
    callback();
  });
}

// App lifecycle
export function onAppPause(callback: () => void) {
  if (!App) return;
  
  App.addListener('appStateChange', ({ isActive }) => {
    if (!isActive) callback();
  });
}

export function onAppResume(callback: () => void) {
  if (!App) return;
  
  App.addListener('appStateChange', ({ isActive }) => {
    if (isActive) callback();
  });
}


