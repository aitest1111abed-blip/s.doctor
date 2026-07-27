/* ============================================================================
   🌱 بذّار بيانات تجريبية — أداة داخلية للطبيب (لا تُعرض للعملاء)
   مُفعَّل فقط إذا احتوى الرابط على  #seed  (مثال: app.html#seed).
   يشتغل وأنت مسجّل دخول ككادر، فيرث صلاحياته ويكتب مباشرةً:
     • مريض باضبارة معبّأة (زيارات: شكوى/فحص/تشخيص/وصفة)
     • موعد اليوم بحالة مقبول/زار/لم يحضر (لتمتلئ بطاقات الإحصائيات)
   ⚠️ احذف سطر <script src="dev-seed.js"> من app.html قبل بيع النسخة.
   ============================================================================ */
(function () {
  if (location.hash.toLowerCase().indexOf('seed') === -1) return;   // بوابة الأمان

  var mounted = false;
  var tries = 0;
  var iv = setInterval(function () {
    if (window._fb && window._fb.onAuth) { clearInterval(iv); window._fb.onAuth(function (u) { if (u && !mounted) mount(); }); }
    else if (++tries > 150) clearInterval(iv);
  }, 100);

  // ── بيانات عشوائية واقعية ──
  var FIRST = ['محمد','أحمد','عبد الله','كريم','بشار','بدر','أسامة','حسام','وليد','سامر','رامي','خالد','طارق','فادي','يوسف','آدم','تيم','جورج','إلياس','عمر','مازن','نضال','غيث','أنس',
               'سارة','ريم','نور','هبة','مايا','جود','لينا','رنا','دانا','ميرا','سلمى','لين','رهف','ياسمين','آية','جنى','ملك','تالا'];
  var LAST  = ['الأحمد','الحلبي','الشامي','العلي','الخطيب','السيد','النجار','الحموي','الديري','القاضي','العمر','الحسن','الرفاعي','الزعبي','المصري','الدرويش'];
  var TYPES = ['كشف جديد','مراجعة','تحاليل'];
  var SLOTS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','13:00','13:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];
  var COMPLAINTS = ['ألم في البطن منذ يومين','صداع مستمرّ مع دوخة','حرارة وسعال منذ أسبوع','ألم أسفل الظهر','غثيان وفقدان شهية','ألم والتهاب في الحلق','ضيق نفس عند الجهد','ألم في المفاصل','طفح جلدي مع حكّة','تعب عام وإرهاق'];
  var EXAMS = ['العلامات الحيوية ضمن الطبيعي','الضغط 120/80، النبض 78','حرارة 38.2، احتقان بلعوم','بطن ليّن غير مؤلم بالجسّ','صدر سليم، أصوات تنفّسية طبيعية','فحص عصبي سليم','عقد لمفية غير متضخّمة'];
  var DIAGS = ['التهاب بلعوم حادّ','صداع توتّري','التهاب معدة','ارتفاع ضغط خفيف','التهاب قصبات','حساسية جلدية','عسر هضم وظيفي','التهاب مفاصل بسيط'];
  var RX = ['باراسيتامول 500مغ ٣× يومياً','أموكسيسيلين 1غ مرّتين × ٧ أيام','أوميبرازول 20مغ قبل الفطور','مضاد التهاب موضعي دهناً','راحة وسوائل + خافض حرارة','فيتامين D أسبوعياً','مضادّ حساسية مساءً'];
  var BLOOD = ['A+','O+','B+','AB+','A-','O-','B-'];
  var CHRONIC = ['سكري','ضغط','ربو','قصور درقية'];

  var rnd = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var todayISO = iso(new Date());
  function wStatus() { var r = Math.random(); return r < 0.6 ? 'Accepted' : (r < 0.9 ? 'Visited' : 'NoShow'); }

  function buildPatient() {
    var name = rnd(FIRST) + (Math.random() < 0.65 ? ' ' + rnd(LAST) : '');
    var phone = '09' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0');
    var by = 1955 + Math.floor(Math.random() * 63);
    var bd = iso(new Date(by, Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)));
    var nV = 1 + Math.floor(Math.random() * 4);
    var visits = [];
    for (var k = 0; k < nV; k++) {
      var daysAgo = (nV - k) * 7 + Math.floor(Math.random() * 5);
      var d = new Date(); d.setDate(d.getDate() - daysAgo);
      visits.push({
        date: iso(d), slot: rnd(SLOTS), visitType: rnd(TYPES),
        complaint: rnd(COMPLAINTS), clinicalExam: rnd(EXAMS),
        diagnosis: rnd(DIAGS), prescription: rnd(RX),
        noteUpdatedAt: Date.now(), source: 'chart'
      });
    }
    return {
      name: name, phone: phone, address: '', bloodType: rnd(BLOOD),
      chronicDiseases: Math.random() < 0.3 ? rnd(CHRONIC) : '',
      birthDate: bd, appointments: visits, totalVisits: visits.length,
      firstVisit: visits[0].date, lastVisit: visits[visits.length - 1].date,
      seedTag: 'devseed'
    };
  }
  function buildTodayAppt(p) {
    return {
      id: 'appt_seed_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      PatientName: p.name, Phone: p.phone, BirthDate: p.birthDate, Address: '',
      VisitType: rnd(TYPES), Date: todayISO, Slot: rnd(SLOTS),
      Status: wStatus(), source: 'devseed', createdAt: Date.now()
    };
  }

  var fb = null;
  async function seed(n, log, done) {
    fb = window._fb; var ok = 0, err = 0;
    for (var i = 0; i < n; i++) {
      try {
        var p = buildPatient();
        await fb.addDoc(fb.col('patients'), p);
        await fb.addDoc(fb.col('appointments'), buildTodayAppt(p));
        ok++; log('✓ ' + p.name + ' — ' + p.totalVisits + ' زيارة');
      } catch (e) { err++; log('✕ فشل: ' + (e.code || e.message)); }
    }
    done(ok, err);
  }
  async function wipe(log, done) {
    fb = window._fb; var del = 0;
    try {
      var ps = await fb.getDocs(fb.col('patients'));
      for (var i = 0; i < ps.docs.length; i++) { if (ps.docs[i].data().seedTag === 'devseed') { await fb.deleteDoc(fb.docRef('patients', ps.docs[i].id)); del++; } }
      var as = await fb.getDocs(fb.col('appointments'));
      for (var j = 0; j < as.docs.length; j++) { if (as.docs[j].data().source === 'devseed') { await fb.deleteDoc(fb.docRef('appointments', as.docs[j].id)); del++; } }
    } catch (e) { log('✕ ' + (e.code || e.message)); }
    done(del);
  }

  // ── لوحة عائمة ──
  function mount() {
    mounted = true;
    var box = document.createElement('div');
    box.dir = 'rtl';
    box.style.cssText = 'position:fixed;bottom:18px;left:18px;z-index:99999;width:290px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;box-shadow:0 10px 40px -12px rgba(15,23,42,.35);padding:15px 16px;font-family:Tajawal,system-ui,sans-serif;color:#0f172a;';
    box.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">'
        + '<b style="font-size:.95rem;">🌱 بذّار تجريبي</b>'
        + '<button id="dsX" style="border:none;background:none;cursor:pointer;color:#94a3b8;font-size:1.1rem;">×</button></div>'
      + '<div style="font-size:.72rem;color:#f59e0b;font-weight:700;margin-bottom:12px;">أداة داخلية — احذفها قبل البيع</div>'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">'
        + '<label style="font-size:.82rem;font-weight:700;">عدد المرضى</label>'
        + '<input id="dsN" type="number" value="15" min="1" max="100" style="width:70px;height:36px;border:1.5px solid #e2e8f0;border-radius:9px;text-align:center;font-size:1rem;font-family:inherit;"></div>'
      + '<button id="dsGo" style="width:100%;height:42px;border:none;border-radius:10px;background:#0d9488;color:#fff;font-weight:800;font-family:inherit;cursor:pointer;font-size:.9rem;margin-bottom:8px;">بذر مرضى + مواعيد اليوم</button>'
      + '<button id="dsWipe" style="width:100%;height:38px;border:1.5px solid #fca5a5;border-radius:10px;background:#fee2e2;color:#dc2626;font-weight:800;font-family:inherit;cursor:pointer;font-size:.82rem;">🧹 امسح بيانات البذر</button>'
      + '<div id="dsLog" style="margin-top:12px;max-height:150px;overflow-y:auto;font-size:.75rem;line-height:1.7;color:#475569;"></div>';
    document.body.appendChild(box);

    var logEl = box.querySelector('#dsLog');
    var goBtn = box.querySelector('#dsGo');
    var wipeBtn = box.querySelector('#dsWipe');
    function log(t) { var d = document.createElement('div'); d.textContent = t; logEl.prepend(d); }

    box.querySelector('#dsX').onclick = function () { box.remove(); };
    goBtn.onclick = function () {
      var n = Math.max(1, Math.min(100, +box.querySelector('#dsN').value || 15));
      goBtn.disabled = true; goBtn.textContent = 'جارٍ البذر…';
      seed(n, log, function (ok, err) {
        goBtn.disabled = false; goBtn.textContent = 'بذر مرضى + مواعيد اليوم';
        log('— تمّ: ' + ok + ' ✓ / ' + err + ' ✕ — حدّث الصفحة (F5) إن لم يظهروا فوراً');
      });
    };
    wipeBtn.onclick = function () {
      if (!confirm('حذف كل بيانات البذر (المرضى + المواعيد المُولّدة)؟')) return;
      wipeBtn.disabled = true; wipeBtn.textContent = 'جارٍ الحذف…';
      wipe(log, function (del) { wipeBtn.disabled = false; wipeBtn.textContent = '🧹 امسح بيانات البذر'; log('— حُذف ' + del + ' مستنداً'); });
    };
  }
})();
