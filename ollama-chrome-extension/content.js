
console.log("content.js loaded");

function runOnStart() {

  console.log("DOMContentLoaded");

  let canvas = document.createElement('canvas');

  let loader_url = chrome.runtime.getURL('images/loader.gif')
  let css_url = ""

  let img_loader = document.createElement('img')
  img_loader.src = loader_url
  img_loader.zIndex = 1000101
  img_loader.style.opacity = 1
  
  let btn_generate = document.createElement('div')
  btn_generate.className = 'btn_generate'
  btn_generate.innerHTML = ' Generate '
  btn_generate.style.position = 'fixed'
  btn_generate.style.zIndex = 10000
  btn_generate.style.border = '1px solid black'
  btn_generate.style.display = 'inline-block'
  btn_generate.style.cursor = 'pointer'
  btn_generate.style.paddingTop = '5px'
  btn_generate.style.paddingBottom = '5px'
  btn_generate.style.paddingLeft = '10px'
  btn_generate.style.paddingRight = '10px'
  btn_generate.style.borderRadius = '25px'
  btn_generate.style.backgroundColor = '#008CBA'
  btn_generate.style.display = 'inline-block'
  btn_generate.style.color = 'white'

  btn_generate.addEventListener('click', (event) => {
    
    removeChildIfExistsInBody(selectionLayer);
    removeChildIfExistsInBody(rootLayer);
    removeChildIfExistsInBody(btn_generate);
    appendChildIfNotExistsInBody(resultsLayer);

    fetch("http://127.0.0.1:8000/api/v1/interact/llava", {
      method: "POST",
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        input_text: canvas.toDataURL()
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    })
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        resultsLayer.innerHTML = JSON.stringify(json);
      });
  });

  let link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = `${css_url}`;

  let rootLayer = document.createElement('div');
  rootLayer.className = 'rootLayer'
  rootLayer.style.border = '1px dashed #000';
  rootLayer.style.position = 'fixed';
  rootLayer.style.zIndex = '10000';
  rootLayer.style.left = `${0}px`;
  rootLayer.style.top = `${0}px`;
  rootLayer.style.backgroundColor = 'grey'
  rootLayer.style.opacity = 0
  rootLayer.style.cursor = 'crosshair'
  rootLayer.style.width = `${self.innerWidth - 3}px`;
  rootLayer.style.height = `${self.innerHeight - 3}px`;

  let resultsLayer = document.createElement('div');
  resultsLayer.style.border = '1px dashed #000';
  resultsLayer.style.position = 'fixed';
  resultsLayer.style.zIndex = '10009';
  resultsLayer.style.left = `${0}px`;
  resultsLayer.style.top = `${0}px`;
  resultsLayer.style.backgroundColor = 'white'
  // resultsLayer.style.opacity = 0.7
  resultsLayer.style.fontSize = "14px;"
  resultsLayer.style.width = `${self.innerWidth - 3}px`;
  resultsLayer.style.height = `${self.innerHeight - 3}px`;
  resultsLayer.style.textAlign = 'center';
  resultsLayer.style.verticalAlign = 'middle';
  resultsLayer.style.display = 'flex';
  resultsLayer.style.justifyContent = 'center';
  resultsLayer.style.alignItems = 'center';

  resultsLayer.appendChild(img_loader);

  let startX, startY, endX, endY;
  let isDrawing = false;

  let selectionLayer = document.createElement('div');
  selectionLayer.style.border = '1px dashed red';
  selectionLayer.style.position = 'fixed';
  selectionLayer.style.zIndex = '10000';
  selectionLayer.style.backgroundColor = 'white'
  selectionLayer.style.opacity = 0.1
  selectionLayer.style.borderRadius = '10px'
  selectionLayer.style.display = 'inline-block'

  document.head.appendChild(link);


  appendChildIfNotExistsInBody(rootLayer);

  rootLayer.addEventListener('mousedown', (event) => {
    startX = event.clientX;
    startY = event.clientY;
    isDrawing = true;
    selectionLayer.style.left = `${startX}px`;
    selectionLayer.style.top = `${startY}px`;
    appendChildIfNotExistsInBody(selectionLayer);
    return true;
  });

  rootLayer.addEventListener('mousemove', (event) => {
    if (!isDrawing) return;
    endX = event.clientX;
    endY = event.clientY;
    selectionLayer.style.width = `${Math.abs(endX - startX)}px`;
    selectionLayer.style.height = `${Math.abs(endY - startY)}px`;
    selectionLayer.style.left = `${Math.min(endX, startX)}px`;
    selectionLayer.style.top = `${Math.min(endY, startY)}px`;
    return true;
  });

  document.addEventListener('mouseup', (event) => {
    if (!isDrawing) return;
    isDrawing = false;
    btn_generate.style.left = `${event.clientX}px`
    btn_generate.style.top = `${event.clientY}px`
    appendChildIfNotExistsInBody(btn_generate);
    chrome.runtime.sendMessage({ action: 'capture' }, (response) => {
      const { screenshotUrl } = response;
      const img = new Image();
      img.src = screenshotUrl;
      img.onload = () => {
        const ctx = canvas.getContext('2d');
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, Math.min(endX, startX) * 2, Math.min(endY, startY) * 2, width * 2, height * 2, 0, 0, width, height);
      };
    });
    return true;
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      removeChildIfExistsInBody(selectionLayer);
      removeChildIfExistsInBody(rootLayer);
      removeChildIfExistsInBody(btn_generate);
      removeChildIfExistsInBody(resultsLayer);
    }
  });

}
function removeChildIfExistsInBody(ele){
  if(document.body.contains(ele)){
    document.body.removeChild(ele);
  }
}

function appendChildIfNotExistsInBody(ele){
  if(false === document.body.contains(ele)){
    document.body.appendChild(ele);
  }
}

if (document.readyState !== 'loading') {
  runOnStart();
}
else {
  document.addEventListener('DOMContentLoaded', function () {
    runOnStart()
  });
}