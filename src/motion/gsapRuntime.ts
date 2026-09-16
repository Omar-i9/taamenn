import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

// Registered once so every useGSAP scope is cleaned up by GSAP itself.
gsap.registerPlugin(useGSAP);

export { gsap, useGSAP };
