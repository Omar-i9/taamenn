import { useMemo, useState } from 'react';
import { Mail, MessageCircle, Radio, Send, X } from 'lucide-react';
import { WHATSAPP_CHANNEL_URL, WHATSAPP_URL } from '../config/support';
import { api, ApiError } from '../services/apiClient';
import { uiCopy } from '../i18n/translations';

/**
 * The single contact surface in TAAMEN.
 *
 * Messages are posted to the TAAMEN backend. The recipient is chosen by the
 * server-side EmailJS configuration, never by this form.
 */
export default function Support({language,profile,onBack}:{language:'ar'|'en';profile:{firstName:string;email?:string};onBack?:()=>void}){
  const ar=language==='ar';
  const copy=uiCopy[language];
  const profileEmail=profile.email?.trim()||'';
  const hasProfileEmail=profileEmail.includes('@');
  const [email,setEmail]=useState(hasProfileEmail?profileEmail:'');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState('');
  const [failed,setFailed]=useState(false);
  const [sent,setSent]=useState(false);

  const replyEmail=useMemo(()=>hasProfileEmail?profileEmail:email.trim(),[hasProfileEmail,profileEmail,email]);

  const submit=async()=>{
    if(!replyEmail.includes('@')||message.trim().length<3){
      setFailed(true);
      setSent(false);
      setStatus(copy.contactInvalid);
      return;
    }
    setBusy(true);setStatus(copy.contactSending);setFailed(false);setSent(false);
    try{
      const result=await api.sendContactMessage({
        email:replyEmail,
        message:message.trim(),
        name:profile.firstName,
      });
      setSent(true);
      setStatus(result.contactSent && result.autoReplySent===false ? copy.contactPartial : copy.contactSent);
      if(!hasProfileEmail)setEmail('');
      setMessage('');
    }catch(error){
      setFailed(true);
      setSent(false);
      const statusCode=error instanceof ApiError ? error.status : -1;
      if(statusCode===0)setStatus(copy.contactOffline);
      else if(statusCode===400)setStatus(copy.contactInvalid);
      else if(statusCode===429)setStatus(copy.contactRateLimited);
      else if(statusCode===503)setStatus(copy.contactUnconfigured);
      else if(statusCode>=500)setStatus(copy.contactEmailUnavailable);
      else setStatus(copy.contactFailed);
    }finally{
      setBusy(false);
    }
  };

  return <section className="page-content support-page">
    <div className="page-heading"><div><p className="eyebrow">TAAMEN 2.0 / SUPPORT</p><h1>{ar?'الدعم':'Support'}</h1><p className="subtitle">{ar?'طرق مباشرة للوصول إلى دعم TAAMEN.':'Direct ways to reach TAAMEN support.'}</p></div>{onBack&&<button className="dark-action" onClick={onBack}><X size={15}/>{copy.closeViewer}</button>}</div>
    {status&&<div className={`${failed?'error-banner':sent?'success-banner contact-sent':'contact-status'}`} role={failed?'alert':'status'} aria-live="polite">{status}</div>}
    <div className="content-grid support-grid">
      {WHATSAPP_URL&&<section className="panel support-card">
        <MessageCircle size={22} aria-hidden="true"/>
        <div>
          <h2>{copy.supportWhatsAppTitle}</h2>
          <p>{copy.supportWhatsAppBody}</p>
        </div>
        <a className="support-action whatsapp-action" href={WHATSAPP_URL} target="_blank" rel="noreferrer noopener">{copy.openWhatsApp}</a>
      </section>}
      <section className="panel support-card">
        <Radio size={22} aria-hidden="true"/>
        <div>
          <h2>{copy.supportChannelTitle}</h2>
          <p>{copy.supportChannelBody}</p>
        </div>
        <a className="support-action whatsapp-action" href={WHATSAPP_CHANNEL_URL} target="_blank" rel="noreferrer noopener">{copy.openWhatsAppChannel}</a>
      </section>
      <section className="panel support-card support-contact">
        <div className="panel-heading"><div><p className="eyebrow">CONTACT TAAMEN</p><h2>{copy.contactTitle}</h2></div><Mail size={18}/></div>
        {hasProfileEmail
          ? <p className="settings-note">{copy.contactUsingProfileEmail} <strong>{profileEmail}</strong></p>
          : <label>{copy.contactEmailLabel}<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" maxLength={254} autoComplete="email"/></label>}
        <label>{copy.contactMessageLabel}<textarea rows={6} value={message} onChange={e=>setMessage(e.target.value)} placeholder={copy.contactMessagePlaceholder} maxLength={2000}/></label>
        <button className="primary-action" disabled={busy} onClick={submit} aria-busy={busy}>
          <Send size={15}/>{busy?copy.contactSending:failed?copy.contactRetry:copy.contactSend}
        </button>
      </section>
    </div>
  </section>;
}
