function toggleMenu(button) {
    const submenu = button.nextElementSibling;
    const chevron = button.querySelector('.chevron');
    submenu.classList.toggle('hidden');
    chevron.textContent = submenu.classList.contains('hidden') ? '▸' : '▾';
}

function showContent(id) {
    document.querySelectorAll('main section').forEach(sec => sec.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
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

    // offscreen working canvas
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