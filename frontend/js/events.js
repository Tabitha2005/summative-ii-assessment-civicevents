// events.js — CivicEvents+

$(function () {
  setupAjax();

  const params  = new URLSearchParams(window.location.search);
  const eventId = params.get('id');

  // ── EVENT DETAIL PAGE (event-detail.html?id=X) ───────────────
  if ($('#event-detail').length && eventId) {
    authGuard();
    $('#nav-placeholder').load('partials/nav.html');
    $('#footer-placeholder').load('partials/footer.html');

    // Load event data
    $.get(BASE_URL + '/api/events/' + eventId)
      .done(res => {
        const ev = res.data || res;

        // Populate fields
        $('#event-title').text(ev.title || '');
        $('#event-location').text(ev.location || 'TBC');
        $('#event-desc').text(ev.description || '');
        $('#event-start').text(ev.starts_at ? new Date(ev.starts_at).toLocaleString('en-GB') : 'TBC');
        $('#event-end').text(ev.ends_at   ? new Date(ev.ends_at).toLocaleString('en-GB')   : 'TBC');

        // Image
        const imgUrl = ev.image_url
          ? (ev.image_url.startsWith('http') ? ev.image_url : BASE_URL + ev.image_url)
          : (ev.metadata?.image_url ? eventImageUrl(ev.metadata.image_url) : null);
        if (imgUrl) {
          $('#event-img').attr('src', imgUrl).attr('alt', ev.title);
        }

        // Map link
        if (ev.location) {
          $('#map-link')
            .attr('href', 'https://maps.google.com/?q=' + encodeURIComponent(ev.location))
            .removeClass('hidden');
        }

        // Admin controls
        if (isAdmin()) {
          $('#admin-edit-btn').attr('href', './event-form.html?id=' + ev.id).removeClass('hidden');
          $('#admin-delete-btn').removeClass('hidden');
          $('#attendees-section').removeClass('hidden');
          loadAttendees(ev.id);
        }
      })
      .fail(() => showToast('Could not load event.', 'error'));

    // ── Register / Cancel button (id="reg-btn") ─────────────────
    // First check if already registered
    if (!isAdmin()) {
      $.get(BASE_URL + '/api/event-registrations/my-registrations')
        .done(res => {
          const regs = extractList(res, ['registrations', 'data', 'results']);
          const existing = regs.find(r => r.event_id === eventId && r.status !== 'cancelled');
          if (existing) {
            $('#reg-btn')
              .text('Cancel Registration')
              .data('registered', 'true')
              .removeClass('bg-indigo-600 hover:bg-indigo-700')
              .addClass('bg-red-500 hover:bg-red-600');
          }
        });
    }

    // Register button click
    $('#reg-btn').on('click', function (e) {
      e.preventDefault();
      if (!isLoggedIn()) { window.location.href = 'login.html'; return; }

      const $btn        = $(this).prop('disabled', true);
      const isRegistered = $btn.data('registered') === 'true' || $btn.data('registered') === true;

      if (isRegistered) {
        // Cancel registration
        $.ajax({
          url:         BASE_URL + '/api/event-registrations/cancel',
          method:      'POST',
          contentType: 'application/json',
          data:        JSON.stringify({ event_id: eventId })
        })
        .done(() => {
          showToast('Registration cancelled.', 'info');
          $btn.text('Register for Event')
            .data('registered', 'false')
            .removeClass('bg-red-500 hover:bg-red-600')
            .addClass('bg-indigo-600 hover:bg-indigo-700')
            .prop('disabled', false);
        })
        .fail(() => { showToast('Could not cancel.', 'error'); $btn.prop('disabled', false); });

      } else {
        // Register
        $.ajax({
          url:         BASE_URL + '/api/event-registrations',
          method:      'POST',
          contentType: 'application/json',
          data:        JSON.stringify({ event_id: eventId })
        })
        .done(() => {
          showToast('Registered successfully!', 'success');
          $btn.text('Cancel Registration')
            .data('registered', 'true')
            .removeClass('bg-indigo-600 hover:bg-indigo-700')
            .addClass('bg-red-500 hover:bg-red-600')
            .prop('disabled', false);
          // Reload attendees if admin
          if (isAdmin()) loadAttendees(eventId);
        })
        .fail(xhr => {
          showToast(xhr.responseJSON?.message || 'Registration failed.', 'error');
          $btn.prop('disabled', false);
        });
      }
    });

    // Admin delete
    $('#admin-delete-btn').on('click', function () {
      if (!confirm('Delete this event?')) return;
      $.ajax({ url: BASE_URL + '/api/events/' + eventId, method: 'DELETE' })
        .done(() => { showToast('Event deleted.', 'success'); setTimeout(() => window.location.href = './events.html', 900); })
        .fail(() => showToast('Delete failed.', 'error'));
    });

    // Feedback
    loadFeedback(eventId);

    let selectedRating = 0;
    $('#star-rating span').on('click', function () {
      selectedRating = parseInt($(this).data('val'));
      $('#star-rating span').each(function () {
        $(this).toggleClass('text-yellow-400', parseInt($(this).data('val')) <= selectedRating)
               .toggleClass('text-gray-300',   parseInt($(this).data('val')) >  selectedRating);
      });
    });

    $('#feedback-form').on('submit', function (e) {
      e.preventDefault();
      if (!selectedRating) { showToast('Please select a rating.', 'warning'); return; }
      const $btn = $(this).find('button[type=submit]').prop('disabled', true).text('Submitting...');
      $.ajax({
        url:         BASE_URL + '/api/event-feedback',
        method:      'POST',
        contentType: 'application/json',
        data: JSON.stringify({ event_id: eventId, rating: selectedRating, comment: $('#feedback-comment').val().trim() })
      })
      .done(() => {
        showToast('Feedback submitted!', 'success');
        $('#feedback-form')[0].reset();
        selectedRating = 0;
        $('#star-rating span').addClass('text-gray-300').removeClass('text-yellow-400');
        loadFeedback(eventId);
        $btn.prop('disabled', false).text('Submit Feedback');
      })
      .fail(xhr => {
        showToast(xhr.responseJSON?.message || 'Could not submit feedback.', 'error');
        $btn.prop('disabled', false).text('Submit Feedback');
      });
    });
  }

  // ── EVENTS LIST PAGE (events.html) ───────────────────────────
  if ($('#events-list').length && !eventId) {
    authGuard();
    $('#nav-placeholder').load('partials/nav.html');
    $('#footer-placeholder').load('partials/footer.html');

    if (isAdmin()) $('#admin-create-btn').removeClass('hidden');
    loadEvents();

    let searchTimer;
    $('#search-input').on('input', function () {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => loadEvents($(this).val().trim()), 350);
    });

    function loadEvents(query) {
      const url = BASE_URL + '/api/events' + (query ? '?search=' + encodeURIComponent(query) : '');
      $('#events-list').html('<div class="col-span-3 text-center py-12 text-gray-400">Loading events…</div>');
      $.get(url)
        .done(res => {
          const all    = extractList(res, ['events', 'data', 'results']);
          const events = isAdmin() ? all : onlyPublished(all);
          if (!events.length) {
            $('#events-list').html('<div class="col-span-3 text-center py-16 text-gray-400"><p class="text-4xl mb-3">📅</p><p>No events found.</p></div>');
            return;
          }
          $('#events-list').html(events.map(eventCard).join(''));
        })
        .fail(() => showToast('Could not load events.', 'error'));
    }

    $(document).on('click', '.go-detail', function () {
      sessionStorage.setItem('ce_event_id', $(this).data('id'));
      window.location.href = './event-detail.html';
    });

    $(document).on('click', '.edit-event', function () {
      sessionStorage.setItem('ce_edit_event_id', $(this).data('id'));
      window.location.href = './event-form.html';
    });

    $(document).on('click', '.delete-event', function () {
      const id = $(this).data('id');
      if (!confirm('Delete this event?')) return;
      $.ajax({ url: BASE_URL + '/api/events/' + id, method: 'DELETE' })
        .done(() => { showToast('Event deleted.', 'success'); loadEvents(); })
        .fail(() => showToast('Delete failed.', 'error'));
    });
  }

  // ── EVENT FORM PAGE (event-form.html) ────────────────────────
  if ($('#event-form').length) {
    adminGuard();
    $('#nav-placeholder').load('partials/nav.html');
    $('#footer-placeholder').load('partials/footer.html');

    const editId = new URLSearchParams(location.search).get('id')
                || sessionStorage.getItem('ce_edit_event_id');
    if (editId) sessionStorage.setItem('ce_edit_event_id', editId);
    if (editId) {
      $('#form-title').text('Edit Event');
      $.get(BASE_URL + '/api/events/' + editId).done(res => {
        const ev = res.data || res;
        $('#title').val(ev.title);
        $('#location').val(ev.location);
        $('#description').val(ev.description);
        if (ev.starts_at) $('#starts_at').val(ev.starts_at.slice(0, 16));
        if (ev.ends_at)   $('#ends_at').val(ev.ends_at.slice(0, 16));
        if (ev.published !== undefined) $('#published').prop('checked', ev.published);
        const imgUrl = ev.metadata?.image_url ? eventImageUrl(ev.metadata.image_url) : null;
        if (imgUrl) $('#img-preview').attr('src', imgUrl).removeClass('hidden');
      });
    }

    $('#image').on('change', function () {
      const file = this.files[0];
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) { showToast('Image must be under 10 MB.', 'error'); this.value = ''; return; }
      const reader = new FileReader();
      reader.onload = e => { $('#img-preview').attr('src', e.target.result).removeClass('hidden'); };
      reader.readAsDataURL(file);
    });

    $('#event-form').on('submit', function (e) {
      e.preventDefault();
      const $btn = $('#submit-btn').prop('disabled', true).text('Saving…');
      const fd = new FormData(this);
      // Ensure published is sent as a proper boolean string
      fd.set('published', $('#published').is(':checked') ? 'true' : 'false');

      const xhr = new XMLHttpRequest();
      xhr.open(editId ? 'PUT' : 'POST', BASE_URL + '/api/events' + (editId ? '/' + editId : ''));
      xhr.setRequestHeader('Authorization', 'Bearer ' + getToken());

      xhr.upload.onprogress = function (ev) {
        if (ev.lengthComputable) {
          const pct = Math.round((ev.loaded / ev.total) * 100);
          $('#upload-progress').removeClass('hidden').val(pct);
        }
      };

      xhr.onload = function () {
        $('#upload-progress').addClass('hidden').val(0);
        if (xhr.status === 200 || xhr.status === 201) {
          showToast(editId ? 'Event updated!' : 'Event created!', 'success');
          setTimeout(() => window.location.href = './events.html', 1200);
        } else {
          let msg = 'Save failed.';
          try { msg = JSON.parse(xhr.responseText)?.message || msg; } catch (_) {}
          showToast(msg, 'error');
          $btn.prop('disabled', false).text('Save Event');
        }
      };

      xhr.onerror = function () {
        $('#upload-progress').addClass('hidden').val(0);
        showToast('Network error. Please try again.', 'error');
        $btn.prop('disabled', false).text('Save Event');
      };

      xhr.send(fd);
    });
  }

  // ── HELPERS ───────────────────────────────────────────────────
  function loadAttendees(evId) {
    $.get(BASE_URL + '/api/event-registrations/event/' + evId)
      .done(res => {
        const regs = extractList(res, ['registrations', 'data', 'results']);
        const $list = $('#attendees-list');
        $list.empty();
        if (!regs.length) {
          $list.html('<li class="text-sm text-gray-400 py-2">No registrations yet.</li>');
          return;
        }
        regs.forEach(r => {
          $list.append(`
            <li class="flex items-center gap-3 py-2">
              <div class="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                ${(r.full_name || r.user?.full_name || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <p class="text-sm font-medium text-gray-800">${r.full_name || r.user?.full_name || 'User'}</p>
                <p class="text-xs text-gray-400">${r.email || r.user?.email || ''}</p>
              </div>
              <span class="ml-auto text-xs px-2 py-0.5 rounded-full ${r.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}">${r.status || 'registered'}</span>
            </li>`);
        });
      });
  }

  function loadFeedback(evId) {
    $.get(BASE_URL + '/api/event-feedback/event/' + evId)
      .done(res => {
        const list = extractList(res, ['feedback', 'data', 'results']);
        const $fl  = $('#feedback-list');
        $fl.empty();
        if (!list.length) { $fl.html('<p class="text-sm text-gray-400">No feedback yet. Be the first!</p>'); return; }
        const avg = list.reduce((s, f) => s + f.rating, 0) / list.length;
        $('#feedback-avg').text('Average rating: ' + avg.toFixed(1) + ' / 5 (' + list.length + ' review' + (list.length !== 1 ? 's' : '') + ')');
        list.forEach(f => {
          const stars = '★'.repeat(f.rating) + '☆'.repeat(5 - f.rating);
          $fl.append(`
            <div class="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-yellow-400 text-sm">${stars}</span>
                <span class="text-xs text-gray-400">${f.full_name || f.user?.full_name || 'User'}</span>
              </div>
              ${f.comment ? `<p class="text-sm text-gray-600">${f.comment}</p>` : ''}
            </div>`);
        });
      })
      .fail(() => {});
  }

  function eventCard(ev) {
    const imgUrl = ev.image_url
      ? (ev.image_url.startsWith('http') ? ev.image_url : BASE_URL + ev.image_url)
      : (ev.metadata?.image_url ? eventImageUrl(ev.metadata.image_url) : null);
    const img = imgUrl
      ? `<img src="${imgUrl}" alt="${ev.title}" class="w-full h-48 object-cover">`
      : `<div class="w-full h-48 bg-gradient-to-br from-indigo-800 to-purple-900 flex items-center justify-center text-4xl">📅</div>`;
    const date = ev.starts_at ? new Date(ev.starts_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
    const adminBtns = isAdmin() ? `
      <button type="button" class="edit-event text-xs text-amber-600 hover:underline font-medium" data-id="${ev.id}">Edit</button>
      <button class="delete-event text-xs text-red-500 hover:underline font-medium" data-id="${ev.id}">Delete</button>` : '';
    return `
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
        <span class="go-detail cursor-pointer block" data-id="${ev.id}">${img}</span>
        <div class="p-4">
          <p class="text-xs text-indigo-500 font-medium mb-1">${date}</p>
          <h2 class="font-bold text-gray-800 mb-1 line-clamp-2">
            <span class="go-detail cursor-pointer hover:text-indigo-600" data-id="${ev.id}">${ev.title}</span>
          </h2>
          <p class="text-xs text-gray-400 mb-3">📍 ${ev.location || 'TBC'}</p>
          <div class="flex items-center justify-between gap-2">
            <button type="button" class="go-detail text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition" data-id="${ev.id}">View Details</button>
            <div class="flex gap-3">${adminBtns}</div>
          </div>
        </div>
      </div>`;
  }
});