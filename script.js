(function(){
  const navList = document.getElementById('navList');
  const navItems = Array.from(navList.querySelectorAll('.nav-item'));
  const navViewport = document.getElementById('navViewport');
  const sectionsViewport = document.getElementById('sectionsViewport');
  const total = navItems.length;
  let index = 0;
  let isAnimating = false;

  function updateUI(){
    // Move sections
    sectionsViewport.style.transform = `translateY(${ -index * 100 }vh)`;
    // Move nav list to keep active centered in the small nav viewport area (each item ~67px tall incl margin)
    const itemHeight = 67; // estimate (css: 55px + margins)
    const offset = (navViewport.clientHeight - itemHeight) / 2;
    const translateY = -index * itemHeight + offset;
    navList.style.transform = `translateY(${translateY}px)`;

    navItems.forEach((it,i)=>{
      it.classList.toggle('active', i===index);
    });
  }

  function setIndex(newIndex){
    if(isAnimating || newIndex === index) return;
    if(newIndex < 0) newIndex = 0;
    if(newIndex >= total) newIndex = total - 1;
    index = newIndex;
    isAnimating = true;
    updateUI();
    setTimeout(()=> isAnimating = false, 750);
  }

  // click nav items
  navItems.forEach(it=>{
    it.addEventListener('click', ()=>{
      const idx = Number(it.dataset.index);
      setIndex(idx);
    });
  });

  // wheel support on nav: scroll nav to change index
  let wheelCooldown = false;
  navViewport.addEventListener('wheel', (e)=>{
    e.preventDefault();
    if(wheelCooldown) return;
    if(e.deltaY > 0) setIndex(index+1);
    else setIndex(index-1);
    wheelCooldown = true;
    setTimeout(()=> wheelCooldown=false, 250);
  }, {passive:false});

  // also allow wheel on content area
  document.addEventListener('wheel', (e)=>{
    if(wheelCooldown) return;
    if(e.deltaY > 0) setIndex(index+1);
    else setIndex(index-1);
    wheelCooldown = true;
    setTimeout(()=> wheelCooldown=false, 250);
  }, {passive:true});

  // keyboard
  document.addEventListener('keydown', (e)=>{
    if(['ArrowDown','PageDown'].includes(e.code)) { setIndex(index+1); }
    if(['ArrowUp','PageUp'].includes(e.code)) { setIndex(index-1); }
  });

  // touch support for sections (vertical swipe)
  let startY = null;
  document.addEventListener('touchstart', (ev)=>{
    startY = ev.touches[0].clientY;
  });
  document.addEventListener('touchend', (ev)=>{
    if(startY === null) return;
    const endY = ev.changedTouches[0].clientY;
    const diff = startY - endY;
    if(Math.abs(diff) > 40){
      if(diff > 0) setIndex(index+1); else setIndex(index-1);
    }
    startY = null;
  });

  // init
  updateUI();
  window.addEventListener('resize', updateUI);

  // --- inline .card-detail behavior: make cards keyboard/touch friendly ---
  (function cardDetailWire(){
    function wire(){
      const cards = Array.from(document.querySelectorAll('.card'));
      cards.forEach(card => {
        if(!card.hasAttribute('tabindex')) card.setAttribute('tabindex','0');

        // touch: toggle open state on tap; close automatically after a short delay
        let touchTimer = null;
        card.addEventListener('touchstart', (ev)=>{
          // toggle open
          if(card.classList.contains('open')){
            card.classList.remove('open');
            clearTimeout(touchTimer);
          } else {
            card.classList.add('open');
            clearTimeout(touchTimer);
            touchTimer = setTimeout(()=> card.classList.remove('open'), 1600);
          }
        }, {passive:true});

        // keyboard: Enter or Space toggles the detail panel
        card.addEventListener('keydown', (ev)=>{
          if(ev.code === 'Enter' || ev.code === 'Space'){
            ev.preventDefault();
            card.classList.toggle('open');
          }
        });
      });
    }

    wire();
    const obs = new MutationObserver(wire);
    obs.observe(document.body, {childList:true, subtree:true});
  })();
})();