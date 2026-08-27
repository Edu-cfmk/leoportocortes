'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/pwabuilder-sw.js').then(
          function(registration) {
            console.log('ServiceWorker registrado com sucesso:', registration.scope);
          },
          function(err) {
            console.log('Falha ao registrar o ServiceWorker:', err);
          }
        );
      });
    }
  }, []);

  return null;
}