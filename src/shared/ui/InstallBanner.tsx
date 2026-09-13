import { Download, X } from 'lucide-react';
import { installService } from '../../infrastructure/pwa/installService';
import { useEffect,useState } from 'react';
export function InstallBanner({language}:{language:'ar'|'en'}){
 const ar=language==='ar'; const [state,setState]=useState(installService.getInstallationState());
 useEffect(()=>{const unsubscribe=installService.subscribe(()=>setState(installService.getInstallationState()));return ()=>{unsubscribe?.()};},[]);
 if(state!=='installable' || installService.isDismissed())return null;
 return <div className="install-banner" role="dialog" aria-label={ar?'تثبيت TAAMEN':'Install TAAMEN'}><div><strong>{ar?'ثبّت TAAMEN على جهازك':'Install TAAMEN on your device'}</strong><span>{ar?'استخدمه كتطبيق مستقل مع دعم العمل المحلي دون اتصال.':'Use TAAMEN like an app, with offline local capabilities.'}</span></div><div className="install-actions"><button className="primary-action" onClick={()=>installService.promptInstall()}><Download size={15}/>{ar?'تثبيت TAAMEN':'Install TAAMEN'}</button><button className="icon-button" onClick={()=>installService.dismiss()} aria-label={ar?'لاحقًا':'Later'}><X size={16}/></button></div></div>;
}
