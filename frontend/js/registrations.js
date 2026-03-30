// registrations.js — CivicEvents+

$(function () {
  setupAjax();

  if ($('#my-registrations').length) {
    authGuard();
    load();

    function load() {
      const skels = [1,2,3].map(() => `
        <div class="bg-white rounded-2xl p-4 flex gap-4 animate-pulse">
          <div class="bg-slate-200 w-24 h-24 rounded-xl flex-shrink-0"></div>
          <div class="flex-1 space-y-2 py-1">
            <div class="bg-slate-200 h-4 w-3/4 rounded"></div>
            <div class="bg-slate-200 h-3 w-1/2 rounded"></div>
          </div>
        </div>`).join('');
      $('#my-registrations').html(`<div class="space-y-4">${skels}</div>`);

      $.get(BASE_URL + '/api/event-registrations/my-registrations')
        .done(res => {
          const regs = extractList(res, ['registrations', 'data', 'results']);
          const $c   = $('#my-registrations').empty();

          if (!regs.length) {
            $c.html(`
              <div class="text-center py-16 text-gray-400 bg-white rounded-2xl border border-gray-100 px-4">
                <p class="text-5xl mb-3">📋</p>
                <p class="font-semibold text-gray-600 mb-1">No registrations yet</p>
                <p class="text-sm mb-4">Browse events and register to see them here.</p>
                <a href="events.html" class="btn-primary inline-flex">Browse Events</a>
              </div>`);
            return;
          }

          regs.forEach(r => {
            const date = r.starts_at
              ? new Date(r.starts_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
              : 'TBD';
            const isCancelled = r.status === 'cancelled';
            const statusBadge = isCancelled
              ? '<span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600">Cancelled</span>'
              : '<span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">Registered</span>';
            const img = r.image_url
              ? (r.image_url.startsWith('http') ? r.image_url : BASE_URL + r.image_url)
              : null;
            const imgHtml = img
              ? `<img src="${img}" alt="${r.title || 'Event'}" class="w-24 h-24 object-cover rounded-xl flex-shrink-0" onerror="this.onerror=null;this.style.display='none'">`
              : `<div class="w-24 h-24 rounded-xl flex-shrink-0 bg-gradient-to-br from-indigo-800 to-purple-900 flex items-center justify-center text-3xl">🗓</div>`;

            $c.append(`
              <div class="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition flex gap-4 p-4">
                ${imgHtml}
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2 flex-wrap mb-1">
                    <h3 class="font-bold text-gray-800 text-sm">${r.title || 'Event'}</h3>
                    ${statusBadge}
                  </div>
                  <p class="text-xs text-gray-500 mt-1">📅 ${date}</p>
                  <p class="text-xs text-gray-500">📍 ${r.location || ''}</p>
                  <div class="flex gap-2 mt-3 flex-wrap">
                    <button class="view-event-btn text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition"
                      data-id="${r.event_id}">View Event</button>
                    ${!isCancelled
                      ? `<button class="cancel-reg text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition"
                           data-event-id="${r.event_id}">Cancel</button>`
                      : ''}
                  </div>
                </div>
              </div>`);
          });
        })
        .fail(() => showToast('Could not load registrations.', 'error'));
    }

    $(document).on('click', '.view-event-btn', function () {
      sessionStorage.setItem('ce_event_id', $(this).data('id'));
      window.location.href = './event-detail.html';
    });

    $(document).on('click', '.cancel-reg', function () {
      const event_id = $(this).data('event-id');
      if (!confirm('Cancel this registration?')) return;
      const $btn = $(this).prop('disabled', true).text('Cancelling...');
      $.ajax({
        url: BASE_URL + '/api/event-registrations/cancel',
        method: 'POST', contentType: 'application/json',
        data: JSON.stringify({ event_id })
      })
      .done(() => { showToast('Registration cancelled.', 'info'); load(); })
      .fail(() => { $btn.prop('disabled', false).text('Cancel'); showToast('Could not cancel.', 'error'); });
    });
  }
});
