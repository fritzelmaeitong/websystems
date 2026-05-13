(function () {
  const config = window.APP_CONFIG || {};
  const hasConfig = Boolean(
    config.useSupabase &&
    config.supabaseUrl &&
    config.supabaseAnonKey &&
    !config.supabaseUrl.includes('YOUR_PROJECT_ID') &&
    !config.supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')
  );

  window.supabaseClient = null;

  if (hasConfig && window.supabase) {
    window.supabaseClient = window.supabase.createClient(
      config.supabaseUrl,
      config.supabaseAnonKey
    );
  }

  window.isSupabaseReady = function () {
    return Boolean(window.supabaseClient);
  };
})();
