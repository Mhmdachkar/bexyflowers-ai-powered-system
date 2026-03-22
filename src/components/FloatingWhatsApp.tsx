import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from '@/lib/navigation-compat';

const WA_LINK =
  'https://api.whatsapp.com/send/?phone=96176104882&text=Hello%2C%20I%27m%20interested%20in%20ordering%20from%20Bexy%20Flowers%20%F0%9F%8C%B8&type=phone_number&app_absent=0';

const HIDDEN_ROUTES = ['/admin', '/checkout'];

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

export default function FloatingWhatsApp() {
  const location = useLocation();
  const [showTooltip, setShowTooltip] = useState(false);
  const [visible, setVisible] = useState(false);

  // Hide on admin / checkout routes
  const isHidden = HIDDEN_ROUTES.some((r) => location.pathname.startsWith(r));

  // Appear after 1.5 s so it doesn't distract on first paint
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (isHidden) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-6 left-5 z-50 flex flex-col items-start gap-2"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        >
          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
                className="ml-1 px-3 py-2 rounded-xl text-xs font-medium text-white shadow-lg whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg,#1a472a,#25D366)',
                  fontFamily: "'EB Garamond', serif",
                  fontSize: '0.82rem',
                  boxShadow: '0 4px 16px rgba(37,211,102,0.35)',
                }}
              >
                💬 Chat with us on WhatsApp
                {/* Arrow pointing down-left to button */}
                <span
                  className="absolute -bottom-1.5 left-5 w-3 h-3 rotate-45"
                  style={{ background: '#1a472a' }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Button */}
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with Bexy Flowers on WhatsApp"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
          >
            <motion.div
              className="relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl cursor-pointer"
              style={{
                background: 'linear-gradient(135deg,#128C7E,#25D366)',
                boxShadow: '0 6px 24px rgba(37,211,102,0.45)',
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.92 }}
            >
              <WhatsAppIcon />
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-[#25D366]" />
            </motion.div>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
