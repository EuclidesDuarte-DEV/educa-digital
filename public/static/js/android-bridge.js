(() => {
  const pending = new Map();
  let counter = 0;
  let initialized = false;

  function nativeObject() {
    return window.EducaAndroid && typeof window.EducaAndroid.postMessage === 'function'
      ? window.EducaAndroid
      : null;
  }

  function setup() {
    if (initialized) return;
    const bridge = nativeObject();
    if (!bridge) return;
    initialized = true;
    bridge.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data || '{}');
        const slot = pending.get(payload.id);
        if (!slot) return;
        pending.delete(payload.id);
        if (payload.ok === false) slot.reject(new Error(payload.error || 'Android API error'));
        else slot.resolve(payload.data ?? payload);
      } catch (_) {}
    };
    document.documentElement.classList.add('android-native-connected');
  }

  function sendNative(action, data = {}) {
    setup();
    const bridge = nativeObject();
    if (!bridge) return Promise.reject(new Error('Native Android bridge unavailable'));
    return new Promise((resolve, reject) => {
      const id = `req_${Date.now()}_${++counter}`;
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error('Android bridge timeout'));
      }, 2500);
      pending.set(id, {
        resolve: (value) => { clearTimeout(timer); resolve(value); },
        reject: (error) => { clearTimeout(timer); reject(error); }
      });
      bridge.postMessage(JSON.stringify({ id, action, data }));
    });
  }

  async function browserDeviceState() {
    let battery = null;
    try {
      if (navigator.getBattery) {
        const info = await navigator.getBattery();
        battery = Math.round(info.level * 100);
      }
    } catch (_) {}
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return {
      source: 'browser',
      battery: Number.isFinite(battery) ? battery : 84,
      network: connection?.type || connection?.effectiveType || 'wifi',
      model: 'Navegador',
      androidVersion: null
    };
  }

  const api = {
    isNative() {
      setup();
      return !!nativeObject();
    },
    async getDeviceState() {
      if (this.isNative()) {
        try { return await sendNative('deviceState'); } catch (_) {}
      }
      return browserDeviceState();
    },
    async haptic(type = 'tap') {
      if (this.isNative()) {
        try { await sendNative('haptic', { type }); return true; } catch (_) {}
      }
      if (navigator.vibrate) {
        const patterns = { tap: 18, success: [20, 45, 30], error: [55, 35, 55] };
        navigator.vibrate(patterns[type] || 18);
        return true;
      }
      return false;
    },
    async toast(message) {
      if (this.isNative()) {
        try { await sendNative('toast', { message: String(message || '') }); return true; } catch (_) {}
      }
      return false;
    },
    async openSettings() {
      if (!this.isNative()) return false;
      try { await sendNative('openSettings'); return true; } catch (_) { return false; }
    },
    async isWhatsAppInstalled() {
      if (!this.isNative()) return false;
      try {
        const result = await sendNative('isWhatsAppInstalled');
        return !!result?.installed;
      } catch (_) { return false; }
    },
    async openWhatsApp() {
      if (!this.isNative()) return false;
      try {
        const result = await sendNative('openWhatsApp');
        return !!result?.opened;
      } catch (_) { return false; }
    },
    async shareToWhatsApp(message) {
      if (!this.isNative()) return false;
      try {
        const result = await sendNative('shareToWhatsApp', { message: String(message || '') });
        return !!result?.opened;
      } catch (_) { return false; }
    },
    async openWhatsAppChat(phone, message = '') {
      if (!this.isNative()) return false;
      try {
        const result = await sendNative('openWhatsAppChat', { phone: String(phone || ''), message: String(message || '') });
        return !!result?.opened;
      } catch (_) { return false; }
    },
    async isGovBrInstalled() {
      if (!this.isNative()) return false;
      try {
        const result = await sendNative('isGovBrInstalled');
        return !!result?.installed;
      } catch (_) { return false; }
    },
    async openGovBr() {
      if (!this.isNative()) return false;
      try {
        const result = await sendNative('openGovBr');
        return !!result?.opened;
      } catch (_) { return false; }
    },
    async openPlayStore(packageName = '') {
      if (!this.isNative()) return false;
      try { const result = await sendNative('openPlayStore', { packageName: String(packageName || '') }); return !!result?.opened; } catch (_) { return false; }
    },
    async openBancoBrasil() {
      if (!this.isNative()) return false;
      try { const result = await sendNative('openBancoBrasil'); return !!result?.opened; } catch (_) { return false; }
    },
    async openCaixa() {
      if (!this.isNative()) return false;
      try { const result = await sendNative('openCaixa'); return !!result?.opened; } catch (_) { return false; }
    }
  };

  window.EducaAndroidApi = api;
  document.addEventListener('DOMContentLoaded', setup, { once: true });
})();
