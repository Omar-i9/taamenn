/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2015 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property laws,
* including trade secret and or copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/
import{dcLocalStorage as e}from"../../common/local-storage.js";import{SIDE_PANEL_HASH_ROUTES as t}from"../../common/constant.js";import{util as o}from"../../browser/js/content-util.js";import{checkCdnConnectivity as n}from"../../common/util.js";import{connectSidePanelPort as r,createSendAnalytics as s,getSidePanelTabId as a,isHomeShellRoute as m}from"./sidePanelUtil.js";import{fetchAndSendHtmlContent as i}from"./htmlContentFetcher.js";import{getGenAiPrerenderState as d,shouldShowTrefoilLoader as l,showTrefoilLoader as c}from"./loaderUIHelper.js";import{Cdn as p}from"./cdn.js";import{initHomeMode as f}from"./home.js";import{initOfflineMode as h}from"./offline.js";import{registerHostedShellListeners as I}from"./shell-listeners.js";const u=Date.now();await e.init();const E=e.getItem("isSidePanelHomeEnabled");let w=e.getItem("touchpoint");e.removeItem("touchpoint");let j=e.getItem("hashRoute");e.removeItem("hashRoute"),w||(w="ExtensionAction",j=t.HOME),E||(j=t.SIDE_PANEL);const b=m(j),H=document.getElementById("tooltipTextEnabled");E&&b&&H&&(H.id="tooltipTextEnabledHome"),o.translateElementsByAppLocale(".translate");const P=await d(j,w);l(P)&&c(),P?.showPreRendered&&(e=>{const t=document.createElement("iframe");t.id="sidepanelPreRendered",t.title="Adobe Chatbot",t.srcdoc=e,document.body.appendChild(t)})(P.ssrHtml);const g=e.getItem("sidepanelUrl");if(g){await n(g)?b?await f(u,j,w):await async function(e,t,o,n){const r=a(),m=s(r);m(`DCBrowserExt:SidePanel:Opened:${t||"Unspecified"}`);const d=new p({initTimeStamp:e,hostedHashRoute:n,touchpoint:t,ssrHtml:o?.ssrHtml,onIframeLoad:()=>m(`DCBrowserExt:SidePanel:IframeLoaded:${t}`),onIframeError:()=>m(`DCBrowserExt:SidePanel:IframeLoadError:${t}`)});I({cdn:d,sendAnalytics:m,tabId:r,touchpoint:t,hashRoute:n}),await i({cdn:d,tabId:d.tabId,touchpoint:t})}(u,w,P,j):h(u)}else{const e=a();r(e,u),chrome.runtime.sendMessage({type:"sidepanel_close_reason",tabId:e,reason:"NoSidepanelUrl"})}