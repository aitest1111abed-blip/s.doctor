/* ============================================================================
   🌊 خلفية متحرّكة (WebGL) بدل صورة bg-pattern.webp الثابتة — تجريبية.
   للتراجع فوراً: احذف سطر <script src="bg-gradient.js"> من app.html — كل شي
   بيرجع تلقائياً للصورة الأصلية (الـCSS بالأصل ما تغيّر، بس بينحجب وقت تنجح
   هاي الخلفية بالتشغيل).
   ============================================================================ */
(function () {
  // ألوان DocBook (كريمي دافئ → تركوازي فاتح → تركوازي العلامة) — حركة بطيئة وهادئة تناسب تطبيق طبي
  var CONFIG = {
    color1: '#f7f3e8',
    color2: '#d7f5ef',
    color3: '#99ede0',
    rotation: 20,
    proportion: 40,
    scale: 0.5,
    speed: 6,
    distortion: 3,
    swirl: 10,
    swirlIterations: 4,
    softness: 100,
    offset: 0,
    shape: 'Edge', // Checks:0  Stripes:1  Edge:2
    shapeSize: 5,
  };
  var SHAPES = { Checks: 0, Stripes: 1, Edge: 2 };

  var VERTEX_SRC = '#version 300 es\nin vec4 a_position;\nvoid main(){ gl_Position = a_position; }';

  var FRAGMENT_SRC = '#version 300 es\n' +
    'precision highp float;\n' +
    'uniform float u_time; uniform float u_pixelRatio; uniform vec2 u_resolution;\n' +
    'uniform float u_scale; uniform float u_rotation;\n' +
    'uniform vec4 u_color1; uniform vec4 u_color2; uniform vec4 u_color3;\n' +
    'uniform float u_proportion; uniform float u_softness; uniform float u_shape; uniform float u_shapeScale;\n' +
    'uniform float u_distortion; uniform float u_swirl; uniform float u_swirlIterations;\n' +
    'out vec4 fragColor;\n' +
    '#define TWO_PI 6.28318530718\n#define PI 3.14159265358979323846\n' +
    'vec2 rotate(vec2 uv, float th){ return mat2(cos(th),sin(th),-sin(th),cos(th)) * uv; }\n' +
    'float random(vec2 st){ return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }\n' +
    'float noise(vec2 st){ vec2 i=floor(st); vec2 f=fract(st); float a=random(i); float b=random(i+vec2(1.,0.)); float c=random(i+vec2(0.,1.)); float d=random(i+vec2(1.,1.)); vec2 u=f*f*(3.-2.*f); float x1=mix(a,b,u.x); float x2=mix(c,d,u.x); return mix(x1,x2,u.y); }\n' +
    'vec4 blend_colors(vec4 c1, vec4 c2, vec4 c3, float mixer, float edgesWidth, float edge_blur){\n' +
    '  vec3 color1=c1.rgb*c1.a; vec3 color2=c2.rgb*c2.a; vec3 color3=c3.rgb*c3.a;\n' +
    '  float r1=smoothstep(.0+.35*edgesWidth, .7-.35*edgesWidth+.5*edge_blur, mixer);\n' +
    '  float r2=smoothstep(.3+.35*edgesWidth, 1.-.35*edgesWidth+edge_blur, mixer);\n' +
    '  vec3 blended2=mix(color1,color2,r1); float o2=mix(c1.a,c2.a,r1);\n' +
    '  vec3 c=mix(blended2,color3,r2); float o=mix(o2,c3.a,r2); return vec4(c,o);\n' +
    '}\n' +
    'void main(){\n' +
    '  vec2 uv = gl_FragCoord.xy / u_resolution.xy;\n' +
    '  float t = .5 * u_time;\n' +
    '  float noise_scale = .0005 + .006 * u_scale;\n' +
    '  uv -= .5; uv *= (noise_scale * u_resolution); uv = rotate(uv, u_rotation * .5 * PI); uv /= u_pixelRatio; uv += .5;\n' +
    '  float n1 = noise(uv*1. + t); float n2 = noise(uv*2. - t);\n' +
    '  float angle = n1 * TWO_PI;\n' +
    '  uv.x += 4.*u_distortion*n2*cos(angle); uv.y += 4.*u_distortion*n2*sin(angle);\n' +
    '  float iterations_number = ceil(clamp(u_swirlIterations, 1., 30.));\n' +
    '  for (float i=1.; i<=iterations_number; i++){\n' +
    '    uv.x += clamp(u_swirl,0.,2.)/i * cos(t + i*1.5*uv.y);\n' +
    '    uv.y += clamp(u_swirl,0.,2.)/i * cos(t + i*1.*uv.x);\n' +
    '  }\n' +
    '  float proportion = clamp(u_proportion, 0., 1.);\n' +
    '  float shape = 0.; float mixer = 0.;\n' +
    '  if (u_shape < .5) {\n' +
    '    vec2 su = uv * (.5 + 3.5*u_shapeScale); shape = .5 + .5*sin(su.x)*cos(su.y);\n' +
    '    mixer = shape + .48*sign(proportion-.5)*pow(abs(proportion-.5), .5);\n' +
    '  } else if (u_shape < 1.5) {\n' +
    '    vec2 su = uv * (.25 + 3.*u_shapeScale); float f = fract(su.y);\n' +
    '    shape = smoothstep(.0,.55,f) * smoothstep(1.,.45,f);\n' +
    '    mixer = shape + .48*sign(proportion-.5)*pow(abs(proportion-.5), .5);\n' +
    '  } else {\n' +
    '    float sh = 1. - uv.y; sh -= .5; sh /= (noise_scale * u_resolution.y); sh += .5;\n' +
    '    float shape_scaling = .2 * (1. - u_shapeScale);\n' +
    '    shape = smoothstep(.45-shape_scaling, .55+shape_scaling, sh + .3*(proportion-.5));\n' +
    '    mixer = shape;\n' +
    '  }\n' +
    '  vec4 color_mix = blend_colors(u_color1, u_color2, u_color3, mixer, 1.-clamp(u_softness,0.,1.), .01+.01*u_scale);\n' +
    '  fragColor = vec4(color_mix.rgb, color_mix.a);\n' +
    '}\n';

  function hexToRgba(hex) {
    var c = hex.replace('#', '');
    var r = 0, g = 0, b = 0, a = 1;
    if (c.length >= 6) {
      r = parseInt(c.slice(0, 2), 16) / 255;
      g = parseInt(c.slice(2, 4), 16) / 255;
      b = parseInt(c.slice(4, 6), 16) / 255;
      if (c.length === 8) a = parseInt(c.slice(6, 8), 16) / 255;
    }
    return [r, g, b, a];
  }

  function compile(gl, type, src) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('[bg-gradient] shader compile error:', gl.getShaderInfoLog(sh));
      return null;
    }
    return sh;
  }

  function start() {
    if (document.body.classList.contains('theme-dark')) return; // بلا خلفية زخرفية بالوضع الليلي (نفس سلوك الصورة الأصلية)
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // احترام تفضيل تقليل الحركة

    var canvas = document.createElement('canvas');
    canvas.id = 'bgGradientCanvas';
    document.body.insertBefore(canvas, document.body.firstChild);

    var gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: true });
    if (!gl) { canvas.remove(); return; } // متصفح قديم بلا WebGL2 ⇒ تُترك الصورة الأصلية بمكانها

    var vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SRC);
    var fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
    if (!vs || !fs) { canvas.remove(); return; }

    var program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { canvas.remove(); return; }
    gl.useProgram(program);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    var posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    var U = {};
    ['u_time', 'u_resolution', 'u_pixelRatio', 'u_scale', 'u_rotation', 'u_color1', 'u_color2', 'u_color3',
      'u_proportion', 'u_softness', 'u_shape', 'u_shapeScale', 'u_distortion', 'u_swirl', 'u_swirlIterations']
      .forEach(function (n) { U[n] = gl.getUniformLocation(program, n); });

    function resize() {
      var pr = window.devicePixelRatio || 1;
      var w = window.innerWidth, h = window.innerHeight;
      canvas.width = w * pr; canvas.height = h * pr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    var c1 = hexToRgba(CONFIG.color1), c2 = hexToRgba(CONFIG.color2), c3 = hexToRgba(CONFIG.color3);
    var startTime = performance.now();
    var rafId = null;
    var running = true;

    function frame(time) {
      if (!running) return;
      var elapsed = (time - startTime) / 1000;
      var speed = (CONFIG.speed / 100) * 5;
      gl.uniform1f(U.u_time, elapsed * speed + CONFIG.offset * 0.01);
      gl.uniform2f(U.u_resolution, canvas.width, canvas.height);
      gl.uniform1f(U.u_pixelRatio, window.devicePixelRatio || 1);
      gl.uniform1f(U.u_scale, CONFIG.scale);
      gl.uniform1f(U.u_rotation, (CONFIG.rotation * Math.PI) / 180);
      gl.uniform4f(U.u_color1, c1[0], c1[1], c1[2], c1[3]);
      gl.uniform4f(U.u_color2, c2[0], c2[1], c2[2], c2[3]);
      gl.uniform4f(U.u_color3, c3[0], c3[1], c3[2], c3[3]);
      gl.uniform1f(U.u_proportion, CONFIG.proportion / 100);
      gl.uniform1f(U.u_softness, CONFIG.softness / 100);
      gl.uniform1f(U.u_shape, SHAPES[CONFIG.shape]);
      gl.uniform1f(U.u_shapeScale, CONFIG.shapeSize / 100);
      gl.uniform1f(U.u_distortion, CONFIG.distortion / 50);
      gl.uniform1f(U.u_swirl, CONFIG.swirl / 100);
      gl.uniform1f(U.u_swirlIterations, CONFIG.swirl === 0 ? 0 : CONFIG.swirlIterations);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(frame);
    }
    rafId = requestAnimationFrame(frame);

    // خُلاصة نجاح التشغيل: نفعّل صنف يخفي صورة bg-pattern.webp الثابتة عبر CSS
    document.body.classList.add('bg-animated-active');

    // نطاق الوضع الليلي: نوقف الرندر ونخفي الكانفاس (الصورة الأصلية أصلاً مخفيّة بالوضع الليلي فما في تعارض)
    var mo = new MutationObserver(function () {
      var dark = document.body.classList.contains('theme-dark');
      canvas.style.display = dark ? 'none' : '';
      if (dark && running) { running = false; if (rafId) cancelAnimationFrame(rafId); }
      else if (!dark && !running) { running = true; rafId = requestAnimationFrame(frame); }
    });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
