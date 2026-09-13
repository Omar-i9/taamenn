export async function requestLandscape(){
  try { const orientation = screen.orientation as ScreenOrientation & { lock?: (o:'landscape')=>Promise<void> }; if(orientation.lock) await orientation.lock('landscape'); return true; } catch { return false; }
}
export async function releaseOrientation(){ try { const orientation=screen.orientation as ScreenOrientation & { unlock?:()=>void }; orientation.unlock?.(); } catch {} }
