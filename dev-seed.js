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
  var SENTENCES = ['لا شكاوى حالية والفحص ضمن الطبيعي','تحسّن ملحوظ بعد العلاج السابق','استمرار الأعراض بشكل خفيف','الحالة مستقرّة والمتابعة دورية','يُنصح بإعادة التقييم بعد أسبوعين','لا مضاعفات، الاستجابة جيّدة للعلاج'];
  var SHORTTEXT = ['طبيعي','ضمن الحدود','خفيف','متوسط','مستقرّ','جيّد','لا يوجد'];

  // ── محتوى سريري حسب التخصّص (شكوى/فحص/تشخيص/وصفة) — يُقرأ التخصّص من الإعدادات تلقائياً ──
  var SPECIALTY_CONTENT = {
    eye: {
      complaints: ['زغللة وضبابية في الرؤية','احمرار وحكّة بالعين','دماع مستمرّ','ألم عيني مع صداع','ضعف الرؤية الليلية','جفاف وحرقة بالعينين','رؤية هالات حول الأضواء','حساسية شديدة للضوء','إفراز صباحي بالعين','ذبابة طائرة أمام العين'],
      exams: ['حدة الإبصار 6/9 يمنى · 6/6 يسرى','ضغط العين 15/16 ملم زئبق','القرنية شفافة والحدقة متفاعلة','قعر العين طبيعي بلا نزوف','بداية إعتام عدسة خفيف','ملتحمة هادئة بلا احتقان','الغرفة الأمامية عميقة وهادئة'],
      diags: ['التهاب ملتحمة تحسّسي','متلازمة جفاف العين','قصر نظر بسيط','طول نظر شيخوخي','بداية ساد نووي','التهاب حفّة الجفن','ارتفاع ضغط عين — يُتابع','خطأ انكساري'],
      rx: ['قطرة دموع صناعية ٤× يومياً','قطرة مضاد حيوي ٣× × ٥ أيام','نظّارة طبية حسب القياس','قطرة خافضة لضغط العين مساءً','مضاد هيستامين موضعي','مرهم مضاد التهاب ليلاً']
    }
    // بقيّة التخصّصات تستعمل المحتوى العام (COMPLAINTS/EXAMS/DIAGS/RX)
  };
  function specContent(spec) {
    return SPECIALTY_CONTENT[spec] || { complaints: COMPLAINTS, exams: EXAMS, diags: DIAGS, rx: RX };
  }
  // يفهم التخصّص المختار من نصّ الإعدادات
  function detectSpecialty(name) {
    var s = String(name || '');
    if (/عيون|عين|بصر/.test(s))         return 'eye';
    if (/أسنان|اسنان|سنّ|سن/.test(s))    return 'dental';
    if (/أطفال|اطفال/.test(s))           return 'peds';
    if (/نسائ|توليد|حمل/.test(s))        return 'obgyn';
    if (/قلب/.test(s))                   return 'cardio';
    if (/جلد/.test(s))                   return 'derm';
    if (/عظم|عظام|مفاصل/.test(s))        return 'ortho';
    return 'general';
  }

  // ── بيانات العمليات / التقويم / مخطّط الأسنان ──
  var SURGERIES  = ['قلع ضرس العقل الجراحي','زرعة سنّية','رفع الجيب الفكّي','استئصال كيس فكّي','تطعيم عظمي','كشط لثوي جراحي','قلع جراحي لسنّ منطمر','تركيب جسر ثابت'];
  var SURG_COMP  = ['نزف بسيط ضُبط موضعياً','تورّم خفيف زال خلال أيام','لا مضاعفات تُذكر'];
  var TEETH      = [11,12,13,14,15,16,17,18,21,22,23,24,25,26,27,28,31,32,33,34,35,36,37,38,41,42,43,44,45,46,47,48];
  var DC_FIND    = ['caries','sec_caries','pain','fracture','gum','mobility','impacted','missing'];
  var DC_TREAT   = ['filled','root','crowned','bridge','implant','extracted','cleaning'];
  var ORTHO_TYPES = ['fixed','removable','clear'];
  var ADJ_NOTES  = ['شدّ الأسلاك','تبديل المطّاط','تعديل القوس','متابعة دورية','تفعيل الجهاز'];

  // ── ثوابت التجربة القوية ──
  var SPAN_DAYS    = 90;      // توزيع تواريخ الزيارات على آخر ٣ أشهر (كلّها ماضية)
  var APPT_WINDOW  = 45;      // مواعيد مجموعة appointments لآخر ٤٥ يوم فقط (النافذة المقروءة)
  var WRITE_BUDGET = 18000;   // قاطع أمان تحت حدّ ٢٠٬٠٠٠ كتابة/يوم المجاني
  var BATCH_MAX    = 450;     // عمليات/دفعة (هامش تحت حدّ ٥٠٠)
  var TODAY_APPTS  = 50;      // عدد مواعيد «اليوم» المضمونة لتعمير لوحة اليوم

  var rnd = function (a) { return a[Math.floor(Math.random() * a.length)]; };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var todayISO = iso(new Date());
  function daysAgoISO(n) { var d = new Date(); d.setDate(d.getDate() - n); return iso(d); }
  function genId(prefix) { return (prefix || 'seed') + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9); }
  function wStatus() { var r = Math.random(); return r < 0.6 ? 'Accepted' : (r < 0.9 ? 'Visited' : 'NoShow'); }
  // حالة نهائية للمواعيد الماضية (لا تُشغّل عاصفة auto-NoShow عند التحميل)
  function pastStatus() { return Math.random() < 0.85 ? 'Visited' : 'NoShow'; }

  // ── مولّدات قيم واقعية ──
  function num(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function bpVal()   { return (110 + Math.floor(Math.random() * 30)) + '/' + (70 + Math.floor(Math.random() * 20)); }
  function vaVal()   { return rnd(['6/6','6/9','6/12','6/18','6/24','6/36']); }
  function refractionVal() { return rnd(['plano','-0.75','-1.25','-2.00','-2.50','-3.25','+0.50','+1.00','+1.75','+2.25']); }
  function recentDate() { var d = new Date(); d.setDate(d.getDate() - Math.floor(Math.random() * 40)); return iso(d); }
  function lmpVal()  { var d = new Date(); d.setDate(d.getDate() - (28 + Math.floor(Math.random() * 230))); return iso(d); }
  function has(s, arr) { s = String(s || ''); for (var i = 0; i < arr.length; i++) if (s.indexOf(arr[i]) !== -1) return true; return false; }

  // تخمين قيمة حقل من تسميته حسب التخصّص (يُستدعى بعد فشل الدور الصريح)
  function labelGuess(lbl, spec) {
    var L = String(lbl || '').toLowerCase();
    // علامات حيوية مشتركة لأي تخصّص
    if (has(lbl, ['وزن'])) return num(3, 90);
    if (has(lbl, ['طول', 'قامة'])) return num(40, 190);
    if (has(lbl, ['ضغط الدم']) || (has(lbl, ['الضغط']) && !has(lbl, ['عين']))) return bpVal();
    if (has(lbl, ['حرارة'])) return (36 + Math.random() * 2.4).toFixed(1);
    if (has(lbl, ['نبض'])) return num(60, 100);
    if (has(lbl, ['سكر', 'غلوكوز'])) return num(80, 180);
    if (has(lbl, ['تشبّع', 'أكسج']) || /spo/.test(L)) return num(94, 100);
    // عيون
    if (spec === 'eye') {
      if (has(lbl, ['حدة', 'إبصار', 'ابصار', 'رؤية', 'بصر']) || /\bva\b/.test(L)) return vaVal();
      if ((has(lbl, ['ضغط']) && has(lbl, ['عين'])) || has(lbl, ['توتر']) || /iop/.test(L)) return num(10, 21);
      if (has(lbl, ['انكسار', 'قياس النظر', 'مقاس', 'تصحيح'])) return refractionVal();
      if (has(lbl, ['قرنية'])) return rnd(['شفافة', 'طبيعية', 'وذمة خفيفة']);
      if (has(lbl, ['شبكية', 'قعر', 'بقعة'])) return rnd(['طبيعية', 'اعتلال خفيف', 'بلا نزوف']);
      if (has(lbl, ['عدسة'])) return rnd(['شفافة', 'بداية إعتام', 'ساد نووي']);
      if (has(lbl, ['ملتحمة'])) return rnd(['هادئة', 'احتقان خفيف']);
      if (has(lbl, ['جفن'])) return rnd(['طبيعي', 'التهاب حفّة خفيف']);
      if (has(lbl, ['حدقة', 'بؤبؤ'])) return rnd(['متفاعلة', 'منتظمة متفاعلة']);
    }
    return undefined;
  }

  // قيمة حقل مخصّص: دور صريح ← تخمين من التسمية/التخصّص ← نوع عام
  function cfVal(f, spec) {
    var role = f.role || '', t = f.type;
    if (t === 'checkbox') return Math.random() < 0.5 ? true : null;
    if (t === 'select') { var o = f.options || []; return o.length ? rnd(o) : null; }
    if (role === 'weight') return num(3, 90);
    if (role === 'height') return num(40, 190);
    if (role === 'hc')     return num(30, 55);
    if (role === 'bp')     return bpVal();
    if (role === 'iop_od' || role === 'iop_os') return num(10, 21);
    if (role === 'va_od'  || role === 'va_os')  return vaVal();
    if (role === 'lmp' && t === 'date') return lmpVal();
    var g = labelGuess(f.label, spec);
    if (g !== undefined && g !== null) return g;
    if (t === 'number') return num(1, 100);
    if (t === 'date')   return recentDate();
    return t === 'textarea' ? rnd(SENTENCES) : rnd(SHORTTEXT);
  }
  function fillCustom(fields, spec) {
    var c = {};
    (fields || []).forEach(function (f) { if (f && f.id) { var v = cfVal(f, spec); if (v !== null && v !== undefined) c[f.id] = v; } });
    return c;
  }

  // مخطّط الأسنان: أحداث لكل سنّ (موجودات + معالجات) خلال آخر ٩٠ يوم
  function dentalEventsFor() {
    var evs = [], m = 2 + Math.floor(Math.random() * 5);   // ٢–٦ أحداث
    for (var i = 0; i < m; i++) {
      var type = Math.random() < 0.55 ? rnd(DC_TREAT) : rnd(DC_FIND);
      evs.push({ ts: Date.now() + i, tooth: rnd(TEETH), type: type, date: daysAgoISO(Math.floor(Math.random() * (SPAN_DAYS + 1))) });
    }
    return evs;
  }
  // دورة تقويم واحدة (نشطة غالباً) مع جلسات شدّ
  function orthoFor() {
    var completed = Math.random() < 0.3;
    var adjs = [], na = 1 + Math.floor(Math.random() * 4);
    for (var i = 0; i < na; i++) adjs.push({ ts: Date.now() + i, date: daysAgoISO(Math.floor(Math.random() * 80)), note: rnd(ADJ_NOTES) });
    adjs.sort(function (a, b) { return a.date.localeCompare(b.date); });
    var o = {
      ts: Date.now(), type: rnd(ORTHO_TYPES),
      startDate: daysAgoISO(60 + Math.floor(Math.random() * 360)),   // بدأ قبل ٢–١٤ شهر
      expectedMonths: 12 + Math.floor(Math.random() * 13),
      notes: '', status: completed ? 'completed' : 'active', adjustments: adjs
    };
    if (completed) o.endDate = daysAgoISO(Math.floor(Math.random() * 25));
    return [o];
  }
  // عملية/عمليتان: منجَزة (تاريخ ماضٍ) أو مجدولة (تاريخ مستقبلي)
  function surgeriesFor() {
    var arr = [], n = 1 + (Math.random() < 0.3 ? 1 : 0);
    for (var i = 0; i < n; i++) {
      var done = Math.random() < 0.7;
      arr.push({
        ts: Date.now() + i, name: rnd(SURGERIES),
        date: done ? daysAgoISO(Math.floor(Math.random() * SPAN_DAYS)) : daysAgoISO(-(1 + Math.floor(Math.random() * 30))),
        note: '', complications: done && Math.random() < 0.35 ? rnd(SURG_COMP) : '',
        status: done ? 'done' : 'scheduled'
      });
    }
    return arr;
  }

  // اختيار k عناصر مميّزة عشوائياً من مصفوفة
  function pickN(arr, k) {
    var a = arr.slice(), out = [];
    for (var i = 0; i < k && a.length; i++) out.push(a.splice(Math.floor(Math.random() * a.length), 1)[0]);
    return out;
  }
  // مريض «هيكل» بلا زيارات — تُضاف زياراته من الجدول لاحقاً
  function newPatientShell(tpl, spec) {
    var name = rnd(FIRST) + (Math.random() < 0.7 ? ' ' + rnd(LAST) : '');
    var phone = '09' + String(Math.floor(Math.random() * 1e8)).padStart(8, '0');
    var by = 1948 + Math.floor(Math.random() * 70);
    var bd = iso(new Date(by, Math.floor(Math.random() * 12), 1 + Math.floor(Math.random() * 28)));
    var doc = {
      name: name, phone: phone, address: '', bloodType: rnd(BLOOD),
      chronicDiseases: Math.random() < 0.28 ? rnd(CHRONIC) : '',
      birthDate: bd, appointments: [], totalVisits: 0,
      custom: fillCustom(tpl.patient, spec),   // حقول المريض المخصّصة حسب التخصّص
      firstVisit: '', lastVisit: '', seedTag: 'devseed'
    };
    // أقسام الأسنان تُملأ فقط لتخصّص الأسنان
    if (spec === 'dental') {
      if (Math.random() < 0.55) doc.dentalEvents = dentalEventsFor();
      if (Math.random() < 0.18) doc.ortho       = orthoFor();
      if (Math.random() < 0.18) doc.surgeries   = surgeriesFor();
    }
    doc.id = genId('seed');   // معرّف ثابت ليُربط بمواعيده (linkedPatientId)
    return { doc: doc, visits: [] };
  }
  // زيارة واحدة بتاريخ/وقت مُعطَيَين — محتواها حسب التخصّص
  function buildVisit(date, slot, tpl, spec) {
    var C = specContent(spec);
    return {
      date: date, slot: slot, visitType: rnd(TYPES),
      complaint: rnd(C.complaints), clinicalExam: rnd(C.exams),
      diagnosis: rnd(C.diags), prescription: rnd(C.rx),
      custom: fillCustom(tpl.visit, spec),     // حقول الزيارة المخصّصة حسب التخصّص
      noteUpdatedAt: Date.now(), source: 'chart'
    };
  }
  // موعد بمجموعة appointments مُشتقّ من زيارة
  function buildApptFrom(pat, v) {
    var isToday = v.date === todayISO;
    return {
      id: genId('appt_seed'),
      PatientName: pat.doc.name, Phone: pat.doc.phone, BirthDate: pat.doc.birthDate, Address: '',
      VisitType: v.visitType, Date: v.date, Slot: v.slot,
      Status: isToday ? wStatus() : pastStatus(),   // الماضي: حالة نهائية (لا auto-NoShow)
      linkedPatientId: pat.doc.id,                  // ربط الموعد بإضبارة المريض (كليك يمين يفتحها)
      source: 'devseed', createdAt: Date.now()
    };
  }

  var fb = null;
  async function seed(cfg, log, prog, done) {
    fb = window._fb;
    // اقرأ الإعدادات مرّة: القالب + التخصّص المختار (تلقائي)
    var tpl = { patient: [], visit: [] }, spec = 'general', specName = '';
    try {
      var s = await fb.getDoc('settings', 'doctor');
      var data = (s && s.exists() && s.data()) || {};
      var ct = data.chartTemplate || {};
      tpl.patient = Array.isArray(ct.patient) ? ct.patient : [];
      tpl.visit   = Array.isArray(ct.visit)   ? ct.visit   : [];
      specName = data.specialty || '';
      spec = detectSpecialty(specName);
      log('التخصّص: «' + (specName || 'عام') + '» → ' + spec + ' · القالب ' + tpl.patient.length + '+' + tpl.visit.length + ' حقل');
    } catch (e) { log('⚠ تعذّر قراءة الإعدادات — محتوى عام'); }

    var days = SPAN_DAYS, perDay = Math.max(1, Math.min(SLOTS.length, cfg.perDay || 6));
    var P = Math.max(1, Math.min(1000, cfg.patients || 180));

    // ١) بِركة مرضى بحقول مخصّصة حسب التخصّص
    var patients = [];
    for (var i = 0; i < P; i++) patients.push(newPatientShell(tpl, spec));

    // ٢) جدول واقعي: perDay مواعيد/يوم عبر آخر days يوم — كل موعد = زيارة لمريض عشوائي
    var apptData = [];
    for (var d = days - 1; d >= 0; d--) {
      var date = daysAgoISO(d);
      var slots = pickN(SLOTS, perDay);
      for (var j = 0; j < slots.length; j++) {
        var pat = patients[Math.floor(Math.random() * patients.length)];
        var v = buildVisit(date, slots[j], tpl, spec);
        pat.visits.push(v);
        apptData.push(buildApptFrom(pat, v));
      }
    }
    // ٣) أنهِ وثائق المرضى (اضمن زيارة لكل مريض، رتّب، احسب الإجماليات)
    var patDocs = [];
    patients.forEach(function (p) {
      if (!p.visits.length) p.visits.push(buildVisit(daysAgoISO(Math.floor(Math.random() * days)), rnd(SLOTS), tpl, spec));
      p.visits.sort(function (a, b) { return a.date.localeCompare(b.date); });
      p.doc.appointments = p.visits;
      p.doc.totalVisits = p.visits.length;
      p.doc.firstVisit = p.visits[0].date;
      p.doc.lastVisit = p.visits[p.visits.length - 1].date;
      patDocs.push(p.doc);
    });

    // ٤) كتابة بدفعات (مرضى ثم مواعيد) مع قاطع الحصّة
    var totalOps = patDocs.length + apptData.length;
    var batch = fb.batch(), ops = 0, writes = 0, err = 0, stopped = false;
    async function flush() { if (!ops) return; await batch.commit(); batch = fb.batch(); ops = 0; }
    async function put(colName, id, docData) {
      if (writes >= WRITE_BUDGET) { stopped = true; return; }
      batch.set(fb.docRef(colName, id), docData); ops++; writes++;
      if (ops >= BATCH_MAX) await flush();
      if (prog && writes % 50 === 0) prog(writes, totalOps);
    }
    try {
      for (var pi = 0; pi < patDocs.length && !stopped; pi++) await put('patients', patDocs[pi].id, patDocs[pi]);
      for (var ai = 0; ai < apptData.length && !stopped; ai++) await put('appointments', apptData[ai].id, apptData[ai]);
      await flush();
    } catch (e) { err++; log('✕ ' + (e.code || e.message)); }

    if (prog) prog(writes, totalOps);
    if (stopped) log('⛔ بلغتَ حدّ اليوم الآمن (' + WRITE_BUDGET + ' كتابة) — أكمل غداً');
    log('✅ ' + patDocs.length + ' مريض · ' + apptData.length + ' موعد (' + perDay + '/يوم × ' + days + ' يوم)');
    done(patDocs.length, apptData.length, writes, err, stopped);
  }
  // حذف مصفوفة مراجع بدفعات ≤BATCH_MAX
  async function delRefs(refs) {
    var batch = fb.batch(), ops = 0, n = 0;
    for (var i = 0; i < refs.length; i++) {
      batch.delete(refs[i]); ops++; n++;
      if (ops >= BATCH_MAX) { await batch.commit(); batch = fb.batch(); ops = 0; }
    }
    if (ops) await batch.commit();
    return n;
  }
  function refsOf(snap) { return snap.docs.map(function (d) { return d.ref; }); }

  async function wipe(log, prog, done) {
    fb = window._fb; var total = 0;
    try {
      // مرضى البذّار
      var ps = await fb.getDocs(fb.query(fb.col('patients'), fb.where('seedTag', '==', 'devseed')));
      total += await delRefs(refsOf(ps)); if (prog) prog('المرضى', total);

      // مواعيد البذّار
      var aSeed = await fb.getDocs(fb.query(fb.col('appointments'), fb.where('source', '==', 'devseed')));
      total += await delRefs(refsOf(aSeed)); if (prog) prog('مواعيد البذّار', total);

      // مواعيد البوت — واجمع apptId لأقفالها
      var aBot = await fb.getDocs(fb.query(fb.col('appointments'), fb.where('source', '==', 'online')));
      var botIds = {};
      aBot.docs.forEach(function (d) { var id = (d.data() || {}).id; if (id) botIds[id] = 1; });
      total += await delRefs(refsOf(aBot)); if (prog) prog('مواعيد البوت', total);

      // أقفال البوت فقط: bookedSlots اللي apptId تبعها ضمن مواعيد البوت المحذوفة
      var bs = await fb.getDocs(fb.col('bookedSlots'));
      var lockRefs = bs.docs.filter(function (d) { return botIds[(d.data() || {}).apptId]; }).map(function (d) { return d.ref; });
      total += await delRefs(lockRefs); if (prog) prog('أقفال البوت', total);

      if (total > 15000) log('⚠ حُذف ' + total + ' — قريب من حدّ ٢٠٬٠٠٠ حذف/يوم');
    } catch (e) { log('✕ ' + (e.code || e.message)); }
    done(total);
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
      + '<div style="display:flex;align-items:center;gap:7px;margin-bottom:4px;flex-wrap:wrap;">'
        + '<label style="font-size:.8rem;font-weight:700;">مرضى</label>'
        + '<input id="dsN" type="number" value="180" min="1" max="1000" style="width:66px;height:36px;border:1.5px solid #e2e8f0;border-radius:9px;text-align:center;font-size:1rem;font-family:inherit;">'
        + '<label style="font-size:.8rem;font-weight:700;">مواعيد/يوم</label>'
        + '<input id="dsPd" type="number" value="6" min="1" max="17" style="width:52px;height:36px;border:1.5px solid #e2e8f0;border-radius:9px;text-align:center;font-size:1rem;font-family:inherit;"></div>'
      + '<div id="dsEst" style="font-size:.72rem;color:#64748b;margin-bottom:10px;"></div>'
      + '<button id="dsGo" style="width:100%;height:42px;border:none;border-radius:10px;background:#0d9488;color:#fff;font-weight:800;font-family:inherit;cursor:pointer;font-size:.88rem;margin-bottom:8px;">بذر مرضى + جدول ٣ أشهر</button>'
      + '<button id="dsWipe" style="width:100%;height:38px;border:1.5px solid #fca5a5;border-radius:10px;background:#fee2e2;color:#dc2626;font-weight:800;font-family:inherit;cursor:pointer;font-size:.82rem;">🧹 امسح بيانات البذّار + البوت</button>'
      + '<div id="dsProg" style="margin-top:10px;font-size:.78rem;font-weight:700;color:#0d9488;min-height:1em;"></div>'
      + '<div id="dsLog" style="margin-top:8px;max-height:130px;overflow-y:auto;font-size:.75rem;line-height:1.7;color:#475569;"></div>';
    document.body.appendChild(box);

    var logEl  = box.querySelector('#dsLog');
    var progEl = box.querySelector('#dsProg');
    var estEl  = box.querySelector('#dsEst');
    var nInput = box.querySelector('#dsN');
    var pdInput = box.querySelector('#dsPd');
    var goBtn  = box.querySelector('#dsGo');
    var wipeBtn = box.querySelector('#dsWipe');
    function log(t) { var d = document.createElement('div'); d.textContent = t; logEl.prepend(d); }
    var fmt = function (x) { return x.toLocaleString('en-US'); };

    // تقدير الكتابات = مرضى + (مواعيد/يوم × ٩٠)
    function refreshEst() {
      var n = Math.max(1, Math.min(1000, +nInput.value || 0));
      var pd = Math.max(1, Math.min(17, +pdInput.value || 6));
      var appts = pd * 90, est = n + appts;
      estEl.innerHTML = '≈ ' + fmt(est) + ' كتابة · ' + fmt(appts) + ' موعد (' + pd + '/يوم × ٩٠)'
        + (est > WRITE_BUDGET ? ' <span style="color:#dc2626;font-weight:700;">— يتوقّف عند ' + fmt(WRITE_BUDGET) + '</span>' : '');
    }
    nInput.oninput = refreshEst; pdInput.oninput = refreshEst; refreshEst();

    box.querySelector('#dsX').onclick = function () { box.remove(); };
    goBtn.onclick = function () {
      var n = Math.max(1, Math.min(1000, +nInput.value || 180));
      var pd = Math.max(1, Math.min(17, +pdInput.value || 6));
      goBtn.disabled = true; wipeBtn.disabled = true; goBtn.textContent = 'جارٍ البذر…';
      var prog = function (writes, total) { progEl.textContent = Math.round(writes / (total || 1) * 100) + '٪ · ' + fmt(writes) + '/' + fmt(total) + ' كتابة'; };
      seed({ patients: n, perDay: pd }, log, prog, function (patC, apptC, writes, err, stopped) {
        goBtn.disabled = false; wipeBtn.disabled = false; goBtn.textContent = 'بذر مرضى + جدول ٣ أشهر';
        progEl.textContent = (stopped ? '⛔ توقّف: ' : '✅ تمّ: ') + fmt(patC) + ' مريض · ' + fmt(apptC) + ' موعد' + (err ? ' · ' + err + ' ✕' : '');
        log('— حدّث الصفحة (F5) إن لم تظهر البيانات فوراً');
      });
    };
    wipeBtn.onclick = function () {
      if (!confirm('بداية نظيفة: حذف كل بيانات البذّار + مواعيد البوت وأقفالها؟')) return;
      wipeBtn.disabled = true; goBtn.disabled = true; wipeBtn.textContent = 'جارٍ الحذف…';
      var prog = function (label, count) { progEl.textContent = '🧹 ' + label + '… · ' + fmt(count) + ' محذوف'; };
      wipe(log, prog, function (del) {
        wipeBtn.disabled = false; goBtn.disabled = false; wipeBtn.textContent = '🧹 امسح بيانات البذّار + البوت';
        progEl.textContent = '✅ حُذف ' + fmt(del) + ' مستنداً — بداية نظيفة';
      });
    };
  }
})();
