/* ============================================
   PHP to Go — Interactive Book Features
   Electronic Book with Reading Progress
   ============================================ */

(function() {
  'use strict';

  // ---- Constants ----
  var STORAGE_KEYS = {
    theme: 'php2go-theme',
    readProgress: 'php2go-read-progress',   // { file: { percent, timestamp } }
    scrollPos: 'php2go-scroll-pos',          // { file: scrollY }
    lastPage: 'php2go-last-page',            // { file, title, timestamp }
    bookProgress: 'php2go-book-progress'     // overall percentage
  };

  var READ_THRESHOLD = 80; // percentage to mark as "read"

  // ---- Chapter Navigation Data ----
  var CHAPTERS = [
    { id: 'ch1', title: '۱. فلسفه و مبانی', file: '01.00-chapter-1.html', sections: [
      { title: '۱.۱ تقابل فلسفی', file: '01.01-philosophical-contrast.html' },
      { title: '۱.۲ فلسفه‌ی ساختاری', file: '01.02-structural-philosophy.html' },
      { title: '۱.۳ Idiomatic Go', file: '01.03-idiomatic-go.html' },
      { title: '۱.۴ ابزارها', file: '01.04-tools.html' },
      { title: '۱.۵ ساختار پروژه‌ها', file: '01.05-project-structure.html' },
      { title: '۱.۶ نگاهی به اجرای برنامه‌ها', file: '01.06-program-execution-overview.html' },
    ]},
    { id: 'ch2', title: '۲. انواع داده و ساختارهای کنترلی', file: '02.00-chapter-2.html', sections: [
      { title: '۲.۱ آشنایی با انواع داده', file: '02.01-data-types-introduction.html' },
      { title: '۲.۲ Type Conversion', file: '02.02-type-conversion.html' },
      { title: '۲.۳ ساختارهای کنترلی', file: '02.03-control-structures.html' },
      { title: '۲.۴ توابع و متدها', file: '02.04-functions-and-methods.html' },
      { title: '۲.۵ اشاره‌گرها', file: '02.05-pointers.html' },
      { title: '۲.۶ جنریک‌ها', file: '02.06-generics.html' },
    ]},
    { id: 'ch3', title: '۳. پکیج‌ها، ماژول‌ها و شی‌گرایی', file: '03.00-chapter-3.html', sections: [
      { title: '۳.۱ کار با پکیج‌ها', file: '03.01-working-with-packages.html' },
      { title: '۳.۲ ماژول‌ها و مدیریت dependency ها', file: '03.02-modules-and-dependency-management.html' },
      { title: '۳.۳ اجرای برنامه و ساخت فایل خروجی', file: '03.03-running-programs-and-building-binaries.html' },
      { title: '۳.۴ درک چرخه‌ی حیات برنامه', file: '03.04-understanding-program-lifecycle.html' },
      { title: '۳.۵ شی‌گرایی', file: '03.05-object-oriented-programming.html' },
      { title: '۳.۶ Interface', file: '03.06-interface.html' },
      { title: '۳.۷ Constructor و Factory', file: '03.07-constructor-and-factory.html' },
    ]},
    { id: 'ch4', title: '۴. مدیریت خطا', file: '04.00-chapter-4.html', sections: [
      { title: '۴.۱ درک error در Go', file: '04.01-understanding-errors-in-go.html' },
      { title: '۴.۲ ساخت خطاهای سفارشی', file: '04.02-custom-errors.html' },
      { title: '۴.۳ panic', file: '04.03-panic.html' },
    ]},
    { id: 'ch5', title: '۵. همزمانی', file: '05.00-chapter-5.html', sections: [
      { title: '۵.۱ Goroutine', file: '05.01-goroutine.html' },
      { title: '۵.۲ Channel', file: '05.02-channel.html' },
      { title: '۵.۳ Select', file: '05.03-select.html' },
      { title: '۵.۴ Context', file: '05.04-context.html' },
      { title: '۵.۵ WaitGroup', file: '05.05-waitgroup.html' },
      { title: '۵.۶ Race Condition', file: '05.06-race-condition.html' },
      { title: '۵.۷ Concurrency Patterns', file: '05.07-concurrency-patterns.html' },
      { title: '۵.۸ کاربردهای عملی Concurrency', file: '05.08-practical-concurrency-usage.html' },
      { title: '۵.۹ Goroutine Leak', file: '05.09-goroutine-leak.html' },
    ]},
    { id: 'ch6', title: '۶. تعامل با دنیای بیرون', file: '06.00-chapter-6.html', sections: [
      { title: '۶.۱ تعامل با دنیای بیرون', file: '06.01-interacting-with-outside-world.html' },
      { title: '۶.۲ خواندن فایل‌ها', file: '06.02-reading-files.html' },
      { title: '۶.۳ نوشتن در فایل', file: '06.03-writing-to-files.html' },
      { title: '۶.۴ خواندن خط به خط', file: '06.04-reading-line-by-line.html' },
      { title: '۶.۵ جاسازی فایل در برنامه', file: '06.05-embedding-files-in-program.html' },
      { title: '۶.۶ ساختارهای داده‌ای JSON و YAML', file: '06.06-json-and-yaml-data-structures.html' },
      { title: '۶.۷ دریافت و مدیریت سیگنال‌های سیستم‌عامل', file: '06.07-os-signals.html' },
    ]},
    { id: 'ch7', title: '۷. ساخت وب‌سرور', file: '07.00-chapter-7.html', sections: [
      { title: '۷.۱ ساخت یک وب‌سرور پایدار و ایمن', file: '07.01-building-stable-secure-web-server.html' },
      { title: '۷.۲ مدیریت Routing', file: '07.02-routing-management.html' },
      { title: '۷.۳ خواندن داده‌های ورودی از request', file: '07.03-reading-request-input.html' },
      { title: '۷.۴ مدیریت Middleware', file: '07.04-middleware-management.html' },
      { title: '۷.۵ سرو کردن فایل‌های استاتیک', file: '07.05-serving-static-files.html' },
      { title: '۷.۶ کار با Cookie ها', file: '07.06-working-with-cookies.html' },
      { title: '۷.۷ مدیریت Session', file: '07.07-session-management.html' },
      { title: '۷.۸ استفاده از قالب‌های HTML', file: '07.08-html-templates-with-template-and-embed.html' },
      { title: '۷.۹ ساختار پیشنهادی برای قالب‌ها', file: '07.09-recommended-template-structure.html' },
      { title: '۷.۱۰ جاسازی قالب‌ها با embed', file: '07.10-embedding-templates-with-embed.html' },
      { title: '۷.۱۱ رندر کردن قالب‌ها', file: '07.11-rendering-templates.html' },
      { title: '۷.۱۲ فایل‌های استاتیک با embed', file: '07.12-serving-static-files-with-embed.html' },
      { title: '۷.۱۳ استفاده از فایل‌ها در قالب HTML', file: '07.13-using-files-in-html-templates.html' },
      { title: '۷.۱۴ پردازش فرم‌ها', file: '07.14-form-processing.html' },
    ]},
    { id: 'ch8', title: '۸. پایگاه داده', file: '08.00-chapter-8.html', sections: [
      { title: '۸.۱ Migration', file: '08.01-migration.html' },
      { title: '۸.۲ اتصال به دیتابیس با database/sql', file: '08.02-connecting-to-database-with-databasesql.html' },
      { title: '۸.۳ اجرای Query', file: '08.03-executing-queries.html' },
      { title: '۸.۴ Map کردن داده‌ها به Struct', file: '08.04-mapping-data-to-structs.html' },
      { title: '۸.۵ مدیریت تراکنش‌ها', file: '08.05-transaction-management.html' },
      { title: '۸.۶ مدیریت خطاهای دیتابیس', file: '08.06-database-error-handling.html' },
      { title: '۸.۷ کار با JSON، Array و Timestamp', file: '08.07-working-with-json-arrays-and-timestamps.html' },
      { title: '۸.۸ استفاده از Redis', file: '08.08-using-redis.html' },
    ]},
    { id: 'ch9', title: '۹. مانیتورینگ و مشاهده‌پذیری', file: '09.00-chapter-9.html', sections: [
      { title: '۹.۱ Logging', file: '09.01-logging.html' },
      { title: '۹.۲ Prometheus و Grafana', file: '09.02-prometheus-and-grafana.html' },
      { title: '۹.۳ OpenTelemetry', file: '09.03-opentelemetry.html' },
    ]},
    { id: 'ch10', title: '۱۰. دیباگ و ریشه‌یابی', file: '10.00-chapter-10.html', sections: [
      { title: '۱۰.۱ دیباگ و ریشه‌یابی خطاها', file: '10.01-debugging-and-troubleshooting.html' },
      { title: '۱۰.۲ Delve', file: '10.02-delve.html' },
      { title: '۱۰.۳ استفاده در VSCode', file: '10.03-using-vscode.html' },
    ]},
    { id: 'ch11', title: '۱۱. تست‌نویسی', file: '11.00-chapter-11.html', sections: [
      { title: '۱۱.۱ مقدمات تست‌نویسی', file: '11.01-testing-basics.html' },
      { title: '۱۱.۲ Assertion', file: '11.02-assertion.html' },
      { title: '۱۱.۳ gomock', file: '11.03-gomock.html' },
      { title: '۱۱.۴ تست APIهای RESTful با httpexpect', file: '11.04-testing-restful-apis-with-httpexpect.html' },
      { title: '۱۱.۵ تست End-to-End', file: '11.05-end-to-end-testing.html' },
    ]},
    { id: 'ch12', title: '۱۲. بهینه‌سازی عملکرد', file: '12.00-chapter-12.html', sections: [
      { title: '۱۲.۱ سرعت اجرا و بهینه‌سازی', file: '12.01-execution-speed-and-optimization.html' },
      { title: '۱۲.۲ اصول بهینه‌سازی', file: '12.02-optimization-principles.html' },
      { title: '۱۲.۳ نکات کاربردی برای بهینه‌سازی', file: '12.03-practical-optimization-tips.html' },
      { title: '۱۲.۴ بهینه‌سازی حافظه و GC', file: '12.04-memory-optimization-and-gc.html' },
      { title: '۱۲.۵ تکنیک‌های عملی برای کاهش حافظه', file: '12.05-practical-techniques-for-memory-reduction.html' },
    ]},
  ];

  // Build flat list of all pages for sequential navigation
  var ALL_PAGES = [];
  CHAPTERS.forEach(function(ch) {
    ALL_PAGES.push({ title: ch.title, file: ch.file, chapter: ch.title, isChapter: true });
    ch.sections.forEach(function(s) {
      ALL_PAGES.push({ title: s.title, file: s.file, chapter: ch.title, isChapter: false });
    });
  });

  // Search index
  var SEARCH_INDEX = ALL_PAGES.map(function(p) {
    return { title: p.title, file: p.file, chapter: p.chapter };
  });

  // ---- Utility Functions ----
  function getCurrentPage() {
    var path = window.location.pathname;
    var parts = path.split('/');
    return parts[parts.length - 1] || 'index.html';
  }

  function getCurrentChapter() {
    var page = getCurrentPage();
    for (var i = 0; i < CHAPTERS.length; i++) {
      if (CHAPTERS[i].file === page) return CHAPTERS[i];
      for (var j = 0; j < CHAPTERS[i].sections.length; j++) {
        if (CHAPTERS[i].sections[j].file === page) return CHAPTERS[i];
      }
    }
    return null;
  }

  function getStorage(key, fallback) {
    try {
      var val = JSON.parse(localStorage.getItem(key));
      return val !== null && val !== undefined ? val : (fallback !== undefined ? fallback : {});
    } catch(e) { return fallback !== undefined ? fallback : {}; }
  }

  // Safe number retrieval — ensures the value is always a number
  function getStorageNumber(key, fallback) {
    var val = getStorage(key, fallback);
    if (typeof val === 'number' && !isNaN(val)) return val;
    // Corrupted value — fix it
    var safe = typeof fallback === 'number' ? fallback : 0;
    setStorage(key, safe);
    return safe;
  }

  function setStorage(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {}
  }

  function getReadingTime() {
    var textEl = document.querySelector('.content-wrap.text');
    if (!textEl) return null;
    var text = textEl.textContent || '';
    // Persian: ~180 words/min; count words by splitting on whitespace
    var words = text.trim().split(/\s+/).length;
    var minutes = Math.ceil(words / 180);
    return minutes;
  }

  function getScrollPercent() {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
  }

  // ---- Reading Progress Manager ----
  function initReadingProgress() {
    var page = getCurrentPage();
    if (page === 'index.html') return;

    // Save last page info
    var pageInfo = ALL_PAGES.find(function(p) { return p.file === page; });
    if (pageInfo) {
      setStorage(STORAGE_KEYS.lastPage, {
        file: pageInfo.file,
        title: pageInfo.title,
        chapter: pageInfo.chapter,
        timestamp: Date.now()
      });
    }

    // Track scroll progress and save
    var saveTimer = null;
    function saveProgress() {
      var percent = getScrollPercent();
      var progress = getStorage(STORAGE_KEYS.readProgress);
      var prev = progress[page] || { percent: 0, timestamp: 0 };
      // Only update if progress increased
      if (percent > prev.percent) {
        progress[page] = { percent: percent, timestamp: Date.now() };
        setStorage(STORAGE_KEYS.readProgress, progress);
        updateBookProgress();
        updateSidebarReadStatus();
      }
    }

    function saveScrollPosition() {
      var positions = getStorage(STORAGE_KEYS.scrollPos);
      positions[page] = window.scrollY;
      setStorage(STORAGE_KEYS.scrollPos, positions);
    }

    // Debounced save on scroll
    window.addEventListener('scroll', function() {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(function() {
        saveProgress();
        saveScrollPosition();
      }, 300);
    }, { passive: true });

    // Save on page unload
    window.addEventListener('beforeunload', function() {
      saveProgress();
      saveScrollPosition();
    });

    // Restore scroll position
    var positions = getStorage(STORAGE_KEYS.scrollPos);
    if (positions[page] && positions[page] > 100) {
      // Use requestAnimationFrame to ensure DOM is fully laid out
      requestAnimationFrame(function() {
        requestAnimationFrame(function() {
          window.scrollTo(0, positions[page]);
        });
      });
    }

    // Initial progress save
    saveProgress();

    // Always recalculate and update book progress on page load
    // This ensures the sidebar shows correct progress even without scrolling
    updateBookProgress();
  }

  function updateBookProgress() {
    var progress = getStorage(STORAGE_KEYS.readProgress);
    var totalPages = ALL_PAGES.length;
    var totalPercent = 0;

    // Calculate average read percentage across all pages
    // This gives gradual progress instead of jumping 0→1% only after 80% of a page
    ALL_PAGES.forEach(function(p) {
      var prog = progress[p.file];
      if (prog && typeof prog.percent === 'number' && prog.percent > 0) {
        totalPercent += Math.min(prog.percent, 100);
      }
    });

    var percent = Math.round(totalPercent / totalPages);
    if (isNaN(percent) || typeof percent !== 'number') percent = 0;
    setStorage(STORAGE_KEYS.bookProgress, percent);

    // Update progress display if it exists
    var progressBar = document.querySelector('.book-progress-bar__fill');
    var progressText = document.querySelector('.book-progress-text');
    if (progressBar) progressBar.style.width = percent + '%';
    if (progressText) progressText.textContent = percent + '%';

    // Update header mini progress
    var headerProgress = document.querySelector('.header-book-progress');
    if (headerProgress) headerProgress.style.width = percent + '%';
  }

  // ---- Continue Reading Banner (for front-matter page) ----
  function initContinueReading() {
    var lastPageInfo = getStorage(STORAGE_KEYS.lastPage);
    var banner = document.querySelector('.continue-reading-banner');
    if (!banner || !lastPageInfo || !lastPageInfo.file) return;

    // Don't show if we're already on that page
    if (getCurrentPage() === lastPageInfo.file) return;

    // Check if last visit was within 30 days
    var daysSince = (Date.now() - lastPageInfo.timestamp) / (1000 * 60 * 60 * 24);
    if (daysSince > 30) return;

    var timeAgo = getTimeAgo(lastPageInfo.timestamp);
    var readProgress = getStorage(STORAGE_KEYS.readProgress);
    var pageProgress = readProgress[lastPageInfo.file] || { percent: 0 };
    var progressPercent = Math.min(pageProgress.percent, 100);

    banner.innerHTML =
      '<a href="' + lastPageInfo.file + '" class="continue-reading-link">' +
        '<div class="continue-reading-icon">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>' +
        '</div>' +
        '<div class="continue-reading-info">' +
          '<div class="continue-reading-title">ادامه خواندن</div>' +
          '<div class="continue-reading-page">' + lastPageInfo.title + '</div>' +
          '<div class="continue-reading-meta">' +
            '<span class="continue-reading-progress">' +
              '<span class="continue-reading-progress-bar"><span class="continue-reading-progress-fill" style="width:' + progressPercent + '%"></span></span>' +
              '<span>' + progressPercent + '% خوانده شده</span>' +
            '</span>' +
            '<span class="continue-reading-time">' + timeAgo + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="continue-reading-arrow">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
        '</div>' +
      '</a>';

    banner.style.display = 'block';
  }

  function getTimeAgo(timestamp) {
    var seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'لحظاتی پیش';
    var minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + ' دقیقه پیش';
    var hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + ' ساعت پیش';
    var days = Math.floor(hours / 24);
    if (days === 1) return 'دیروز';
    if (days < 7) return days + ' روز پیش';
    var weeks = Math.floor(days / 7);
    return weeks + ' هفته پیش';
  }

  // ---- Reading Time Display ----
  function initReadingTime() {
    var minutes = getReadingTime();
    if (!minutes) return;

    var contentWrap = document.querySelector('.content-wrap.text');
    if (!contentWrap) return;

    var badge = document.createElement('div');
    badge.className = 'reading-time-badge';
    badge.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>' +
      '<span>' + minutes + ' دقیقه مطالعه</span>';

    // Insert after chapter label or at the beginning
    var chapterLabel = contentWrap.querySelector('.chapter-label, .chapter');
    if (chapterLabel && chapterLabel.nextSibling) {
      chapterLabel.parentNode.insertBefore(badge, chapterLabel.nextSibling.nextSibling || chapterLabel.nextSibling);
    } else {
      contentWrap.insertBefore(badge, contentWrap.firstChild);
    }
  }

  // ---- Dark Mode ----
  function applyHljsTheme(theme) {
    var lightSheet = document.querySelector('link.hljs-light-theme');
    var darkSheet = document.querySelector('link.hljs-dark-theme');
    if (theme === 'dark') {
      if (lightSheet) lightSheet.setAttribute('media', 'not screen');
      if (darkSheet) darkSheet.setAttribute('media', 'screen');
    } else {
      if (lightSheet) lightSheet.setAttribute('media', 'screen');
      if (darkSheet) darkSheet.setAttribute('media', 'not screen');
    }
  }

  function initDarkMode() {
    var stored = localStorage.getItem(STORAGE_KEYS.theme);
    var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    applyHljsTheme(theme);

    var btn = document.querySelector('.theme-toggle');
    if (btn) {
      btn.addEventListener('click', function() {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem(STORAGE_KEYS.theme, next);
        applyHljsTheme(next);
      });
    }
  }

  // ---- Progress Bar (page scroll) ----
  function initProgressBar() {
    var bar = document.querySelector('.progress-bar__fill');
    if (!bar) return;

    function update() {
      var scrollTop = window.scrollY;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = progress + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ---- Back to Top ----
  function initBackToTop() {
    var btn = document.querySelector('.back-to-top');
    if (!btn) return;

    window.addEventListener('scroll', function() {
      btn.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });

    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ---- Sidebar Navigation ----
  function initSidebar() {
    var sidebar = document.querySelector('.sidebar');
    var toggle = document.querySelector('.sidebar-toggle');
    var overlay = document.querySelector('.sidebar-overlay');

    if (!sidebar) return;

    // Mobile toggle
    if (toggle) {
      toggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('open');
      });
    }
    if (overlay) {
      overlay.addEventListener('click', function() {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
      });
    }

    buildSidebarNav(sidebar);
  }

  function buildSidebarNav(sidebar) {
    var currentPage = getCurrentPage();
    var currentChapter = getCurrentChapter();
    var readProgress = getStorage(STORAGE_KEYS.readProgress);
    var bookPercent = getStorageNumber(STORAGE_KEYS.bookProgress, 0);

    var navHtml = '';

    // Book progress section
    navHtml += '<div class="sidebar-book-progress">';
    navHtml += '  <div class="sidebar-book-progress-header">';
    navHtml += '    <span>پیشرفت کتاب</span>';
    navHtml += '    <span class="book-progress-text">' + bookPercent + '%</span>';
    navHtml += '  </div>';
    navHtml += '  <div class="book-progress-bar"><div class="book-progress-bar__fill" style="width:' + bookPercent + '%"></div></div>';
    navHtml += '</div>';

    navHtml += '<div class="sidebar-header">فهرست فصل</div>';
    navHtml += '<nav class="sidebar-nav">';

    // Always show link to main TOC
    navHtml += '<a href="00.01-contents.html" class="' + (currentPage === '00.01-contents.html' ? 'active' : '') + '" style="font-weight:700;margin-bottom:8px;">فهرست کلی کتاب</a>';

    if (currentChapter) {
      // Show current chapter with its sections
      navHtml += '<a href="' + currentChapter.file + '" class="nav-chapter ' + (currentPage === currentChapter.file ? 'active' : '') + '" data-page="' + currentChapter.file + '">';
      navHtml += getReadDot(currentChapter.file, readProgress);
      navHtml += currentChapter.title + '</a>';
      currentChapter.sections.forEach(function(s) {
        navHtml += '<a href="' + s.file + '" class="nav-section ' + (currentPage === s.file ? 'active' : '') + '" data-page="' + s.file + '">';
        navHtml += getReadDot(s.file, readProgress);
        navHtml += s.title + '</a>';
      });

      // Show prev/next chapter collapsed
      var chIdx = CHAPTERS.indexOf(currentChapter);
      if (chIdx > 0) {
        var prevCh = CHAPTERS[chIdx - 1];
        navHtml += '<a href="' + prevCh.file + '" class="nav-chapter" data-page="' + prevCh.file + '">';
        navHtml += getReadDot(prevCh.file, readProgress);
        navHtml += prevCh.title + '</a>';
      }
      if (chIdx < CHAPTERS.length - 1) {
        var nextCh = CHAPTERS[chIdx + 1];
        navHtml += '<a href="' + nextCh.file + '" class="nav-chapter" data-page="' + nextCh.file + '">';
        navHtml += getReadDot(nextCh.file, readProgress);
        navHtml += nextCh.title + '</a>';
      }
    } else {
      // Show all chapters (for TOC/front matter pages)
      CHAPTERS.forEach(function(ch) {
        navHtml += '<a href="' + ch.file + '" class="nav-chapter" data-page="' + ch.file + '">';
        navHtml += getReadDot(ch.file, readProgress);
        navHtml += ch.title + '</a>';
        ch.sections.forEach(function(s) {
          navHtml += '<a href="' + s.file + '" class="nav-section" data-page="' + s.file + '">';
          navHtml += getReadDot(s.file, readProgress);
          navHtml += s.title + '</a>';
        });
      });
    }

    navHtml += '</nav>';

    // Page TOC (generated from headings)
    navHtml += '<div class="sidebar-page-toc" id="page-toc"></div>';

    sidebar.innerHTML = navHtml;

    // Build page-level TOC from h3/h4 headings
    buildPageToc();
  }

  function getReadDot(file, readProgress) {
    var prog = readProgress[file];
    if (prog && prog.percent >= READ_THRESHOLD) {
      return '<span class="read-dot read-dot--done" title="خوانده شده"></span>';
    } else if (prog && prog.percent > 5) {
      return '<span class="read-dot read-dot--partial" title="' + prog.percent + '% خوانده شده"></span>';
    }
    return '<span class="read-dot read-dot--unread" title="خوانده نشده"></span>';
  }

  function updateSidebarReadStatus() {
    var readProgress = getStorage(STORAGE_KEYS.readProgress);
    var currentPage = getCurrentPage();

    document.querySelectorAll('.sidebar-nav a[data-page]').forEach(function(link) {
      var file = link.getAttribute('data-page');
      if (!file) return;

      // Remove existing dots
      var existingDot = link.querySelector('.read-dot');
      if (existingDot) existingDot.remove();

      // Insert new dot at beginning
      var dotHtml = getReadDot(file, readProgress);
      var temp = document.createElement('span');
      temp.innerHTML = dotHtml;
      if (temp.firstChild) {
        link.insertBefore(temp.firstChild, link.firstChild);
      }
    });

    // Update book progress in sidebar
    var bookPercent = getStorageNumber(STORAGE_KEYS.bookProgress, 0);
    var barFill = document.querySelector('.book-progress-bar__fill');
    var textEl = document.querySelector('.book-progress-text');
    if (barFill) barFill.style.width = bookPercent + '%';
    if (textEl) textEl.textContent = bookPercent + '%';
  }

  function buildPageToc() {
    var tocContainer = document.getElementById('page-toc');
    if (!tocContainer) return;

    var headings = document.querySelectorAll('.text h3, .text h4');
    if (headings.length === 0) {
      tocContainer.style.display = 'none';
      return;
    }

    var tocHtml = '<div class="sidebar-page-toc-title">در این صفحه</div>';
    headings.forEach(function(h) {
      var level = h.tagName === 'H4' ? 'toc-h4' : '';
      var id = h.id || (h.querySelector('[id]') ? h.querySelector('[id]').id : null);
      if (id) {
        tocHtml += '<a href="#' + id + '" class="' + level + '" data-heading-id="' + id + '">' + h.textContent + '</a>';
      }
    });

    tocContainer.innerHTML = tocHtml;
    initScrollSpy(headings);
  }

  // ---- Scroll Spy ----
  function initScrollSpy(headings) {
    if (!headings || headings.length === 0) return;

    var tocLinks = document.querySelectorAll('#page-toc a[data-heading-id]');
    if (tocLinks.length === 0) return;

    function update() {
      var scrollY = window.scrollY + 100;
      var activeId = null;

      headings.forEach(function(h) {
        if (h.offsetTop <= scrollY) {
          activeId = h.id || (h.querySelector('[id]') ? h.querySelector('[id]').id : null);
        }
      });

      tocLinks.forEach(function(link) {
        link.classList.toggle('active', link.getAttribute('data-heading-id') === activeId);
      });
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // ---- Copy Code Button ----
  function initCopyButtons() {
    document.querySelectorAll('figure.code').forEach(function(figure) {
      var btn = document.createElement('button');
      btn.className = 'code-copy-btn';
      btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy';
      btn.setAttribute('aria-label', 'کپی کد');

      btn.addEventListener('click', function() {
        // Get text from either pre/code (old) or code-table (new) layout
        var code = figure.querySelector('pre code');
        var codeTable = figure.querySelector('.code-table');
        var textContent = '';

        if (code) {
          textContent = code.textContent;
        } else if (codeTable) {
          // Extract text from code-line-content spans
          var contentSpans = codeTable.querySelectorAll('.code-line-content');
          var lines = [];
          contentSpans.forEach(function(span) {
            lines.push(span.textContent);
          });
          textContent = lines.join('\n');
        }

        if (textContent) {
          navigator.clipboard.writeText(textContent).then(function() {
            btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
            btn.classList.add('copied');
            setTimeout(function() {
              btn.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> Copy';
              btn.classList.remove('copied');
            }, 2000);
          });
        }
      });

      figure.style.position = 'relative';
      figure.appendChild(btn);
    });
  }

  // ---- Line Numbers ----
  function initLineNumbers() {
    document.querySelectorAll('figure.code').forEach(function(figure) {
      var code = figure.querySelector('pre code');
      if (!code) return;

      var text = code.textContent || '';
      var lines = text.split('\n');
      // Remove last empty line if the code ends with a newline
      if (lines.length > 0 && lines[lines.length - 1].trim() === '') {
        lines.pop();
      }
      var lineCount = lines.length;

      // Only add line numbers for blocks with 2+ lines
      if (lineCount < 2) return;

      figure.classList.add('has-line-numbers');

      // Perform syntax highlighting first
      if (typeof hljs !== 'undefined' && !code.classList.contains('hljs')) {
        hljs.highlightElement(code);
      }

      // Get the highlighted HTML and split into lines
      var highlightedHtml = code.innerHTML;

      // Split highlighted HTML by newlines while preserving HTML tags
      var highlightedLines = splitHtmlByNewlines(highlightedHtml);

      // Build a table-based layout for perfect line number alignment
      var tableHtml = '<div class="code-table">';
      for (var i = 0; i < lineCount; i++) {
        var lineContent = (i < highlightedLines.length) ? highlightedLines[i] : '';
        tableHtml += '<div class="code-line-row">';
        tableHtml += '<span class="code-line-number">' + (i + 1) + '</span>';
        tableHtml += '<span class="code-line-content">' + lineContent + '</span>';
        tableHtml += '</div>';
      }
      tableHtml += '</div>';

      // Replace the pre/code with our table
      var pre = figure.querySelector('pre');
      if (pre) {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = tableHtml;
        var tableEl = wrapper.firstChild;

        // Copy the hljs classes to the code-table for styling
        if (code.classList.contains('hljs')) {
          tableEl.classList.add('hljs');
        }

        pre.parentNode.replaceChild(tableEl, pre);
      }
    });
  }

  // Split HTML content by newlines while preserving tag integrity
  function splitHtmlByNewlines(html) {
    var result = [];
    var current = '';
    var inTag = false;
    var tagDepth = 0;

    for (var i = 0; i < html.length; i++) {
      var ch = html[i];

      if (ch === '<') {
        inTag = true;
        current += ch;
        // Check if it's a closing tag
        if (i + 1 < html.length && html[i + 1] === '/') {
          tagDepth--;
        } else {
          // Check if it's a self-closing tag
          var tagEnd = html.indexOf('>', i);
          if (tagEnd !== -1 && html[tagEnd - 1] === '/') {
            // Self-closing, don't change depth
          } else {
            tagDepth++;
          }
        }
        continue;
      }

      if (ch === '>') {
        inTag = false;
        current += ch;
        continue;
      }

      if (inTag) {
        current += ch;
        continue;
      }

      // Handle newline characters
      if (ch === '\n') {
        result.push(current);
        current = '';
        continue;
      }

      current += ch;
    }

    // Push the last line if non-empty
    if (current.length > 0) {
      result.push(current);
    }

    // Balance unclosed tags across lines — close open tags at end of line, reopen at start of next
    var balanced = [];
    var openTags = [];
    for (var j = 0; j < result.length; j++) {
      var line = result[j];

      // Reopen tags from previous lines
      var prefix = '';
      for (var k = 0; k < openTags.length; k++) {
        prefix += openTags[k];
      }

      // Find all opening tags in this line
      var tagRegex = /<(span|em|strong|mark|a|b|i|u|code|sub|sup)\b[^>]*>/gi;
      var match;
      var lineOpenTags = [];
      while ((match = tagRegex.exec(line)) !== null) {
        lineOpenTags.push(match[0]);
      }

      // Find all closing tags in this line
      var closeTagRegex = /<\/(span|em|strong|mark|a|b|i|u|code|sub|sup)>/gi;
      var closeCount = 0;
      while ((match = closeTagRegex.exec(line)) !== null) {
        closeCount++;
      }

      // Adjust open tags stack
      var newOpenTags = openTags.slice();
      for (var m = 0; m < lineOpenTags.length; m++) {
        newOpenTags.push(lineOpenTags[m]);
      }
      for (var n = 0; n < closeCount; n++) {
        if (newOpenTags.length > 0) {
          newOpenTags.pop();
        }
      }

      // Close remaining open tags at end of line
      var suffix = '';
      var remainingOpen = newOpenTags.slice();
      for (var p = remainingOpen.length - 1; p >= 0; p--) {
        var tagMatch = remainingOpen[p].match(/<(\w+)/);
        if (tagMatch) {
          suffix += '</' + tagMatch[1] + '>';
        }
      }

      balanced.push(prefix + line + suffix);
      openTags = newOpenTags;
    }

    return balanced;
  }

  // ---- Fix Bash Code Blocks ----
  // Ensure bash code blocks have language-bash class for highlight.js
  function fixBashCodeBlocks() {
    document.querySelectorAll('figure.code.bash pre code').forEach(function(code) {
      if (!code.className || code.className.indexOf('language-') === -1) {
        code.classList.add('language-bash');
      }
    });
  }

  // ---- Search ----
  function initSearch() {
    var searchToggle = document.querySelector('.search-toggle');
    var searchOverlay = document.querySelector('.search-overlay');
    var searchInput = document.querySelector('.search-input');
    var searchResults = document.querySelector('.search-results');

    if (!searchToggle || !searchOverlay) return;

    function openSearch() {
      searchOverlay.classList.add('active');
      if (searchInput) searchInput.focus();
    }

    function closeSearch() {
      searchOverlay.classList.remove('active');
      if (searchInput) searchInput.value = '';
      if (searchResults) searchResults.innerHTML = '';
    }

    searchToggle.addEventListener('click', openSearch);
    searchOverlay.addEventListener('click', function(e) {
      if (e.target === searchOverlay) closeSearch();
    });

    // Keyboard shortcut: Ctrl+K / Cmd+K
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
      }
      if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
        closeSearch();
      }
    });

    // Search logic
    if (searchInput && searchResults) {
      searchInput.addEventListener('input', function() {
        var query = searchInput.value.trim();
        if (!query) {
          searchResults.innerHTML = '';
          return;
        }

        var readProgress = getStorage(STORAGE_KEYS.readProgress);
        var q = query.toLowerCase();
        var results = SEARCH_INDEX.filter(function(item) {
          return item.title.toLowerCase().includes(q) || item.chapter.toLowerCase().includes(q);
        });

        if (results.length === 0) {
          searchResults.innerHTML = '<div class="search-empty">نتیجه‌ای یافت نشد</div>';
          return;
        }

        searchResults.innerHTML = results.map(function(r) {
          var prog = readProgress[r.file] || { percent: 0 };
          var isRead = prog.percent >= READ_THRESHOLD;
          return '<a href="' + r.file + '">' +
            '<div class="result-chapter">' + r.chapter + (isRead ? ' <span class="read-dot read-dot--done" style="display:inline-block;margin-right:4px"></span>' : '') + '</div>' +
            '<div>' + r.title + '</div>' +
          '</a>';
        }).join('');
      });
    }
  }

  // ---- Keyboard Navigation (RTL-aware) ----
  function initKeyboardNav() {
    var prevLink = document.querySelector('[data-prev]');
    var nextLink = document.querySelector('[data-next]');

    document.addEventListener('keydown', function(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (document.querySelector('.search-overlay.active')) return;

      // In RTL layout, ArrowRight goes to previous page and ArrowLeft goes to next
      if (e.key === 'ArrowRight' && prevLink) {
        window.location.href = prevLink.href;
      } else if (e.key === 'ArrowLeft' && nextLink) {
        window.location.href = nextLink.href;
      }
    });
  }

  // ---- Open Graph Meta Tags ----
  function initOpenGraph() {
    var page = getCurrentPage();
    var pageInfo = ALL_PAGES.find(function(p) { return p.file === page; });
    var title = document.title || 'از PHP تا Go';
    var description = 'راهنمای جامع مهاجرت از PHP به Go برای توسعه‌دهندگان وب';

    // Get page-specific description from first paragraph
    var firstP = document.querySelector('.content-wrap.text > p');
    if (firstP && firstP.textContent.trim()) {
      description = firstP.textContent.trim().substring(0, 160);
    }

    var baseUrl = window.location.origin + window.location.pathname.replace(/[^/]*$/, '');
    var url = baseUrl + page;
    var imageUrl = baseUrl + 'assets/img/cover.png';

    var metaTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: imageUrl },
      { property: 'og:url', content: url },
      { property: 'og:type', content: 'article' },
      { property: 'og:site_name', content: 'از PHP تا Go' },
      { property: 'og:locale', content: 'fa_IR' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: imageUrl },
      { name: 'description', content: description }
    ];

    var head = document.head || document.getElementsByTagName('head')[0];
    metaTags.forEach(function(tag) {
      var meta = document.createElement('meta');
      if (tag.property) meta.setAttribute('property', tag.property);
      if (tag.name) meta.setAttribute('name', tag.name);
      meta.setAttribute('content', tag.content);
      head.appendChild(meta);
    });

    // Set canonical URL
    var canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
  }

  // ---- Highlight.js Init ----
  function initHighlighting() {
    if (typeof hljs !== 'undefined') {
      // Configure highlight.js
      hljs.configure({
        ignoreUnescapedHTML: true,
        languages: ['go', 'php', 'bash', 'sql', 'json', 'yaml', 'dockerfile', 'xml', 'ini', 'plaintext']
      });

      // Fix bash code blocks before highlighting
      fixBashCodeBlocks();

      document.querySelectorAll('figure.code pre code').forEach(function(el) {
        // Skip already highlighted elements
        if (el.classList.contains('hljs')) return;
        hljs.highlightElement(el);
      });
    }
  }

  // ---- Header Book Progress ----
  function initHeaderProgress() {
    var headerInner = document.querySelector('.header-inner');
    if (!headerInner) return;

    var bookPercent = getStorageNumber(STORAGE_KEYS.bookProgress, 0);
    var progressEl = document.createElement('div');
    progressEl.className = 'header-book-progress';
    progressEl.style.width = bookPercent + '%';
    progressEl.title = 'پیشرفت کتاب: ' + bookPercent + '%';

    // Insert at bottom of header
    var header = document.querySelector('.site-header');
    if (header) header.appendChild(progressEl);
  }

  // ---- Page Read Indicator ----
  function initPageReadIndicator() {
    var page = getCurrentPage();
    var readProgress = getStorage(STORAGE_KEYS.readProgress);
    var pageProgress = readProgress[page] || { percent: 0 };

    if (pageProgress.percent >= READ_THRESHOLD) {
      var contentWrap = document.querySelector('.content-wrap.text');
      if (!contentWrap) return;

      var indicator = document.createElement('div');
      indicator.className = 'page-read-indicator';
      indicator.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> خوانده شده';
      contentWrap.insertBefore(indicator, contentWrap.firstChild);
    }
  }

  // ---- Header Scroll Shadow ----
  function initHeaderScrollShadow() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    window.addEventListener('scroll', function() {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // ---- Diagram Zoom ----
  function initDiagramZoom() {
    var lightbox = null;
    var viewport = null;
    var currentSvg = null;
    var zoomLevel = 1;
    var baseWidth = 0;
    var isDragging = false;
    var dragStart = { x: 0, y: 0, scrollLeft: 0, scrollTop: 0 };

    // SVG icons
    var ZOOM_IN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
    var ZOOM_OUT_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>';
    var EXPAND_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>';
    var CLOSE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    var RESET_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>';

    // Add zoom button to each diagram figure (idempotent — safe to call again
    // after Mermaid renders more <svg> elements post-load).
    function attachZoomButtons() {
      document.querySelectorAll('figure.diagram').forEach(function(figure) {
        // Skip if button already attached
        if (figure.querySelector('.diagram-zoom-btn')) return;

        var svg = figure.querySelector('svg');
        if (!svg) return;

        // Only add zoom button for SVGs with text content (diagrams, not tiny icons)
        var textElements = svg.querySelectorAll('text');
        if (textElements.length === 0) return;

        var btn = document.createElement('button');
        btn.className = 'diagram-zoom-btn';
        btn.innerHTML = ZOOM_IN_ICON;
        btn.setAttribute('aria-label', 'بزرگنمایی دیاگرام');
        btn.title = 'بزرگنمایی';

        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          // Re-query the svg at click time in case Mermaid re-rendered it
          var liveSvg = figure.querySelector('svg');
          openLightbox(figure, liveSvg || svg);
        });

        figure.appendChild(btn);
      });
    }
    attachZoomButtons();

    function createLightbox() {
      if (lightbox) return lightbox;

      var overlay = document.createElement('div');
      overlay.className = 'svg-lightbox-overlay';

      overlay.innerHTML =
        '<div class="svg-lightbox-container">' +
          '<div class="svg-lightbox-toolbar">' +
            '<div class="svg-lightbox-toolbar-right">' +
              '<span class="svg-lightbox-title"></span>' +
            '</div>' +
            '<div class="svg-lightbox-toolbar-left">' +
              '<button class="svg-lightbox-btn zoom-out-btn" title="کوچک‌نمایی">' + ZOOM_OUT_ICON + '</button>' +
              '<span class="svg-lightbox-zoom-level">100%</span>' +
              '<button class="svg-lightbox-btn zoom-in-btn" title="بزرگ‌نمایی">' + ZOOM_IN_ICON + '</button>' +
              '<button class="svg-lightbox-btn reset-btn" title="اندازه اصلی">' + RESET_ICON + '</button>' +
              '<button class="svg-lightbox-btn close-btn" title="بستن">' + CLOSE_ICON + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="svg-lightbox-viewport">' +
            '<div class="svg-lightbox-hint">اسکرول برای جابجایی | Ctrl+اسکرول برای زوم</div>' +
          '</div>' +
        '</div>';

      document.body.appendChild(overlay);

      // Cache references
      lightbox = overlay;
      viewport = overlay.querySelector('.svg-lightbox-viewport');

      // Close on overlay click (not on container)
      overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeLightbox();
      });

      // Button handlers
      overlay.querySelector('.close-btn').addEventListener('click', closeLightbox);
      overlay.querySelector('.zoom-in-btn').addEventListener('click', function() { setZoom(zoomLevel + 0.25); });
      overlay.querySelector('.zoom-out-btn').addEventListener('click', function() { setZoom(zoomLevel - 0.25); });
      overlay.querySelector('.reset-btn').addEventListener('click', resetZoom);

      // Keyboard
      document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === '+' || e.key === '=') { e.preventDefault(); setZoom(zoomLevel + 0.25); }
        if (e.key === '-' || e.key === '_') { e.preventDefault(); setZoom(zoomLevel - 0.25); }
        if (e.key === '0') { e.preventDefault(); resetZoom(); }
      });

      // Mouse wheel zoom (Ctrl+scroll)
      viewport.addEventListener('wheel', function(e) {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          var delta = e.deltaY > 0 ? -0.1 : 0.1;
          setZoom(zoomLevel + delta);
        }
      }, { passive: false });

      // Drag to pan
      viewport.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        // Don't start drag if clicking on a button
        if (e.target.closest('.svg-lightbox-btn')) return;
        isDragging = true;
        dragStart.x = e.clientX;
        dragStart.y = e.clientY;
        dragStart.scrollLeft = viewport.scrollLeft;
        dragStart.scrollTop = viewport.scrollTop;
        e.preventDefault();
      });

      document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        var dx = e.clientX - dragStart.x;
        var dy = e.clientY - dragStart.y;
        viewport.scrollLeft = dragStart.scrollLeft - dx;
        viewport.scrollTop = dragStart.scrollTop - dy;
      });

      document.addEventListener('mouseup', function() {
        isDragging = false;
      });

      // Touch drag to pan
      var touchStart = null;
      viewport.addEventListener('touchstart', function(e) {
        if (e.touches.length === 1) {
          touchStart = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            scrollLeft: viewport.scrollLeft,
            scrollTop: viewport.scrollTop
          };
        }
      }, { passive: true });

      viewport.addEventListener('touchmove', function(e) {
        if (!touchStart || e.touches.length !== 1) return;
        var dx = e.touches[0].clientX - touchStart.x;
        var dy = e.touches[0].clientY - touchStart.y;
        viewport.scrollLeft = touchStart.scrollLeft - dx;
        viewport.scrollTop = touchStart.scrollTop - dy;
      }, { passive: true });

      viewport.addEventListener('touchend', function() {
        touchStart = null;
      }, { passive: true });

      return lightbox;
    }

    function openLightbox(figure, svg) {
      var lb = createLightbox();

      // Clone the SVG for the lightbox (so original stays intact)
      var svgClone = svg.cloneNode(true);

      // Set title from figcaption or heading
      var caption = figure.querySelector('figcaption');
      var title = caption ? caption.textContent : '';
      lb.querySelector('.svg-lightbox-title').textContent = title;

      // Get viewBox for calculating base width
      var viewBox = svg.getAttribute('viewBox');
      var vbWidth = 800;
      if (viewBox) {
        var parts = viewBox.split(/[\s,]+/);
        if (parts.length >= 4) vbWidth = parseFloat(parts[2]);
      }

      // Clear viewport and add SVG
      var viewportEl = lb.querySelector('.svg-lightbox-viewport');
      // Remove previous SVG but keep hint
      var existingSvg = viewportEl.querySelector('svg');
      if (existingSvg) existingSvg.remove();

      viewportEl.insertBefore(svgClone, viewportEl.firstChild);

      // Calculate initial width to fit viewport
      var viewportWidth = viewportEl.clientWidth || window.innerWidth * 0.9;
      baseWidth = Math.max(vbWidth, viewportWidth);
      zoomLevel = 0.5;

      svgClone.style.width = (baseWidth * zoomLevel) + 'px';
      currentSvg = svgClone;

      updateZoomDisplay();

      // Show lightbox
      lb.classList.add('active');
      document.body.style.overflow = 'hidden';

      // Center scroll position
      requestAnimationFrame(function() {
        var scrollX = (svgClone.offsetWidth - viewportEl.clientWidth) / 2;
        var scrollY = (svgClone.offsetHeight - viewportEl.clientHeight) / 2;
        viewportEl.scrollLeft = Math.max(0, scrollX);
        viewportEl.scrollTop = Math.max(0, scrollY);
      });
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      currentSvg = null;
      zoomLevel = 1;
    }

    function setZoom(level) {
      level = Math.max(0.5, Math.min(4, level));
      // Snap to 0.25 increments
      level = Math.round(level * 4) / 4;
      zoomLevel = level;
      if (currentSvg) {
        currentSvg.style.width = (baseWidth * zoomLevel) + 'px';
      }
      updateZoomDisplay();
    }

    function resetZoom() {
      zoomLevel = 0.5;
      if (currentSvg) {
        currentSvg.style.width = (baseWidth * zoomLevel) + 'px';
      }
      updateZoomDisplay();

      // Re-center
      if (viewport && currentSvg) {
        requestAnimationFrame(function() {
          var scrollX = (currentSvg.offsetWidth - viewport.clientWidth) / 2;
          var scrollY = (currentSvg.offsetHeight - viewport.clientHeight) / 2;
          viewport.scrollLeft = Math.max(0, scrollX);
          viewport.scrollTop = Math.max(0, scrollY);
        });
      }
    }

    function updateZoomDisplay() {
      if (!lightbox) return;
      var zoomEl = lightbox.querySelector('.svg-lightbox-zoom-level');
      if (zoomEl) zoomEl.textContent = Math.round(zoomLevel * 100) + '%';
    }
  }

  // ---- Initialize Everything ----
  document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    initProgressBar();
    initBackToTop();
    initHeaderScrollShadow();
    initHeaderProgress();
    initSidebar();
    initReadingProgress();
    initReadingTime();
    initPageReadIndicator();
    initContinueReading();
    initCopyButtons();
    initSearch();
    initKeyboardNav();
    initDiagramZoom();
    initHighlighting();
    initLineNumbers();
    initOpenGraph();
  });

})();
