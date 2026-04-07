export const MeldSkeleton = {
  install(api) {
    api.defineMeld('meld-skeleton', (el) => {
      const w = el.getAttribute('width') || '100%';
      const h = el.getAttribute('height') || '20px';
      const circle = el.hasAttribute('circle');
      return api.meldHtml`
        <style>
          :host { display: block; }
          .shimmer {
            width: ${w}; height: ${h};
            background: #eee;
            border-radius: ${circle ? '50%' : '4px'};
            background-image: linear-gradient(90deg, #eee 0%, #f5f5f5 50%, #eee 100%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        </style>
        <div class="shimmer"></div>
      `;
    });
  }
};
