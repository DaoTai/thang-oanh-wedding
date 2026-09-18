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
  function renderPetals() {
    var layer = document.getElementById("petalLayer");
    if (!layer || CONFIG.showPetals === false) return;

    var count = Math.max(0, Math.min(40));
    var frag = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var petal = document.createElement("span");
      petal.className = "petal";
      // Rải đều theo chiều ngang bằng bước góc vàng 137.5°
      petal.style.left = ((i * 137.5) % 100) + "%";
      petal.style.width = 8 + (i % 4) * 2 + "px";
      petal.style.height = 11 + (i % 3) * 3 + "px";
      petal.style.background =
        i % 3 === 0 ? "rgba(206, 51, 33, 0.75)" : "rgba(238, 112, 101, 0.6)";
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
  var BURST_COLORS = [
    "rgba(255, 74, 74, 0.95)",
    "rgba(204, 61, 45, 0.92)",
    "rgba(241, 22, 22, 0.88)",
  ];

  function burstPetalsFrom(originXPercent, count) {
    var layer = document.getElementById("petalLayer");
    if (!layer) return;

    var dir = originXPercent < 50 ? 1 : -1; // Góc trái bắn sang phải, góc phải bắn sang trái
    var frag = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
      var petal = document.createElement("span");
      petal.className = "petal petal--burst";

      var size = 4 + Math.random() * 10;
      petal.style.width = size + "px";
      petal.style.height = size * 1.35 + "px";
      petal.style.background = BURST_COLORS[i % BURST_COLORS.length];
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
          burstPetalsFrom(6, 500); // Góc dưới trái
          burstPetalsFrom(94, 500); // Góc dưới phải
          observer.disconnect();
        });
      },
      { threshold: 0.25 }
    );

    observer.observe(story);
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
     Nhạc nền
     Modal xin phép hiện ra sau khi tải trang; "Bật nhạc" dùng chính cú
     click đó làm cử chỉ người dùng để play() không bị trình duyệt chặn.
     Không lưu trạng thái vào localStorage — mỗi lần tải lại trang, trình
     duyệt vẫn đòi một cử chỉ mới nên modal cố tình hiện lại từ đầu.
     ------------------------------------------------------- */
  function initMusic() {
    var audio = document.getElementById("bgMusic");
    var modal = document.getElementById("musicModal");
    var toggle = document.getElementById("soundToggle");
    if (!audio || !modal || !toggle) return;

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
    }

    playBtn.addEventListener("click", function () {
      playAudio();
      closeModal();
    });
    laterBtn.addEventListener("click", function () {
      playAudio();
      closeModal();
    });
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
     Khởi động
     ------------------------------------------------------- */
  function init() {
    initHeader();
    renderPetals();
    initStoryBurst();
    initCountdown();
    initRsvp();
    initMusic();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
