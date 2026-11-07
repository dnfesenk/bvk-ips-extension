(async () => {
  const status = document.getElementById('status');
  try {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    const url = new URL(tab?.url || 'about:blank');
    if (!/^https?:$/.test(url.protocol) || url.hostname !== 'vlasovi.bvk.rs' || !url.pathname.endsWith('/virman.r')) {
      status.textContent = 'Open a BVK payment slip and click the extension icon.';
      return;
    }
    await chrome.scripting.executeScript({target: {tabId: tab.id}, files: ['extract.js']});
    const [result] = await chrome.scripting.executeScript({
      target: {tabId: tab.id},
      func: () => globalThis.BvkExtract.read(document)
    });
    const payload = BvkPayment.payload(result.result);
    const qr = qrcode(0, 'M');
    qr.addData(payload, 'Byte');
    qr.make();
    document.getElementById('qr').innerHTML = qr.createSvgTag({cellSize: 5, margin: 20, scalable: true});
    document.getElementById('caption').hidden = false;
    status.hidden = true;
  } catch {
    status.textContent = 'Could not read the payment details. Refresh the page and reopen the extension.';
  }
})();
