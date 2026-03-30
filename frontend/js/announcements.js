// announcements.js — CivicEvents+

$(function () {
  setupAjax();

  // ── ANNOUNCEMENTS LIST ────────────────────────────────────────
  if ($('#announcements-list').length) {
    authGuard();

    let skels = '';
    for (let i = 0; i < 6; i++) skels += skeletonCard();
    $('#announcements-list').html(skels);

    function fetchAndRender() {
      $.get(BASE_URL + '/api/announcements')
        .done(res => {
          const $list = $('#announcements-list');
          $list.empty();

          const all   = extractList(res, ['announcements', 'data', 'results']);
          const items = isAdmin() ? all : onlyPublished(all);

          if (!items.length) {
            $list.html(`
              <div class="col-span-3 flex flex-col items-center justify-center py-24 text-slate-400">
                <span class="text-6xl mb-4">📢</span>
                <p class="text-xl font-bold text-slate-600 mb-2">No announcements yet</p>
                <p class="text-sm">Official audio updates will appear here.</p>
              </div>`);
            return;
          }

          items.forEach(a => {
            const dur  = a.duration_seconds ? fmtTime(a.duration_seconds) : '';
            const date = new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const pubBadge = !!a.published
              ? '<span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">● Published</span>'
              : '<span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">● Draft</span>';

            const adminBtns = isAdmin() ? `
              <button type="button" class="edit-ann text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition font-medium" data-id="${a.id}">Edit</button>
              <button class="toggle-pub text-xs border px-3 py-1.5 rounded-lg transition font-medium
                ${!!a.published ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100' : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'}"
                data-id="${a.id}" data-pub="${!!a.published ? '1' : '0'}">
                ${!!a.published ? 'Unpublish' : 'Publish'}
              </button>
              <button class="delete-ann text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition font-medium" data-id="${a.id}">Delete</button>` : '';

            $list.append(`
              <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div class="flex items-start gap-4">
                  <div class="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0">📢</div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2 flex-wrap">
                      <h3 class="font-bold text-slate-800 text-base leading-snug">${a.title}</h3>
                      ${isAdmin() ? pubBadge : ''}
                    </div>
                    <div class="flex items-center gap-3 mt-1.5 flex-wrap">
                      ${dur ? `<span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⏱ ${dur}</span>` : ''}
                      <span class="text-xs text-slate-400">📅 ${date}</span>
                    </div>
                  </div>
                </div>
                <div class="flex gap-2 flex-wrap mt-4 pt-3 border-t border-slate-50">
                  <button type="button" class="play-ann text-xs bg-indigo-600 text-white px-4 py-1.5 rounded-lg hover:bg-indigo-700 transition font-medium" data-id="${a.id}">
                    ▶ Play
                  </button>
                  ${adminBtns}
                </div>
              </div>`);
          });

          $(document).off('click', '.play-ann').on('click', '.play-ann', function () {
            sessionStorage.setItem('ce_ann_id', $(this).data('id'));
            window.location.href = './announcement-detail.html';
          });

          $(document).off('click', '.edit-ann').on('click', '.edit-ann', function () {
            sessionStorage.setItem('ce_edit_ann_id', $(this).data('id'));
            window.location.href = './announcement-form.html';
          });

          $(document).off('click', '.delete-ann').on('click', '.delete-ann', function () {
            const id = $(this).data('id');
            if (!confirm('Delete this announcement?')) return;
            $.ajax({ url: BASE_URL + '/api/announcements/' + id, method: 'DELETE' })
              .done(() => { showToast('Deleted.', 'success'); fetchAndRender(); })
              .fail(() => showToast('Delete failed.', 'error'));
          });

          $(document).off('click', '.toggle-pub').on('click', '.toggle-pub', function () {
            const id  = $(this).data('id');
            const pub = $(this).data('pub') === '1';
            $.ajax({ url: BASE_URL + '/api/announcements/' + id + '/' + (pub ? 'unpublish' : 'publish'), method: 'PATCH' })
              .done(() => { showToast(pub ? 'Unpublished.' : 'Published!', pub ? 'info' : 'success'); fetchAndRender(); })
              .fail(() => showToast('Update failed.', 'error'));
          });
        })
        .fail(() => {
          showToast('Could not load announcements.', 'error');
          $('#announcements-list').html(`
            <div class="col-span-3 text-center py-16 text-slate-400">
              <p class="text-4xl mb-3">⚠️</p><p>Failed to load announcements.</p>
            </div>`);
        });
    }

    fetchAndRender();
  }

  // ── ANNOUNCEMENT DETAIL ───────────────────────────────────────
  if ($('#ann-detail').length) {
    if (!isLoggedIn()) { logout(); return; }
    const id = new URLSearchParams(location.search).get('id')
             || sessionStorage.getItem('ce_ann_id');
    sessionStorage.removeItem('ce_ann_id');
    if (!id) { window.location.href = 'announcements.html'; return; }

    $.get(BASE_URL + '/api/announcements/' + id)
      .done(res => {
        const a = res.data || res;
        $('#ann-title').text(a.title);
        $('#ann-date').text(new Date(a.created_at).toLocaleDateString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        }));

        const audioSrc = announcementAudioUrl(a.audio_url);
        const audio    = document.getElementById('audio-player');

        if (audioSrc && audio) {
          audio.src = audioSrc;
          audio.preload = 'auto';
          audio.load();

          // Play / Pause button
          $('#play-pause-btn').off('click').on('click', function (e) {
            e.preventDefault();
            if (audio.paused) {
              audio.play()
                .then(() => {
                  $('#play-icon').addClass('hidden');
                  $('#pause-icon').removeClass('hidden');
                  $(this).attr('aria-label', 'Pause');
                })
                .catch(err => {
                  console.error('Play failed:', err);
                  showToast('Unable to play audio.', 'error');
                  $('#audio-fallback').removeClass('hidden');
                });
            } else {
              audio.pause();
              $('#play-icon').removeClass('hidden');
              $('#pause-icon').addClass('hidden');
              $(this).attr('aria-label', 'Play');
            }
          });

          audio.addEventListener('timeupdate', () => {
            if (!audio.duration) return;
            $('#audio-progress').val((audio.currentTime / audio.duration) * 100);
            $('#audio-current').text(fmtTime(audio.currentTime));
            $('#audio-duration').text(fmtTime(audio.duration));
          });

          audio.addEventListener('loadedmetadata', () => {
            $('#audio-duration').text(fmtTime(audio.duration));
            $('#audio-fallback').addClass('hidden');
          });

          audio.addEventListener('ended', () => {
            $('#play-icon').removeClass('hidden');
            $('#pause-icon').addClass('hidden');
            $('#audio-progress').val(0);
          });

          audio.addEventListener('error', () => {
            $('#audio-fallback').removeClass('hidden');
            showToast('Audio file cannot be played.', 'error');
          });

          $('#audio-progress').on('input', function () {
            if (audio.duration) audio.currentTime = (this.value / 100) * audio.duration;
          });

          $('#audio-volume').on('input', function () {
            audio.volume = this.value;
          });

          $(document).on('keydown', function (e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.code === 'Space')      { e.preventDefault(); $('#play-pause-btn').trigger('click'); }
            if (e.code === 'ArrowLeft')  audio.currentTime = Math.max(0, audio.currentTime - 5);
            if (e.code === 'ArrowRight') audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
          });

        } else {
          $('#audio-fallback').removeClass('hidden');
        }

        if (a.transcript) {
          $('#transcript').text(a.transcript);
          $('#transcript-section').removeClass('hidden');
        }
      })
      .fail(() => showToast('Could not load announcement.', 'error'));
  }

  // ── ANNOUNCEMENT FORM (admin) ─────────────────────────────────
  if ($('#ann-form').length) {
    adminGuard();
    const id = new URLSearchParams(location.search).get('id')
             || sessionStorage.getItem('ce_edit_ann_id');
    if (id) sessionStorage.setItem('ce_edit_ann_id', id);

    if (id) {
      $('#form-title').text('Edit Announcement');
      $.get(BASE_URL + '/api/announcements/' + id).done(res => {
        const a = res.data || res;
        $('#title').val(a.title);
        $('#published').prop('checked', !!a.published);
      });
    }

    $('#audio').on('change', function () {
      const file = this.files[0];
      if (!file) return;
      if (!file.type.startsWith('audio/')) { showToast('Only audio files allowed.', 'error'); this.value = ''; return; }
      if (file.size > 100 * 1024 * 1024)  { showToast('Audio must be under 100MB.', 'error'); this.value = ''; return; }
      $('#audio-file-name').text(file.name + ' (' + (file.size / 1024 / 1024).toFixed(1) + ' MB)');
    });

    $('#ann-form').on('submit', function (e) {
      e.preventDefault();
      const title = $('#title').val().trim();
      if (!title) { showToast('Title is required.', 'error'); return; }
      if (!id && !$('#audio')[0].files[0]) { showToast('Audio file is required.', 'error'); return; }

      const fd = new FormData(this);
      fd.set('published', $('#published').is(':checked') ? 'true' : 'false');
      const $btn = $('#submit-btn').prop('disabled', true).text('Uploading...');

      $.ajax({
        url:         id ? BASE_URL + '/api/announcements/' + id : BASE_URL + '/api/announcements',
        method:      id ? 'PUT' : 'POST',
        data:        fd,
        processData: false,
        contentType: false,
        xhr() {
          const x = new XMLHttpRequest();
          x.upload.onprogress = ev => {
            if (ev.lengthComputable)
              $('#upload-progress').val(Math.round(ev.loaded / ev.total * 100)).removeClass('hidden');
          };
          return x;
        },
        success() {
          showToast(id ? 'Announcement updated!' : 'Announcement saved!', 'success');
          setTimeout(() => window.location.href = './announcements.html', 1200);
        },
        error(xhr) {
          showToast(xhr.responseJSON?.message || 'Upload failed.', 'error');
          $btn.prop('disabled', false).text('Save Announcement');
        }
      });
    });
  }
});