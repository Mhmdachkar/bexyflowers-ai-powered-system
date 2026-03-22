import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Cookie } from 'lucide-react';

const STORAGE_KEY = 'bexy_cookie_consent';

type ConsentState = 'accepted' | 'declined' | null;

export default function CookieBanner() {
  const [consent, setConsent] = useState<ConsentState>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentState;
    setConsent(stored);
    // Small delay so it doesn't flash on first paint
    const t = setTimeout(() => setMounted(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setConsent('accepted');
  };

  const handleDecline = () => {
    localStorage.setItem(STORAGE_KEY, 'declined');
    setConsent('declined');
  };

  const isVisible = mounted && consent === null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4 sm:px-6 sm:pb-6"
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '110%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        >
          <div
            className="max-w-4xl mx-auto rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6"
            style={{
              background: 'linear-gradient(135deg, #1c1a17 0%, #2a2620 100%)',
              boxShadow: '0 -4px 40px rgba(0,0,0,0.25), 0 8px 40px rgba(0,0,0,0.15)',
              border: '1px solid rgba(199,158,72,0.2)',
            }}
          >
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(199,158,72,0.15)', border: '1px solid rgba(199,158,72,0.3)' }}
            >
              <Cookie size={18} style={{ color: '#C79E48' }} />
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-semibold text-white mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                We value your privacy
              </p>
              <p
                className="text-xs leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.6)', fontFamily: "'EB Garamond', serif", fontSize: '0.82rem' }}
              >
                We use cookies to enhance your browsing experience, serve personalised content, and analyse our traffic. By clicking "Accept All", you consent to our use of cookies.{' '}
                <a
                  href="#"
                  className="underline underline-offset-2 hover:text-[#C79E48] transition-colors"
                  style={{ color: 'rgba(255,255,255,0.75)' }}
                >
                  Privacy Policy
                </a>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2.5 flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={handleDecline}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-medium transition-all"
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  fontFamily: "'EB Garamond', serif",
                  background: 'transparent',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              >
                Decline
              </button>
              <motion.button
                onClick={handleAccept}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all"
                style={{
                  background: 'linear-gradient(135deg,#C79E48,#d4af52)',
                  boxShadow: '0 4px 14px rgba(199,158,72,0.4)',
                  fontFamily: "'EB Garamond', serif",
                  letterSpacing: '0.04em',
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Accept All
              </motion.button>
            </div>

            {/* Close (dismiss without choosing) */}
            <button
              onClick={handleDecline}
              className="absolute top-3 right-3 sm:relative sm:top-auto sm:right-auto text-white/30 hover:text-white/70 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
