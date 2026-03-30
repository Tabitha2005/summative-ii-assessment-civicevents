$(function () {
  setupAjax();

  // ── Sign-up page ──────────────────────────────────────────────
  if ($('#signup-form').length) {
    if (isLoggedIn()) {
      window.location.href = isAdmin() ? 'dashboard.html' : 'events.html';
      return;
    }

    $('#password').on('input', function () {
      const val = $(this).val();
      let score = 0;
      if (val.length >= 8)          score++;
      if (/[A-Z]/.test(val))        score++;
      if (/[0-9]/.test(val))        score++;
      if (/[^A-Za-z0-9]/.test(val)) score++;
      const pct    = score * 25;
      const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
      const colors = ['', 'bg-red-500', 'bg-amber-400', 'bg-yellow-400', 'bg-green-500'];
      $('#pwd-bar').css('width', pct + '%')
        .removeClass('bg-red-500 bg-amber-400 bg-yellow-400 bg-green-500')
        .addClass(colors[score]);
      $('#pwd-label').text(labels[score]);
    });

    $('#signup-form').on('submit', function (e) {
      e.preventDefault();
      const password = $('#password').val();
      const confirm  = $('#confirm_password').val();
      if (password !== confirm) { showToast('Passwords do not match.', 'error'); return; }
      const $btn = $('#signup-btn').prop('disabled', true).text('Creating account...');
      $.ajax({
        url:         BASE_URL + '/api/auth/register',
        method:      'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          full_name: $('#full_name').val().trim(),
          email:     $('#email').val().trim().toLowerCase(),
          password
        })
      })
      .done(() => {
        showToast('Account created! Redirecting...', 'success');
        setTimeout(() => window.location.href = 'login.html', 1500);
      })
      .fail(xhr => {
        showToast(xhr.responseJSON?.message || 'Registration failed.', 'error');
        $btn.prop('disabled', false).text('Create Account');
      });
    });
  }

  // ── Login page ────────────────────────────────────────────────
  if ($('#login-form').length) {
    if (isLoggedIn()) {
      window.location.href = isAdmin() ? 'dashboard.html' : 'events.html';
      return;
    }

    const msg = new URLSearchParams(window.location.search).get('msg');
    if (msg) showToast(msg, 'warning');

    $('#login-form').on('submit', function (e) {
      e.preventDefault();
      const $btn = $('#login-btn').prop('disabled', true).text('Signing in...');
      $.ajax({
        url:         BASE_URL + '/api/auth/login',
        method:      'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          email:    $('#email').val().trim().toLowerCase(),
          password: $('#password').val()
        })
      })
      .done(res => {
        const token = res.token || res.data?.token;
        const user  = res.data?.user || res.user || res.data;
        localStorage.setItem('ce_token', token);
        localStorage.setItem('ce_user',  JSON.stringify(user));
        window.location.href = (user && user.role === 'admin') ? 'dashboard.html' : 'events.html';
      })
      .fail(xhr => {
        showToast(xhr.responseJSON?.message || 'Invalid email or password.', 'error');
        $btn.prop('disabled', false).text('Sign In');
      });
    });
  }
});