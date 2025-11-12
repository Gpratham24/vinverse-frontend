/**
 * Analytics utility for VinVerse
 * Placeholder for Google Analytics, Hotjar, or other analytics services
 */

// Initialize analytics (call this in main.jsx or App.jsx)
export const initAnalytics = () => {
  // Google Analytics 4 example
  // Replace with your actual GA4 measurement ID
  const GA_MEASUREMENT_ID = process.env.VITE_GA_MEASUREMENT_ID || '';
  
  if (GA_MEASUREMENT_ID && typeof window !== 'undefined') {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
    
    console.log('Analytics initialized');
  }
};

// Track page views
export const trackPageView = (path) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.VITE_GA_MEASUREMENT_ID, {
      page_path: path,
    });
  }
};

// Track events
export const trackEvent = (eventName, eventParams = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

// Track user actions
export const trackUserAction = (action, category, label, value) => {
  trackEvent(action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Track CTA clicks
export const trackCTAClick = (ctaName, location) => {
  trackUserAction('cta_click', 'engagement', ctaName, null);
  trackEvent('cta_click', {
    cta_name: ctaName,
    location: location,
  });
};

// Track signup
export const trackSignup = (method = 'email') => {
  trackEvent('sign_up', {
    method: method,
  });
};

// Track login
export const trackLogin = (method = 'email') => {
  trackEvent('login', {
    method: method,
  });
};

// Track tournament actions
export const trackTournamentAction = (action, tournamentId) => {
  trackEvent('tournament_action', {
    action: action,
    tournament_id: tournamentId,
  });
};

