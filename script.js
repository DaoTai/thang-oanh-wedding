/* =========================================================
   Thiệp cưới Tài & Mai — script
   Chuyển thể phần logic (DCLogic) của "Wedding Invitation.dc.html".
   ========================================================= */

(function () {
  "use strict";

  /* -------------------------------------------------------
     Cấu hình — tương ứng phần "props" của thiết kế gốc
     ------------------------------------------------------- */
  var CONFIG = {
    weddingDateIso: "2026-11-28T17:00:00+07:00", // Ngày giờ tổ chức
    showPetals: true, // Bật/tắt hiệu ứng cánh hoa rơi
    petalCount: 66, // Số cánh hoa (0–40)
  };

  /* -------------------------------------------------------
     Cánh hoa rơi
     ------------------------------------------------------- */
  /* Dáng cánh (ngoài / cuốn lệch / trong lòng bông) và tông màu hồng thật —
     định nghĩa trong styles.css, ở đây chỉ bốc thăm cho từng cánh. */
  var PETAL_SHAPES = ["", " petal--s2", " petal--s3"];
  var PETAL_TONES = [
    " petal--t1",
    " petal--t2",
    " petal--t3",
    " petal--t4",
    " petal--t5",
  ];

  function renderPetals() {
    var layer = document.getElementById("petalLayer");
    if (!layer || CONFIG.showPetals === false) return;

    var count = Math.max(0, Math.min(40));
    var frag = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var petal = document.createElement("span");
      petal.className =
        "petal" +
        PETAL_SHAPES[i % PETAL_SHAPES.length] +
        PETAL_TONES[i % PETAL_TONES.length];
      // Rải đều theo chiều ngang bằng bước góc vàng 137.5°
      petal.style.left = ((i * 137.5) % 100) + "%";
      // Cánh hồng thật bè ngang (rộng hơn cao), không thon dài như lá
      var width = 14 + (i % 6) * 2;
      petal.style.width = width + "px";
      petal.style.height = Math.round(width * (0.8 + (i % 3) * 0.06)) + "px";
      petal.style.setProperty("--dx", ((i % 5) - 2) * 60 + "px");
      petal.style.animation =
        "petalFall " +
        (12 + (i % 7) * 1.7) +
        "s linear " +
        (i % 9) * 1.4 +
        "s infinite";
      frag.appendChild(petal);
    }

    layer.appendChild(frag);
  }

  /* -------------------------------------------------------
     Confetti boom — cánh hoa bắn lên từ hai góc dưới khi
     mục #story lọt vào khung nhìn (chỉ chạy một lần).
     ------------------------------------------------------- */
  function burstPetalsFrom(originXPercent, count) {
    var layer = document.getElementById("petalLayer");
    if (!layer) return;

    var dir = originXPercent < 50 ? 1 : -1; // Góc trái bắn sang phải, góc phải bắn sang trái
    var frag = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var petal = document.createElement("span");
      petal.className =
        "petal petal--burst" +
        PETAL_SHAPES[i % PETAL_SHAPES.length] +
        PETAL_TONES[(i + 2) % PETAL_TONES.length];

      // Cánh hồng thật bè ngang; nhiều cỡ để chùm hoa có chiều sâu
      var size = 11 + Math.random() * 12;
      petal.style.width = size + "px";
      petal.style.height = size * (0.78 + Math.random() * 0.16) + "px";
      petal.style.left = originXPercent + (Math.random() * 10 - 5) + "%";
      // Góc bắn dao động quanh 45° (15°–75°) để cả chùm xòe ra hình phễu/quạt
      // thay vì bay thẳng một đường, thân hẹp ở góc và loe rộng dần lên trên
      var dist = 150 + Math.random() * 260;
      var angleDeg = 15 + Math.random() * 60;
      var angleRad = (angleDeg * Math.PI) / 180;
      petal.style.setProperty("--bx", dir * dist * Math.cos(angleRad) + "px");
      petal.style.setProperty("--by", dist * Math.sin(angleRad) + "px");
      // --rx/--ry: lệch ngẫu nhiên sau khi qua đỉnh, để cánh hoa trôi tự do thay vì bay thẳng
      petal.style.setProperty("--rx", Math.random() * 220 - 110 + "px");
      petal.style.setProperty("--ry", Math.random() * 120 - 40 + "px");
      petal.style.setProperty("--rot-mid", 180 + Math.random() * 360 + "deg");
      petal.style.setProperty("--rot-mid2", 360 + Math.random() * 500 + "deg");
      petal.style.setProperty("--rot-end", 940 + Math.random() * 360 + "deg");
      petal.style.animationDuration = 4.8 + Math.random() * 2.4 + "s";
      petal.style.animationDelay = Math.random() * 3 + "s";
      petal.addEventListener("animationend", function () {
        this.remove();
      });

      frag.appendChild(petal);
    }

    layer.appendChild(frag);
  }

  function initStoryBurst() {
    var story = document.getElementById("story");
    if (!story || typeof IntersectionObserver !== "function") return;
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          burstPetalsFrom(6, 48); // Góc dưới trái
          burstPetalsFrom(94, 48); // Góc dưới phải
          observer.disconnect();
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(story);
  }

  function initWhenReveal() {
    var mapBlocks = document.querySelectorAll(
      ".when-map, .families, .when-calendar, .when-date-block"
    );
    if (!mapBlocks.length) return;

    if (typeof IntersectionObserver !== "function") {
      mapBlocks.forEach(function (block) {
        block.classList.add("is-visible");
      });
      return;
    }
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      mapBlocks.forEach(function (block) {
        block.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );

    mapBlocks.forEach(function (block) {
      observer.observe(block);
    });
  }

  /* -------------------------------------------------------
     Lịch tháng cưới
     Dựng từ CONFIG.weddingDateIso. Ngày/tháng/năm đọc thẳng từ chuỗi
     (không qua múi giờ của trình duyệt) để người xem ở nước khác không bị
     lệch sang ngày hôm trước/sau.
     ------------------------------------------------------- */
  function initCalendar() {
    var title = document.getElementById("calTitle");
    var body = document.getElementById("calBody");
    if (!title || !body) return;

    var parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(CONFIG.weddingDateIso);
    if (!parts) return;
    var year = Number(parts[1]);
    var month = Number(parts[2]); // 1–12
    var day = Number(parts[3]);

    var firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay(); // 0 = CN
    var daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    var totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

    title.textContent = "Tháng " + month + " - " + year;

    var row = null;
    for (var i = 0; i < totalCells; i++) {
      if (i % 7 === 0) {
        row = document.createElement("tr");
        body.appendChild(row);
      }
      var cell = document.createElement("td");
      var num = i - firstWeekday + 1;
      if (num === day) {
        var mark = document.createElement("span");
        mark.className = "cal-wedding";
        mark.textContent = String(num);
        cell.setAttribute("aria-current", "date");
        cell.appendChild(mark);
      } else if (num >= 1 && num <= daysInMonth) {
        cell.textContent = String(num);
      }
      row.appendChild(cell);
    }
  }

  /* -------------------------------------------------------
     Đếm ngược
     ------------------------------------------------------- */
  function initCountdown() {
    var cells = {
      d: document.getElementById("cdDays"),
      h: document.getElementById("cdHours"),
      m: document.getElementById("cdMinutes"),
      s: document.getElementById("cdSeconds"),
    };
    if (!cells.d || !cells.h || !cells.m || !cells.s) return;

    var target = new Date(CONFIG.weddingDateIso).getTime();
    if (isNaN(target)) return;

    function pad(n) {
      return String(n).padStart(2, "0");
    }

    function tick() {
      var left = Math.max(0, Math.floor((target - Date.now()) / 1000));
      cells.d.textContent = pad(Math.floor(left / 86400));
      cells.h.textContent = pad(Math.floor(left / 3600) % 24);
      cells.m.textContent = pad(Math.floor(left / 60) % 60);
      cells.s.textContent = pad(left % 60);
    }

    tick();
    setInterval(tick, 1000);
  }

  /* -------------------------------------------------------
     Lời chúc / RSVP
     Chỉ hiển thị màn hình cảm ơn — không gửi dữ liệu đi đâu.
     Muốn nhận lời chúc thật thì thay phần trong handleSubmit
     bằng một lệnh fetch() tới backend / Google Apps Script.
     ------------------------------------------------------- */
  function initRsvp() {
    var form = document.getElementById("rsvpForm");
    var thanks = document.getElementById("rsvpThanks");
    if (!form || !thanks) return;

    var choices = form.querySelectorAll(".choice");
    var going = "yes";

    Array.prototype.forEach.call(choices, function (btn) {
      btn.addEventListener("click", function () {
        going = btn.getAttribute("data-going");
        Array.prototype.forEach.call(choices, function (other) {
          var active = other === btn;
          other.classList.toggle("is-active", active);
          other.setAttribute("aria-checked", active ? "true" : "false");
        });
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var payload = {
        name: document.getElementById("rsvpName").value.trim(),
        msg: document.getElementById("rsvpMsg").value.trim(),
        going: going,
      };
      // Dữ liệu đã thu thập, sẵn sàng để gửi đi nếu cần:
      console.log("RSVP", payload);

      form.hidden = true;
      thanks.hidden = false;
      thanks.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* -------------------------------------------------------
     Chia sẻ thiệp
     Ưu tiên share sheet của hệ điều hành (mobile có sẵn Zalo, Messenger,
     Facebook...). Máy không hỗ trợ thì sao chép liên kết vào clipboard.
     Tiêu đề và mô tả lấy từ thẻ og: trong <head> để chỉ phải sửa một nơi.
     ------------------------------------------------------- */
  function metaContent(prop, fallback) {
    var tag = document.querySelector('meta[property="' + prop + '"]');
    var value = tag && tag.getAttribute("content");
    return value ? value.trim() : fallback;
  }

  /* Đường lui cho trình duyệt cũ không có navigator.clipboard (hoặc trang
     chạy qua http). Trả về true nếu sao chép được. */
  function copyByExecCommand(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-9999px";
    document.body.appendChild(area);

    var copied = false;
    try {
      area.select();
      copied = document.execCommand("copy");
    } catch (err) {
      copied = false;
    }
    document.body.removeChild(area);
    return copied;
  }

  function initShare() {
    var btn = document.getElementById("shareBtn");
    var label = document.getElementById("shareBtnLabel");
    if (!btn || !label) return;

    var IDLE_TEXT = label.textContent;
    var FEEDBACK_MS = 2000;
    var resetTimer = null;

    // Bấm liên tiếp thì hẹn lại giờ, không để nhiều timer chồng nhau
    function flash(message) {
      label.textContent = message;
      btn.classList.add("is-copied");
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () {
        label.textContent = IDLE_TEXT;
        btn.classList.remove("is-copied");
      }, FEEDBACK_MS);
    }

    function copyLink(url) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(
          function () {
            flash("Đã sao chép ✓");
          },
          function () {
            flash(copyByExecCommand(url) ? "Đã sao chép ✓" : "Không sao chép được");
          }
        );
        return;
      }
      flash(copyByExecCommand(url) ? "Đã sao chép ✓" : "Không sao chép được");
    }

    btn.addEventListener("click", function () {
      var url = window.location.href;
      var data = {
        title: metaContent("og:title", document.title),
        text: metaContent("og:description", document.title),
        url: url,
      };

      if (navigator.share) {
        navigator.share(data).catch(function (err) {
          // Người dùng đóng share sheet là chuyện bình thường, không báo gì.
          // Lỗi khác (trình duyệt từ chối kiểu dữ liệu...) thì lui về sao chép.
          if (err && err.name === "AbortError") return;
          copyLink(url);
        });
        return;
      }

      copyLink(url);
    });
  }

  /* -------------------------------------------------------
     Tên cô dâu chú rể "viết tay"
     Ẩn tên ngay từ đầu rồi trả về hàm bắt đầu viết. Modal nhạc che hero nên
     việc viết chỉ bắt đầu khi modal đóng; hai tên viết song song và cùng xong
     một lúc, thời lượng theo tên dài nhất. Thiếu hỗ trợ mask hoặc bật giảm
     chuyển động thì bỏ qua hiệu ứng, tên hiện đủ như thường.
     ------------------------------------------------------- */
  function initNameWriting() {
    var names = document.querySelectorAll(".couple-name");
    var maskGradient = "linear-gradient(#000, #000)";
    var supportsMask =
      window.CSS &&
      typeof CSS.supports === "function" &&
      (CSS.supports("mask-image", maskGradient) ||
        CSS.supports("-webkit-mask-image", maskGradient));
    var reduceMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!names.length || !supportsMask || reduceMotion) return function () {};

    var SECONDS_PER_CHAR = 0.17;
    var START_DELAY = 0.35; // Chờ modal tan bớt để nét bút đầu tiên không bị che

    Array.prototype.forEach.call(names, function (name) {
      name.classList.add("is-pending");
    });

    var started = false;
    function write() {
      if (started) return;
      started = true;

      var longest = 0;
      Array.prototype.forEach.call(names, function (name) {
        longest = Math.max(longest, name.textContent.trim().length);
      });
      var duration = longest * SECONDS_PER_CHAR;

      Array.prototype.forEach.call(names, function (name) {
        var ink = name.querySelector(".couple-name__ink");
        ink.style.setProperty("--write-duration", duration + "s");
        ink.style.setProperty("--write-delay", START_DELAY + "s");
        ink.addEventListener("animationend", function () {
          name.classList.add("is-written");
        });
        name.classList.remove("is-pending");
        name.classList.add("is-writing");
      });
    }

    // Đợi font Aquarelle tải xong để không viết bằng font dự phòng rồi đổi
    // font giữa chừng; tối đa chờ 1.5s cho mạng chậm.
    return function start() {
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(write);
        setTimeout(write, 1500);
      } else {
        write();
      }
    };
  }

  /* -------------------------------------------------------
     Nhạc nền
     Modal xin phép hiện ra sau khi tải trang; "Bật nhạc" dùng chính cú
     click đó làm cử chỉ người dùng để play() không bị trình duyệt chặn.
     Không lưu trạng thái vào localStorage — mỗi lần tải lại trang, trình
     duyệt vẫn đòi một cử chỉ mới nên modal cố tình hiện lại từ đầu.
     Trả về true nếu đã dựng modal; onModalClosed được gọi mỗi khi modal đóng.
     ------------------------------------------------------- */
  function initMusic(onModalClosed) {
    var audio = document.getElementById("bgMusic");
    var modal = document.getElementById("musicModal");
    var toggle = document.getElementById("soundToggle");
    if (!audio || !modal || !toggle) return false;

    var backdrop = document.getElementById("musicModalBackdrop");
    var playBtn = document.getElementById("musicModalPlay");
    var laterBtn = document.getElementById("musicModalLater");
    var hideTimer = null;

    function setPlayingState(isPlaying) {
      toggle.classList.toggle("is-playing", isPlaying);
      toggle.setAttribute("aria-pressed", isPlaying ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"
      );
    }

    function playAudio() {
      var playPromise = audio.play();
      // play() có thể không trả Promise trên trình duyệt cũ
      if (playPromise && typeof playPromise.then === "function") {
        playPromise
          .then(function () {
            setPlayingState(true);
          })
          .catch(function () {
            // Tự phát bị chặn hoặc lỗi khác — im lặng, giữ trạng thái "tắt"
            setPlayingState(false);
          });
      } else {
        setPlayingState(true);
      }
    }

    // Chỉ có hai phần tử focus được bên trong hộp thoại — bẫy Tab/Shift+Tab
    // giữa chúng để bàn phím không lọt ra ngoài khi modal đang mở.
    function handleKeydown(e) {
      if (e.key === "Escape") {
        closeModal();
        return;
      }
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === playBtn) {
          e.preventDefault();
          laterBtn.focus();
        }
      } else {
        if (document.activeElement === laterBtn) {
          e.preventDefault();
          playBtn.focus();
        }
      }
    }

    function openModal() {
      modal.hidden = false;
      // Gỡ [hidden] và thêm class kích hoạt animation cách nhau một khung
      // hình, nếu không trình duyệt gộp hai thay đổi lại và bỏ qua hiệu ứng
      requestAnimationFrame(function () {
        modal.classList.add("is-open");
      });
      document.addEventListener("keydown", handleKeydown);
      // Đưa focus vào hộp thoại để trình đọc màn hình thông báo đã vào modal
      // và người dùng bàn phím không lọt thẳng ra nội dung phía sau backdrop.
      playBtn.focus();
    }

    function closeModal() {
      if (modal.hidden) return;
      modal.classList.remove("is-open");
      document.removeEventListener("keydown", handleKeydown);

      if (hideTimer) clearTimeout(hideTimer);
      // Chờ hiệu ứng thoát chạy xong rồi mới gắn lại [hidden], tránh biến
      // mất đột ngột
      hideTimer = setTimeout(function () {
        modal.hidden = true;
      }, 450);

      // Trả focus về nút điều khiển nhạc trên header thay vì để trôi mất
      // (về <body>) khi phần tử đang được focus vừa biến mất.
      toggle.focus();

      if (onModalClosed) onModalClosed();
    }

    playBtn.addEventListener("click", function () {
      playAudio();
      closeModal();
    });
    laterBtn.addEventListener("click", closeModal);
    if (backdrop) backdrop.addEventListener("click", closeModal);

    toggle.addEventListener("click", function () {
      if (audio.paused) {
        playAudio();
      } else {
        audio.pause();
        setPlayingState(false);
      }
    });

    setTimeout(openModal, 500);
    return true;
  }

  /* -------------------------------------------------------
     Hộp thoại mừng cưới (chúc phúc / lì xì)
     Mở từ nút #giftModalOpen; dùng lại bộ style .music-modal*. Đóng bằng nút
     Đóng, phím Escape hoặc bấm nền mờ, rồi trả focus về nút đã mở.
     ------------------------------------------------------- */
  function initGiftModal() {
    var modal = document.getElementById("giftModal");
    var openBtn = document.getElementById("giftModalOpen");
    var closeBtn = document.getElementById("giftModalClose");
    if (!modal || !openBtn || !closeBtn) return;

    var backdrop = document.getElementById("giftModalBackdrop");
    var hideTimer = null;

    // Chỉ có một phần tử focus được (nút Đóng) — giữ Tab/Shift+Tab ở lại đó
    // để bàn phím không lọt ra nội dung phía sau backdrop.
    function handleKeydown(e) {
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "Tab") {
        e.preventDefault();
        closeBtn.focus();
      }
    }

    function openModal() {
      if (hideTimer) clearTimeout(hideTimer);
      modal.hidden = false;
      // Gỡ [hidden] và thêm class kích hoạt animation cách nhau một khung hình,
      // nếu không trình duyệt gộp hai thay đổi lại và bỏ qua hiệu ứng
      requestAnimationFrame(function () {
        modal.classList.add("is-open");
      });
      document.addEventListener("keydown", handleKeydown);
      closeBtn.focus();
    }

    function closeModal() {
      if (modal.hidden) return;
      modal.classList.remove("is-open");
      document.removeEventListener("keydown", handleKeydown);
      // Chờ hiệu ứng thoát chạy xong rồi mới gắn lại [hidden]
      hideTimer = setTimeout(function () {
        modal.hidden = true;
      }, 450);
      openBtn.focus();
    }

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    if (backdrop) backdrop.addEventListener("click", closeModal);
  }

  /* -------------------------------------------------------
     Header cố định
     Header nằm đè lên ảnh nền nên để trong suốt khi ở đầu trang,
     chỉ mờ nền lại sau khi cuộn xuống. Chiều cao thật của header
     được ghi vào biến --header-h để hero chừa đủ chỗ.
     ------------------------------------------------------- */
  function initHeader() {
    var header = document.getElementById("siteHeader");
    if (!header) return;

    function syncHeight() {
      document.documentElement.style.setProperty(
        "--header-h",
        header.offsetHeight + "px"
      );
    }

    function syncScrolled() {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    }

    syncHeight();
    syncScrolled();

    if (typeof ResizeObserver === "function") {
      new ResizeObserver(syncHeight).observe(header);
    } else {
      window.addEventListener("resize", syncHeight);
    }
    window.addEventListener("scroll", syncScrolled, { passive: true });
  }

  /* -------------------------------------------------------
     Màn mở đầu
     Hai nửa thiệp bay vào ghép thành chữ 囍, rung và loé sáng, được
     viền bằng vòng tròn đỏ, rồi mở ra như hai cánh cửa khoe tên và
     ngày cưới trước khi gập lại và tan đi.

     Toàn bộ chuyển động nằm ở styles.css; hàm này chỉ bật lần lượt
     các class .is-* rồi đọc thời lượng từ chính các biến CSS trong
     khối .intro — sửa nhịp ở stylesheet là JS tự chạy theo, hai bên
     không bao giờ lệch nhau.

     onDone được gọi đúng một lần: hết màn, bấm bỏ qua, hay ngay lập
     tức nếu trang không có markup intro.
     ------------------------------------------------------- */
  function initIntro(onDone) {
    var intro = document.getElementById("intro");
    var stage = document.getElementById("introStage");
    var skipBtn = document.getElementById("introSkip");
    var canvas = document.getElementById("introSparks");
    var page = document.getElementById("top");

    var done = false;
    var timers = [];
    var stopSparks = null;

    function finish() {
      if (done) return;
      done = true;
      onDone();
    }

    if (!intro) {
      finish();
      return;
    }

    function at(delay, fn) {
      timers.push(setTimeout(fn, delay));
    }

    function clearTimers() {
      for (var i = 0; i < timers.length; i++) clearTimeout(timers[i]);
      timers = [];
    }

    // Đọc một mốc thời gian từ biến CSS. Nhận cả "780ms" lẫn "0.78s",
    // trả về mili giây; hỏng thì dùng giá trị dự phòng thay vì NaN.
    var cs = window.getComputedStyle(intro);
    function step(name, fallback) {
      var raw = cs.getPropertyValue(name).trim();
      var n = parseFloat(raw);
      if (!raw || isNaN(n)) return fallback;
      return raw.slice(-2) === "ms" ? n : n * 1000;
    }

    /* Hạt sáng bắn ra hai bên đúng lúc hai nửa chạm nhau. Canvas chỉ
       phủ vừa khung thiệp chứ không full-screen, DPR chặn ở 2, và
       vòng lặp tự dừng khi hạt cuối tắt — không để rAF chạy nền. */
    function burstSparks() {
      var ctx = canvas && canvas.getContext && canvas.getContext("2d");
      if (!ctx || !stage) return null;

      var box = stage.getBoundingClientRect();
      var w = box.width;
      var h = box.height;
      if (!w || !h) return null;

      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.scale(dpr, dpr);

      var parts = [];
      for (var i = 0; i < 44; i++) {
        var dir = i % 2 ? 1 : -1;
        parts.push({
          x: w / 2,
          y: h / 2 + (Math.random() - 0.5) * h * 0.5,
          vx: dir * (1.1 + Math.random() * 3.6),
          vy: (Math.random() - 0.5) * 2.2,
          r: 1.2 + Math.random() * 2.4,
          life: 0,
          max: 520 + Math.random() * 420,
          gold: Math.random() > 0.3,
        });
      }

      var raf = 0;
      var last = 0;
      function frame(now) {
        if (!last) last = now;
        // Chặn bước nhảy lớn khi tab bị treo, kẻo hạt văng hết một lần
        var dt = Math.min(now - last, 34);
        last = now;

        ctx.clearRect(0, 0, w, h);
        var k = dt / 16.7;
        var alive = 0;

        for (var j = 0; j < parts.length; j++) {
          var p = parts[j];
          p.life += dt;
          if (p.life >= p.max) continue;
          alive++;

          p.x += p.vx * k;
          p.y += p.vy * k;
          p.vy += 0.035 * k;
          p.vx *= 0.985;

          var a = 1 - p.life / p.max;
          ctx.globalAlpha = a * a;
          // Nền thiệp vốn màu kem, nên hạt phải là vàng đậm và đỏ son mới
          // nổi — hạt trắng sẽ mất hút hoàn toàn. Quầng sáng cùng màu để
          // mỗi hạt trông như một đốm lửa nhỏ chứ không phải chấm phẳng.
          var tone = p.gold ? "#c08a3e" : "#a8272b";
          ctx.fillStyle = tone;
          ctx.shadowColor = tone;
          ctx.shadowBlur = 6 * a;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * (0.4 + a * 0.6), 0, Math.PI * 2);
          ctx.fill();
        }

        if (alive) {
          raf = requestAnimationFrame(frame);
        } else {
          raf = 0;
          ctx.clearRect(0, 0, w, h);
        }
      }
      raf = requestAnimationFrame(frame);

      return function () {
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
        ctx.clearRect(0, 0, w, h);
      };
    }

    function onKey(e) {
      if (e.key === "Escape") skip();
    }

    function teardown() {
      clearTimers();
      document.removeEventListener("keydown", onKey);
      if (stopSparks) stopSparks();

      document.documentElement.classList.remove("intro-lock");
      if (page) {
        page.removeAttribute("aria-hidden");
        page.inert = false;
      }
      if (intro.parentNode) intro.parentNode.removeChild(intro);

      finish();
    }

    function leave(outMs) {
      intro.classList.add("is-leaving");
      at(outMs, teardown);
    }

    function skip() {
      if (done) return;
      clearTimers();
      if (stopSparks) stopSparks();
      // Ai đã bấm bỏ qua thì không bắt họ chờ nốt 700ms tan chậm rãi
      intro.style.setProperty("--intro-out", "320ms");
      leave(320);
    }

    // Khoá trang phía sau: inert chặn chuột lẫn Tab, aria-hidden lo phần
    // trình đọc màn hình cho trình duyệt chưa hỗ trợ inert.
    document.documentElement.classList.add("intro-lock");
    if (page) {
      page.setAttribute("aria-hidden", "true");
      page.inert = true;
    }

    if (skipBtn) skipBtn.addEventListener("click", skip);
    intro.addEventListener("click", skip);
    document.addEventListener("keydown", onKey);

    var reduce =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function play() {
      if (done) return;

      if (reduce) {
        // styles.css đã dựng sẵn thiệp ở trạng thái ghép xong: chỉ hiện
        // rồi tan, không rung, không xoay, không hạt sáng.
        at(900, function () {
          leave(400);
        });
        return;
      }

      var t = step("--intro-lead", 260);
      at(t, function () {
        intro.classList.add("is-entering");
      });

      t += step("--intro-in", 780);
      at(t, function () {
        intro.classList.add("is-impact");
        stopSparks = burstSparks();
      });

      t += step("--intro-impact", 420);
      at(t, function () {
        intro.classList.add("is-fusing");
      });

      t += step("--intro-fuse", 980);
      at(t, function () {
        intro.classList.add("is-open");
      });

      t += step("--intro-open", 800) + step("--intro-hold", 1200);
      at(t, function () {
        intro.classList.add("is-closing");
      });

      t += step("--intro-close", 700);
      at(t, function () {
        leave(step("--intro-out", 700));
      });
    }

    /* Chờ font có chữ 囍 rồi mới diễn, nếu không hai nửa sẽ ghép bằng
       glyph dự phòng rồi mới đổi nét giữa chừng. Có hẹn giờ 800ms để
       font hỏng hay mạng chậm không khoá người xem lại ở màn trống. */
    if (document.fonts && document.fonts.load) {
      var started = false;
      var go = function () {
        if (started) return;
        started = true;
        play();
      };
      at(800, go);
      try {
        document.fonts.load('700 100px "Noto Serif TC"', "囍").then(go, go);
      } catch (err) {
        go();
      }
    } else {
      play();
    }
  }

  /* -------------------------------------------------------
     Khởi động
     ------------------------------------------------------- */
  function init() {
    initHeader();
    renderPetals();
    initStoryBurst();
    initCalendar();
    initWhenReveal();
    initCountdown();
    initRsvp();
    initShare();
    initGiftModal();
    // Đặt ngay trước initMusic: ẩn tên và nối hàm bắt đầu viết vào modal là một
    // cặp, để lỗi ở các bước trước không làm tên bị ẩn mà không bao giờ hiện.
    var writeNames = initNameWriting();
    // Màn mở đầu chặn phía trước: chỉ khi nó tan đi mới tới lượt modal
    // xin phép bật nhạc, rồi tên cô dâu chú rể mới bắt đầu được viết.
    initIntro(function () {
      if (!initMusic(writeNames)) writeNames();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
