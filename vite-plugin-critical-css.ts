import type { Plugin } from 'vite';

/**
 * Vite plugin that:
 * 1. Converts render-blocking CSS <link> tags to async loading
 * 2. Inlines critical above-the-fold CSS for the hero section
 * 
 * This eliminates the 8,110ms render-blocking CSS penalty.
 */
export function criticalCssPlugin(): Plugin {
  return {
    name: 'vite-plugin-critical-css',
    enforce: 'post',
    apply: 'build',
    transformIndexHtml(html) {
      // Critical CSS for above-the-fold hero section rendering
      // This is a minimal subset needed to paint the hero without FOUC
      const criticalCss = `
/* Critical above-the-fold CSS - inlined to avoid render-blocking */
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font-family:'Inter','Inter Fallback',-apple-system,BlinkMacSystemFont,sans-serif;-webkit-font-smoothing:antialiased}
#root{min-height:100vh}
:root{--body-color:#2c2d2a;--romantic-bg:#fbfaf6;--body-font:"Montserrat",sans-serif;--italic-font:"EB Garamond",serif}
.carousel-hero-container{width:100%;min-height:100vh;max-height:100vh;display:flex;justify-content:center;align-items:center;padding:2em;background-color:var(--romantic-bg);position:relative;overflow:hidden}
.hero-video-bg{position:absolute;top:0;left:0;right:0;bottom:0;width:100%;height:100vh;min-height:100vh;object-fit:cover;object-position:center;z-index:0;pointer-events:none}
.carousel-hero-wrapper{max-width:1100px;border-radius:4px;max-height:680px;height:90vh;width:100%;display:flex;flex-direction:column;background-color:var(--romantic-bg);padding:0 30px;overflow:hidden;position:relative;z-index:1}
.mySwiper{display:flex;flex-grow:1;position:relative;width:100%!important;height:100%!important;overflow:hidden}
.mySwiper .swiper-wrapper{width:100%!important;height:100%!important}
.mySwiper .swiper-slide{width:100%!important;height:100%!important;display:flex!important;align-items:center;justify-content:space-between}
.main{padding:20px 0 30px;display:flex;flex-grow:1;position:relative;align-items:flex-start;justify-content:space-between;margin-top:-20px;overflow:visible}
.left-side{display:flex;flex-direction:column;justify-content:space-between;max-width:320px;flex:0 0 auto}
.main-wrapper{display:flex;flex-direction:column;opacity:1;overflow:visible;width:100%;min-width:0}
.main-content{display:flex;flex-direction:column;opacity:1}
.main-header{text-transform:uppercase;font-size:14px;letter-spacing:4px;font-weight:600;color:var(--body-color);z-index:10;position:relative}
.main-title{font-family:var(--italic-font);font-size:100px;font-weight:400;margin-top:10px;margin-bottom:40px;line-height:1.15em;color:var(--body-color);overflow:visible;min-height:1.2em}
.main-content__title{font-size:26px;font-family:var(--italic-font);font-style:italic;margin-bottom:14px;color:var(--body-color);min-height:1.5em}
.main-content__subtitle{font-size:14px;line-height:1.5;margin-bottom:24px;color:var(--body-color);min-height:4em}
.more-menu{font-size:13px;font-weight:500;display:flex;align-items:center;cursor:pointer;color:var(--body-color);background:none;border:none;padding:0}
.more-menu svg{width:28px;height:18px;margin-left:10px}
.center{display:flex;margin-left:120px;position:relative;flex-shrink:0;transform:translateX(-50px)}
.right-side__img{position:relative;width:320px;height:450px;display:flex;align-items:center;justify-content:center;border-radius:160px;overflow:hidden}
.bottle-img{width:100%;height:100%;object-fit:cover}
.swiper-pagination{font-family:var(--body-font);font-size:14px;font-weight:500;letter-spacing:2px;color:var(--body-color);text-align:left;padding:10px 0}
/* Mobile critical */
@media(max-width:768px){
.carousel-hero-container{padding:0;margin-top:-80px;padding-top:80px;background-color:transparent;width:100vw;max-width:100vw;height:100vh;max-height:100vh;overflow-x:hidden;overflow-y:visible;isolation:isolate}
.hero-video-bg{position:absolute!important;width:100%!important;max-width:100%!important;left:0!important;right:0!important;top:-80px!important;bottom:0!important;height:calc(100vh + 200px)!important;min-height:calc(100vh + 200px)!important;z-index:0!important;pointer-events:none!important}
.carousel-hero-wrapper{max-width:100%;max-height:100%;height:100vh;min-height:100vh;background-color:transparent;padding:2.5em 2em;border-radius:0;overflow-x:hidden;overflow-y:visible}
.main{justify-content:flex-start!important;align-items:center!important;flex-direction:column!important;padding-top:30px!important;margin-top:75px!important;min-height:100vh}
.left-side{max-width:100%!important;width:100%!important;text-align:center;margin:0 auto;padding:0 .5em}
.main-wrapper,.main-content{width:100%;align-items:center;padding:0}
.main-header,.main-title,.main-content__title,.main-content__subtitle,.more-menu{color:#fff!important;text-shadow:0 3px 12px rgba(0,0,0,.8),0 2px 6px rgba(0,0,0,.6),0 1px 3px rgba(0,0,0,.4)}
.main-subtitle,.swiper-pagination,.center,.right-side__img{display:none!important}
.main-header{padding:0 .5em!important;width:100%!important;text-align:center!important}
}
@media(max-width:575px){.main-title{font-size:60px}.main-content__title{font-size:20px}.main-content__subtitle{font-size:13px}}
@media(max-width:480px){.carousel-hero-wrapper{height:100vh;min-height:100vh;max-height:none;padding:2em 1.5em}.main{padding-top:40px!important;margin-top:75px!important;min-height:100vh}.main-header{padding:0 .75em!important;font-size:13px;letter-spacing:3px}}
/* Navigation critical */
.min-h-screen{min-height:100vh}
.overflow-x-hidden{overflow-x:hidden}
.relative{position:relative}
.z-10{z-index:10}
`;

      // Find CSS link tags and convert them to async loading
      // Pattern: <link rel="stylesheet" crossorigin href="/assets/index-HASH.css">
      const cssLinkRegex = /<link\s+rel="stylesheet"\s+crossorigin\s+href="(\/assets\/index-[^"]+\.css)">/g;
      
      let modified = html;
      const cssLinks: string[] = [];
      
      modified = modified.replace(cssLinkRegex, (match, href) => {
        cssLinks.push(href);
        // Convert to async loading: media="print" with onload swap to "all"
        // Plus noscript fallback for non-JS browsers
        return `<link rel="stylesheet" href="${href}" media="print" onload="this.media='all'" crossorigin>
    <noscript><link rel="stylesheet" href="${href}" crossorigin></noscript>`;
      });

      // If we found CSS links, inject critical CSS before them
      if (cssLinks.length > 0) {
        const criticalStyleTag = `<style id="critical-css">${criticalCss}</style>`;
        // Insert critical CSS right before the first async CSS link
        modified = modified.replace(
          /<link rel="stylesheet" href="\/assets\/index-/,
          `${criticalStyleTag}\n    <link rel="stylesheet" href="/assets/index-`
        );
      }

      return modified;
    },
  };
}
