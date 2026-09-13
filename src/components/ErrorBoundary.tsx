import { Component, type ErrorInfo, type ReactNode } from 'react';

export class ErrorBoundary extends Component<{children:ReactNode;label?:string;language?:'ar'|'en'},{hasError:boolean}> {
  state={hasError:false};
  static getDerivedStateFromError(){return {hasError:true};}
  componentDidCatch(error:Error,info:ErrorInfo){console.error('TAAMEN feature error',error,info);}
  render(){
    if(!this.state.hasError)return this.props.children;
    const ar=this.props.language==='ar';
    return <section className="page-content"><div className="error-state panel"><span className="eyebrow">TAAMEN / {this.props.label||'FEATURE'}</span><h2>{ar?'حدث خطأ في هذه المساحة':'This feature could not be loaded'}</h2><p>{ar?'باقي TAAMEN ما زال يعمل. أعد المحاولة أو ارجع للصفحة السابقة.':'The rest of TAAMEN is still available. Retry or return to the previous page.'}</p><button className="dark-action" onClick={()=>this.setState({hasError:false})}>{ar?'إعادة المحاولة':'Retry'}</button></div></section>;
  }
}
