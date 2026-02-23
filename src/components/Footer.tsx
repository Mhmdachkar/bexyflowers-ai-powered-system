'use client';

import { motion } from "framer-motion";
import { Heart, Phone, Mail, MapPin, Instagram } from "lucide-react";

// WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-10 sm:py-12 md:py-16 relative z-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid md:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-10 md:mb-12">
          {/* Brand */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3 
              className="font-luxury text-3xl font-normal text-primary"
              style={{ fontFamily: "'EB Garamond', serif", letterSpacing: '-0.02em' }}
            >
              Bexy Flowers
            </h3>
            <p className="font-body text-background/80 leading-relaxed">
              Crafting luxury floral experiences with premium arrangements and bespoke designs for every special moment.
            </p>
            <div className="flex items-center space-x-2 text-primary">
              <Heart className="w-4 h-4" />
              <span className="font-body text-sm">Made with love</span>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="font-luxury text-xl font-normal text-primary" style={{ letterSpacing: '-0.02em' }}>Quick Links</h4>
            <ul className="space-y-2 font-body">
              <li><a href="/collection" className="text-background/80 hover:text-primary transition-colors">Shop All</a></li>
              <li><a href="/customize" className="text-background/80 hover:text-primary transition-colors">Custom Bouquets</a></li>
              <li><a href="/about" className="text-background/80 hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#contact" className="text-background/80 hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </motion.div>

          {/* Customer Service */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="font-luxury text-xl font-normal text-primary" style={{ letterSpacing: '-0.02em' }}>Customer Service</h4>
            <ul className="space-y-2 font-body">
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors">Delivery Info</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors">Returns</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="text-background/80 hover:text-primary transition-colors">Support</a></li>
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="font-luxury text-xl font-normal text-primary" style={{ letterSpacing: '-0.02em' }}>Get In Touch</h4>
            <div className="flex flex-col gap-3 font-body">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary" />
                <a
                  href="https://api.whatsapp.com/send/?phone=96176104882&text&type=phone_number&app_absent=0&wame_ctl=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/80 hover:text-primary transition-colors"
                >
                  +961 76 104 882
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary" />
                <a
                  href="mailto:bexyflowersmsg@gmail.com"
                  className="text-background/80 hover:text-primary transition-colors"
                >
                  bexyflowersmsg@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary" />
                <a
                  href="https://maps.app.goo.gl/DHhr6EeXay2powJeA?g_st=iw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-background/80 hover:text-primary transition-colors"
                >
                  View Location
                </a>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex gap-3 sm:gap-4 pt-3 sm:pt-4">
              <motion.a
                href="https://api.whatsapp.com/send/?phone=96176104882&text&type=phone_number&app_absent=0&wame_ctl=1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-11 sm:h-11 bg-primary/20 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-background transition-colors touch-target"
                style={{ minWidth: '44px', minHeight: '44px' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://www.instagram.com/bexyflowers?igsh=cTcybzM0dzVkc25v"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-11 sm:h-11 bg-primary/20 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-background transition-colors touch-target"
                style={{ minWidth: '44px', minHeight: '44px' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="https://www.tiktok.com/@bexyflower?_r=1&_t=ZS-91i2FtAJdVF"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 sm:w-11 sm:h-11 bg-primary/20 rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-background transition-colors touch-target"
                style={{ minWidth: '44px', minHeight: '44px' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label="TikTok"
              >
                <TikTokIcon className="w-5 h-5" />
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="border-t border-background/20 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <p className="font-body text-background/60 text-sm">
            © 2024 Bexy Flowers. All rights reserved. Crafted with care and elegance.
          </p>
          <div className="flex gap-4 sm:gap-6 font-body text-xs sm:text-sm">
            <a href="#" className="text-background/60 hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-background/60 hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="text-background/60 hover:text-primary transition-colors">Cookies</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;