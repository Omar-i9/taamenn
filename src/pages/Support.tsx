import { useState } from 'react';
import { Mail, MessageCircle, Phone, Send, X } from 'lucide-react';
import { api } from '../services/apiClient';

const SUPPORT_PHONE=(import.meta.env.VITE_TAAMEN_SUPPORT_PHONE as string|undefined)||'';
const WHATSAPP_URL=(import.meta.env.VITE_TAAMEN_WHATSAPP_URL as string|undefined)||'';

/**
 * The single contact surface in TAAMEN.
 *
 * Messages are submitted to the backend, which holds the support recipient and
 * applies rate limiting. The browser cannot choose where the message goes.
 */
export default function Support({language,profile,onBack}:{language:'ar'|'en';profile:{firstName:string};onBack?:()=>void}){
  const ar=language==='ar';
  const [email,setEmail]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const [status,setStatus]=useState('');
  const [failed,setFailed]=useState(false);

  const submit=async()=>{
    if(!email.includes('@')||message.trim().length<3){
      setFailed(true);
      setStatus(ar?'أدخل بريدًا ورسالة صحيحة.':'Enter a valid email and message.');
      return;
    }
    setBusy(true);setStatus('');setFailed(false);
    try{
      await api.sendContactMessage({email:email.trim(),message:message.trim(),name:profile.firstName});
      setStatus(ar?'تم إرسال رسالتك إلى TAAMEN.':'Your message was sent to TAAMEN.');
      setEmail('');setMessage('');
    }catch(caught){
      setFailed(true);
      setStatus(caught instanceof Error?caught.message:(ar?'تعذر الإرسال.':'Sending failed.'));
    }finally{
      setBusy(false);
    }
  };

  return <section className="page-content support-page">
    <div className="page-heading"><div><p className="eyebrow">TAAMEN 2.0 / SUPPORT</p><h1>{ar?'الدعم':'Support'}</h1><p className="subtitle">{ar?'طرق مباشرة للوصول إلى دعم TAAMEN.':'Direct ways to reach TAAMEN support.'}</p></div>{onBack&&<button className="dark-action" onClick={onBack}><X size={15}/>{ar?'إغلاق':'Close'}</button>}</div>
    {status&&<div className={failed?'error-banner':'success-banner'} role={failed?'alert':undefined}>{status}</div>}
    <div className="content-grid support-grid">
      {WHATSAPP_URL&&<section className="panel support-card"><MessageCircle size={22}/><div><h2>WhatsApp</h2><p>{ar?'تواصل مباشرة عبر قناة الدعم الرسمية.':'Reach the official support channel directly.'}</p></div><a className="support-action whatsapp-action" href={WHATSAPP_URL} target="_blank" rel="noreferrer">{ar?'فتح WhatsApp':'Open WhatsApp'}</a></section>}
      {SUPPORT_PHONE&&<section className="panel support-card"><Phone size={22}/><div><h2>{ar?'رقم الدعم':'Support number'}</h2><p>{SUPPORT_PHONE}</p></div><a className="support-action phone-action" href={`tel:${SUPPORT_PHONE}`}>{ar?'اتصال':'Call'}</a></section>}
      <section className="panel support-card support-contact">
        <div className="panel-heading"><div><p className="eyebrow">CONTACT TAAMEN</p><h2>{ar?'إرسال رسالة':'Send a message'}</h2></div><Mail size={18}/></div>
        <label>{ar?'بريدك الإلكتروني':'Your email'}<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" maxLength={254}/></label>
        <label>{ar?'رسالتك':'Message'}<textarea rows={6} value={message} onChange={e=>setMessage(e.target.value)} placeholder={ar?'اكتب رسالتك…':'Write your message…'} maxLength={2000}/></label>
        <button className="primary-action" disabled={busy} onClick={submit}><Send size={15}/>{busy?(ar?'إرسال…':'Sending…'):(ar?'إرسال الرسالة':'Send message')}</button>
      </section>
    </div>
  </section>;
}
