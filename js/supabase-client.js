(function () {
  const config = window.APP_CONFIG || {};
  const supabaseUrl = String(config.supabaseUrl || '').trim();
  const supabaseAnonKey = String(config.supabaseAnonKey || '').trim();

  const hasRealConfig = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('YOUR_PROJECT_ID') &&
    !supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')
  );

  window.supabaseClient = null;
  window.supabaseStatus = {
    configured: hasRealConfig,
    ready: false,
    message: hasRealConfig
      ? 'Supabase credentials found.'
      : 'Supabase credentials are missing in js/config.js.'
  };

  if (!hasRealConfig) {
    console.warn(window.supabaseStatus.message);
  } else if (!window.supabase) {
    window.supabaseStatus.message = 'Supabase library did not load. Check your internet connection or CDN script.';
    console.error(window.supabaseStatus.message);
  } else {
    window.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    window.supabaseStatus.ready = true;
    window.supabaseStatus.message = 'Supabase is ready.';
  }

  window.isSupabaseConfigured = function () {
    return Boolean(window.supabaseStatus && window.supabaseStatus.configured);
  };

  window.isSupabaseReady = function () {
    return Boolean(window.supabaseClient);
  };

  window.getSupabaseStatusMessage = function () {
    return window.supabaseStatus?.message || 'Supabase status is unavailable.';
  };
})();