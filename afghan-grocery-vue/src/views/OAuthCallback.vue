<template>
  <div>
    Processing authentication...
  </div>
</template>

<script>
export default {
  name: 'OAuthCallback',
  async mounted() {
    try {
      // Supabase returns tokens in the URL fragment (#access_token=...)
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const access_token = params.get('access_token');
      const provider_token = params.get('provider_token');
      const refresh_token = params.get('refresh_token');

      // If there is no token, check for error in query string and handle it
      if (!access_token) {
        const q = new URLSearchParams(window.location.search);
        const error = q.get('error_description') || q.get('error');
        if (error) {
          console.error('OAuth error:', error);
          this.$router.replace({ name: 'Login', query: { oauth_error: error } });
          return;
        }

        console.error('OAuth callback received without token or error');
        this.$router.replace({ name: 'Login', query: { oauth_error: 'missing_token' } });
        return;
      }

      // Have access token -> perform exchange with backend
      const apiBaseRaw = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '';
      let apiBase = '';
      if (apiBaseRaw) {
        const trimmed = apiBaseRaw.replace(/\/$/, '');
        if (trimmed.includes('/api/')) apiBase = trimmed;
        else apiBase = `${trimmed}/api/v1`;
      } else {
        apiBase = '/api/v1';
      }

      console.log('OAuthCallback: exchanging token with backend');

      const resp = await fetch(`${apiBase}/auth/oauth/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token, provider_token })
      });

      if (!resp.ok) {
        console.error('Exchange failed', await resp.text());
        this.$router.replace({ name: 'Login', query: { oauth_error: 'exchange_failed' } });
        return;
      }

      const body = await resp.json();
      if (!body || !body.success) {
        console.error('Exchange response invalid', body);
        this.$router.replace({ name: 'Login', query: { oauth_error: 'exchange_failed' } });
        return;
      }

      // Success: server set cookies; redirect home or provided redirect
      const redirect = this.$route.query.redirect || '/';
      window.location.href = redirect;
    } catch (err) {
      console.error('OAuthCallback exception', err);
      this.$router.replace({ name: 'Login', query: { oauth_error: 'unexpected' } });
    }
  }
}
</script>

<style scoped>
/* minimal */
</style>
