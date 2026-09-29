// Minimal vanilla toast engine, UX adapted from Sonner: single mount point,
// symmetric enter/exit path, transitions (not keyframes) so rapid calls retarget
// smoothly instead of restarting.
(function () {
    const AUTO_DISMISS_MS = 4000;
    const EXIT_MS = 180;

    function getViewport() {
        let el = document.querySelector('.toast-viewport');
        if (!el) {
            el = document.createElement('div');
            el.className = 'toast-viewport';
            el.setAttribute('aria-live', 'polite');
            document.body.appendChild(el);
        }
        return el;
    }

    function showToast(message, variant) {
        if (!message) return;
        const viewport = getViewport();
        const el = document.createElement('div');
        el.className = 'toast';
        el.dataset.state = 'entering';
        if (variant) el.dataset.variant = variant;
        el.textContent = message;
        viewport.appendChild(el);

        // Force layout so the entering -> default transition actually animates.
        requestAnimationFrame(() => requestAnimationFrame(() => {
            el.dataset.state = 'default';
        }));

        function dismiss() {
            el.dataset.state = 'leaving';
            window.setTimeout(() => el.remove(), EXIT_MS);
        }

        el.addEventListener('click', dismiss);
        window.setTimeout(dismiss, AUTO_DISMISS_MS);
    }

    window.movieWebToast = showToast;

    document.addEventListener('DOMContentLoaded', () => {
        const flashEl = document.getElementById('flash-data');
        if (flashEl && flashEl.textContent.trim()) {
            try {
                const flash = JSON.parse(flashEl.textContent);
                showToast(flash.message, flash.type);
            } catch (e) {
                // ignore malformed flash payload
            }
        }
    });
})();
