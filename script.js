function toggleMenu(button) {
    const submenu = button.nextElementSibling;
    const chevron = button.querySelector('.chevron');
    submenu.classList.toggle('hidden');
    chevron.textContent = submenu.classList.contains('hidden') ? '▸' : '▾';
}

function showContent(id) {
    document.querySelectorAll('main section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
    if (id === 'obraz-wektor') initPictureVector();
}

function initPixelDemo() {
    const originalCanvas = document.getElementById('original');
    const resultCanvas = document.getElementById('result');
    const octx = originalCanvas.getContext('2d');
    const rctx = resultCanvas.getContext('2d');
    const SIZE = 256;

    const scaleSlider = document.getElementById('scaleSlider');
    const scaleValue = document.getElementById('scaleValue');
    const origStat = document.getElementById('origStat');
    const resStat = document.getElementById('resStat');
    const btnSmooth = document.getElementById('btnSmooth');
    const btnNearest = document.getElementById('btnNearest');
    const fileInput = document.getElementById('fileInput');
    const btnReset = document.getElementById('btnReset');

    let mode = 'smooth';
    let sourceImage = null;

    const work = document.createElement('canvas');
    const wctx = work.getContext('2d');

    function drawDefaultArt(ctx){
      // colorful, detail-rich procedural scene so pixelation is visible
      ctx.clearRect(0,0,SIZE,SIZE);
      // sky gradient
      const g = ctx.createLinearGradient(0,0,0,SIZE);
      g.addColorStop(0,'#1b1035');
      g.addColorStop(1,'#3a1750');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,SIZE,SIZE);

      // sun
      const sun = ctx.createRadialGradient(190,60,4,190,60,46);
      sun.addColorStop(0,'#fff7c2');
      sun.addColorStop(0.5,'#ffd23d');
      sun.addColorStop(1,'rgba(255,210,61,0)');
      ctx.fillStyle = sun;
      ctx.beginPath(); ctx.arc(190,60,46,0,Math.PI*2); ctx.fill();

      // mountains (sharp triangular edges = shows aliasing well)
      ctx.fillStyle = '#4d2e73';
      ctx.beginPath();
      ctx.moveTo(0,180); ctx.lineTo(60,100); ctx.lineTo(110,160); ctx.lineTo(160,90);
      ctx.lineTo(210,150); ctx.lineTo(256,120); ctx.lineTo(256,256); ctx.lineTo(0,256); ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.moveTo(0,210); ctx.lineTo(50,160); ctx.lineTo(90,200); ctx.lineTo(150,150);
      ctx.lineTo(200,205); ctx.lineTo(256,175); ctx.lineTo(256,256); ctx.lineTo(0,256); ctx.closePath();
      ctx.fill();

      // fine grid pattern strip (great for showing loss of detail)
      for(let i=0;i<16;i++){
        ctx.fillStyle = i % 2 === 0 ? '#c6ff3d' : '#5eeaf0';
        ctx.fillRect(i*16, 226, 16, 30);
      }

      // thin text-like lines to show sharp detail
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      for(let i=0;i<6;i++){
        ctx.beginPath();
        ctx.moveTo(20, 20 + i*6);
        ctx.lineTo(90, 20 + i*6);
        ctx.stroke();
      }

      // small circles cluster (fine detail)
      for(let i=0;i<10;i++){
        ctx.fillStyle = `hsl(${i*36},90%,65%)`;
        ctx.beginPath();
        ctx.arc(150 + (i%5)*12, 20 + Math.floor(i/5)*12, 4,0,Math.PI*2);
        ctx.fill();
      }
    }

    function setSourceFromDefault(){
      work.width = SIZE; work.height = SIZE;
      drawDefaultArt(wctx);
      sourceImage = work;
      octx.imageSmoothingEnabled = true;
      octx.clearRect(0,0,SIZE,SIZE);
      octx.drawImage(work,0,0,SIZE,SIZE);
      origStat.textContent = SIZE + ' × ' + SIZE + ' px';
      render();
    }

    function setSourceFromImage(img){
      work.width = SIZE; work.height = SIZE;
      wctx.clearRect(0,0,SIZE,SIZE);
      // cover-fit crop into square
      const ratio = Math.max(SIZE/img.width, SIZE/img.height);
      const w = img.width*ratio, h = img.height*ratio;
      wctx.drawImage(img, (SIZE-w)/2, (SIZE-h)/2, w, h);
      sourceImage = work;
      octx.clearRect(0,0,SIZE,SIZE);
      octx.imageSmoothingEnabled = true;
      octx.drawImage(work,0,0,SIZE,SIZE);
      origStat.textContent = SIZE + ' × ' + SIZE + ' px (przycięte)';
      render();
    }

    function render(){
      const pct = parseInt(scaleSlider.value,10);
      scaleValue.textContent = pct + '%';
      const smallSize = Math.max(1, Math.round(SIZE * pct/100));

      // step 1: shrink to a tiny canvas
      const tiny = document.createElement('canvas');
      tiny.width = smallSize; tiny.height = smallSize;
      const tctx = tiny.getContext('2d');
      tctx.imageSmoothingEnabled = (mode === 'smooth');
      if(mode === 'smooth') tctx.imageSmoothingQuality = 'high';
      tctx.drawImage(sourceImage, 0,0, smallSize, smallSize);

      // step 2: blow back up to full size
      rctx.imageSmoothingEnabled = (mode === 'smooth');
      if(mode === 'smooth') rctx.imageSmoothingQuality = 'high';
      rctx.clearRect(0,0,SIZE,SIZE);
      rctx.drawImage(tiny, 0,0, SIZE, SIZE);

      resStat.textContent = smallSize + ' × ' + smallSize + ' px → rozciągnięte do ' + SIZE + '×' + SIZE;
    }

    scaleSlider.addEventListener('input', render);

    btnSmooth.addEventListener('click', ()=>{
      mode='smooth'; btnSmooth.classList.add('active'); btnNearest.classList.remove('active'); render();
    });
    btnNearest.addEventListener('click', ()=>{
      mode='nearest'; btnNearest.classList.add('active'); btnSmooth.classList.remove('active'); render();
    });

    fileInput.addEventListener('change', (e)=>{
      const file = e.target.files[0];
      if(!file) return;
      const img = new Image();
      img.onload = ()=> setSourceFromImage(img);
      img.src = URL.createObjectURL(file);
    });

    btnReset.addEventListener('click', ()=>{
      scaleSlider.value = 100;
      setSourceFromDefault();
    });

    setSourceFromDefault();
  }


  function initPictureVector() {
    const pixels = [
      0, 0,16,14, 1, 0, 0, 0,
      0, 0,12,16,14, 0, 0, 0,
      0, 0, 0, 1,16, 6, 0, 0,
      0, 0, 4,14,16, 9, 0, 0,
      0, 0, 0, 0,13,16, 2, 0,
      0, 0, 0, 0, 4,16, 5, 0,
      0, 0, 5,11,16,16, 4, 0,
      0, 0, 5,13,16, 5, 0, 0
    ];
  
    function bgColor(v) {
      if (v === 0) return '#e8e8e8';
      const t = v / 16;
      const stops = [
        [230,240,250],[180,210,240],[120,170,225],[60,120,200],[20,70,160],[10,40,120]
      ];
      const idx = Math.min(Math.floor(t * (stops.length - 1)), stops.length - 2);
      const frac = t * (stops.length - 1) - idx;
      const [r1,g1,b1] = stops[idx], [r2,g2,b2] = stops[idx+1];
      const r = Math.round(r1 + (r2-r1)*frac);
      const g = Math.round(g1 + (g2-g1)*frac);
      const b = Math.round(b1 + (b2-b1)*frac);
      return `rgb(${r},${g},${b})`;
    }
  
    function textColor(v) {
      return v > 9 ? '#fff' : (v > 4 ? '#1a3a6e' : '#555');
    }
  
    function highlight(i) {
      document.querySelectorAll('.cell, .vec-cell')
        .forEach(el => el.classList.remove('highlighted'));
    
      const c = document.getElementById('c' + i);
      const v = document.getElementById('v' + i);
      if (c) c.classList.add('highlighted');
      if (v) {
        v.classList.add('highlighted');
        v.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    
      const row = Math.floor(i / 8);
      const col = i % 8;
      const val = pixels[i];
      document.getElementById('obraz-wektor').innerHTML =
        `Piksel <strong>[${row}, ${col}]</strong> &rarr; indeks wektora <strong>${i}</strong>
         &nbsp;|&nbsp; Wartość: <strong>${val}</strong> / 16
         &nbsp;|&nbsp; Intensywność: <strong>${Math.round(val / 16 * 100)}%</strong>
         &nbsp;|&nbsp; Formuła: <strong>${row} &times; 8 + ${col} = ${i}</strong>`;
    }
  
    // Buduj siatkę 8x8
    const grid = document.getElementById('grid');
    pixels.forEach((v, i) => {
      const d = document.createElement('div');
      d.className = 'cell';
      d.id = 'c' + i;
      d.style.background = bgColor(v);
      d.style.color = textColor(v);
      d.innerHTML = `<span class="cell-index">${i}</span>${v}`;
      d.addEventListener('click', () => highlight(i));
      grid.appendChild(d);
    });

    // Buduj wektor
    const vec = document.getElementById('vector');
    pixels.forEach((v, i) => {
      const d = document.createElement('div');
      d.className = 'vec-cell';
      d.id = 'v' + i;
      d.style.background = bgColor(v);
      d.style.color = textColor(v);
      d.innerHTML = `${v}<span class="vec-idx">[${i}]</span>`;
      d.addEventListener('click', () => highlight(i));
      vec.appendChild(d);
    });
  }