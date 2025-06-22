// Script de seguridad para Pika Snacks
// Detecta y bloquea publicidad no deseada de forma no intrusiva

(function() {
    'use strict';
    
    // Lista de dominios de publicidad conocidos
    const adDomains = [
        'doubleclick.net',
        'googleadservices.com',
        'googlesyndication.com',
        'amazon-adsystem.com',
        'adnxs.com',
        'advertising.com',
        'adtech.com',
        'adform.net',
        'criteo.com',
        'taboola.com',
        'outbrain.com',
        'popads.net',
        'popundertotal.com',
        'popunder.com',
        'popunder.net',
        'popunder.org',
        'popunder.info',
        'popunder.biz',
        'popunder.co',
        'popunder.me',
        'popunder.tv',
        'popunder.cc'
    ];
    
    // Lista de scripts maliciosos conocidos
    const maliciousScripts = [
        'crypto-miner',
        'coin-hive',
        'coinhive',
        'cryptoloot',
        'minero',
        'miner',
        'crypto',
        'coin',
        'mine',
        'hash',
        'pool',
        'worker',
        'webworker',
        'webgl',
        'canvas',
        'webassembly',
        'wasm'
    ];
    
    // Función para detectar y bloquear publicidad de forma no intrusiva
    function blockAds() {
        try {
            // Bloquear iframes de publicidad
            const iframes = document.querySelectorAll('iframe');
            iframes.forEach(iframe => {
                const src = iframe.src || '';
                if (adDomains.some(domain => src.includes(domain))) {
                    iframe.style.display = 'none';
                    console.log('Publicidad bloqueada:', src);
                }
            });
            
            // Bloquear scripts de publicidad (solo los externos maliciosos)
            const scripts = document.querySelectorAll('script[src]');
            scripts.forEach(script => {
                const src = script.src || '';
                if (adDomains.some(domain => src.includes(domain)) ||
                    maliciousScripts.some(keyword => src.toLowerCase().includes(keyword))) {
                    script.remove();
                    console.log('Script malicioso bloqueado:', src);
                }
            });
            
            // Bloquear elementos con clases de publicidad (solo los obvios)
            const adElements = document.querySelectorAll('[class*="advertisement"], [id*="advertisement"], [class*="adsense"], [id*="adsense"]');
            adElements.forEach(element => {
                if (!element.closest('.pika-content')) {
                    element.style.display = 'none';
                    console.log('Elemento de publicidad bloqueado');
                }
            });
        } catch (error) {
            console.log('Error en bloqueo de publicidad:', error);
        }
    }
    
    // Función para detectar minería de criptomonedas (solo monitoreo)
    function detectCryptoMining() {
        try {
            // Detectar Web Workers sospechosos
            if (typeof Worker !== 'undefined') {
                const originalWorker = window.Worker;
                window.Worker = function(script) {
                    if (maliciousScripts.some(keyword => script.includes(keyword))) {
                        console.log('Worker malicioso detectado:', script);
                        return null;
                    }
                    return new originalWorker(script);
                };
            }
        } catch (error) {
            console.log('Error en detección de minería:', error);
        }
    }
    
    // Función para bloquear popups no deseados
    function blockPopups() {
        try {
            // Bloquear window.open no autorizado
            const originalOpen = window.open;
            window.open = function(url, name, features) {
                if (url && adDomains.some(domain => url.includes(domain))) {
                    console.log('Popup de publicidad bloqueado:', url);
                    return null;
                }
                return originalOpen.call(this, url, name, features);
            };
        } catch (error) {
            console.log('Error en bloqueo de popups:', error);
        }
    }
    
    // Función para monitorear cambios en el DOM (solo para elementos obvios)
    function monitorDOM() {
        try {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.type === 'childList') {
                        mutation.addedNodes.forEach(function(node) {
                            if (node.nodeType === 1 && node.outerHTML) { // Element node
                                if (adDomains.some(domain => node.outerHTML.includes(domain))) {
                                    node.remove();
                                    console.log('Elemento de publicidad removido del DOM');
                                }
                            }
                        });
                    }
                });
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } catch (error) {
            console.log('Error en monitoreo DOM:', error);
        }
    }
    
    // Inicializar funciones de seguridad de forma no intrusiva
    function initSecurity() {
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(blockAds, 1000);
                detectCryptoMining();
                blockPopups();
                monitorDOM();
            });
        } else {
            setTimeout(blockAds, 1000);
            detectCryptoMining();
            blockPopups();
            monitorDOM();
        }
        
        // Ejecutar periódicamente pero con menos frecuencia
        setInterval(blockAds, 10000);
    }
    
    // Iniciar seguridad
    initSecurity();
    
    // Exponer funciones para debugging
    window.pikaSecurity = {
        blockAds: blockAds,
        detectCryptoMining: detectCryptoMining
    };
    
})(); 