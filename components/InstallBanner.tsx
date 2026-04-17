import React, { useEffect, useState } from 'react';

const InstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };

    const onInstalled = () => {
      setVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall as EventListener);
    window.addEventListener('appinstalled', onInstalled as EventListener);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall as EventListener);
      window.removeEventListener('appinstalled', onInstalled as EventListener);
    };
  }, []);

  if (!visible) return null;

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice && choice.outcome === 'accepted') {
      setVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  return (
    <div className="fixed left-4 right-4 bottom-6 z-50 flex items-center justify-between bg-slate-900/90 border border-white/10 rounded-2xl p-3 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center font-bold">PWA</div>
        <div>
          <div className="font-bold">Install Busia Soccer</div>
          <div className="text-sm text-slate-400">Add the app to your device for quick access.</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={handleInstallClick} className="bg-emerald-600 text-black font-bold px-4 py-2 rounded-lg">Install</button>
        <button onClick={handleDismiss} className="text-slate-400 px-3 py-2">Dismiss</button>
      </div>
    </div>
  );
};

export default InstallBanner;
