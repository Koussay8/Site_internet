import { headers } from 'next/headers';

// Import direct - le SSR génère le HTML complet immédiatement
// Pas de dynamic() qui crée un délai d'attente JS côté client
import MobileHome from '@/components/MobileHome';
import DesktopHome from '@/components/DesktopHome';

// Détection User-Agent côté serveur - évite le flash client-side
function detectMobileFromUserAgent(userAgent: string | null): boolean {
  if (!userAgent) return false;
  
  // Patterns mobiles courants
  const mobilePatterns = [
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /Android/i,
    /webOS/i,
    /BlackBerry/i,
    /Windows Phone/i,
    /Opera Mini/i,
    /IEMobile/i,
    /Mobile/i,
    /mobile/i,
  ];
  
  return mobilePatterns.some(pattern => pattern.test(userAgent));
}

export default async function Home() {
  // Récupère le User-Agent côté serveur (SSR)
  const headersList = await headers();
  const userAgent = headersList.get('user-agent');
  
  // Détection serveur - le HTML correct est envoyé immédiatement
  const isMobile = detectMobileFromUserAgent(userAgent);

  return isMobile ? <MobileHome /> : <DesktopHome />;
}


