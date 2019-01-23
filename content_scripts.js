function addNote(note, div, itemid, pos) {
  var span = document.createElement('span');
  var icon = document.createElement('i'); 
  icon.innerHTML = '&times;';
  icon.setAttribute('class', 'rentCloseIcon');
  icon.onclick = (e) => {  
    chrome.storage.local.get(itemid, (result) => {
      var index = result[itemid].indexOf(note);
      if (index !== -1) result[itemid].splice(index, 1);
      chrome.storage.local.set(result, () => { });
      div.removeChild(span);
    });
  }
  span.textContent = note;
  span.setAttribute('class', 'rentNote');
  div.appendChild(span);
  span.appendChild(icon);
}

function saveNote(itemid, noteInput, noteDiv) {
  if (noteInput.value === '') return;
  chrome.storage.local.get([itemid], (result) => {
    if (result[itemid] === undefined) {
      result[itemid] = [noteInput.value];
    } else {
      result[itemid].push(noteInput.value);
    }
    addNote(noteInput.value, noteDiv, itemid);
    chrome.storage.local.set(result, () => {
      console.log('save ' + itemid + ' with value ' + JSON.stringify(result));
      noteInput.value = '';
    });
  });
}

function updateList(event) {
  if (event.relatedNode.id === 'content' && event.srcElement.childNodes.length) {
    var itemid = event.srcElement.childNodes[1].childNodes[1].attributes['data-bind'].value;
    var parentElement = event.srcElement.childNodes[3];
    var inputDiv = document.createElement('div');
    var noteDiv = document.createElement('div');
    var noteInput = document.createElement('input');
    var saveBtn = document.createElement('button');

    chrome.storage.local.get(itemid, (result) => {
      if (result[itemid] !== undefined) {
        result[itemid].forEach((note, i) => { addNote(note, noteDiv, itemid, i); });
      }
    });

    inputDiv.setAttribute('class', 'rentInputDiv');
    inputDiv.setAttribute('style', 'display: inline-block;');
    inputDiv.onclick = (e) => { e.stopPropagation(); }

    noteInput.id = 'extension-noteInputut-' + itemid;
    noteInput.setAttribute('class', 'rentInputElement');
    noteInput.setAttribute('type', 'text');
    noteInput.placeholder = '加入筆記...';
    noteInput.onclick = (e) => { e.stopPropagation(); }
    noteInput.addEventListener('keypress', (e) => {
      // Prevent open the item in a new page.
      e.stopPropagation();
      if (e.keyCode === 13) {
        if (noteInput.value === '') return;
        saveNote(itemid, noteInput, noteDiv);
      }
    });

    noteDiv.setAttribute('style', 'display: inline-block;');
    noteDiv.onclick = (e) => { e.stopPropagation(); }

    parentElement.appendChild(noteInput);
    saveBtn.setAttribute('class', 'rentInputElement');
    saveBtn.onclick = (e) => {
      // Prevent open the item in a new page.
      e.stopPropagation();
      if (noteInput.value === '') return;
      saveNote(itemid, noteInput, noteDiv);
    }
    saveBtn.innerHTML = '確定';
    inputDiv.appendChild(noteInput);
    inputDiv.appendChild(saveBtn);
    parentElement.appendChild(inputDiv);
    parentElement.appendChild(noteDiv);
  }
}

document.addEventListener('DOMNodeInserted', updateList);
