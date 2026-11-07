(function (root) {
  const clean = s => String(s || '').trim();
  function amount(s) {
    s = clean(s).replace(/\s/g, '');
    if (/^\d{1,3}(,\d{3})*\.\d{2}$/.test(s)) s = s.replace(/,/g, '').replace('.', ',');
    else if (/^\d{1,3}(\.\d{3})*,\d{2}$/.test(s)) s = s.replace(/\./g, '');
    else if (/^\d+\.\d{2}$/.test(s)) s = s.replace('.', ',');
    if (!/^\d{1,12},\d{2}$/.test(s) || Number(s.replace(',', '.')) <= 0) throw Error('Check the amount (for example, 1,234.56 or 1.234,56).');
    return s.replace(/^0+(?=\d)/, '');
  }
  function mod97(s) {
    let remainder = 0;
    for (const digit of s) remainder = (remainder * 10 + Number(digit)) % 97;
    return remainder;
  }
  function account(s) {
    s = clean(s);
    if (/^\d{3}-\d{1,13}-\d{2}$/.test(s)) {
      const [bank, number, checksum] = s.split('-');
      s = bank + number.padStart(13, '0') + checksum;
    }
    if (!/^\d{18}$/.test(s) || mod97(s) !== 1) throw Error('Invalid recipient account or account checksum.');
    return s;
  }
  function text(s, max, label) {
    s = clean(s).replace(/\s+/g, ' ');
    if (!s || s.length > max || /[|{}]/.test(s)) throw Error('Check the "' + label + '".');
    return s;
  }
  function payload(d) {
    const r = account(d.account), i = amount(d.amount);
    const n = text(d.recipient, 70, 'Recipient'), purpose = text(d.purpose, 35, 'Payment purpose');
    if (!/^\d{3}$/.test(d.code)) throw Error('The payment code must contain 3 digits.');
    // Paper BVK slips use cash code 189; mobile banking uses its cashless counterpart.
    const code = d.code === '189' ? '289' : d.code;
    const model = clean(d.model), ref = clean(d.reference).replace(/[\s-]/g, '');
    if (!/^(00|97)$/.test(model) || !/^\d{1,23}$/.test(ref)) throw Error('Check the model and payment reference (supported models: 00 and 97).');
    if (model === '97' && (ref.length < 3 || mod97(ref.slice(2) + ref.slice(0, 2)) !== 1)) throw Error('Invalid payment reference checksum for model 97.');
    return `K:PR|V:01|C:1|R:${r}|N:${n}|I:RSD${i}|SF:${code}|S:${purpose}|RO:${model}${ref}`;
  }
  root.BvkPayment = { amount, account, payload };
  if (typeof module !== 'undefined') module.exports = root.BvkPayment;
})(globalThis);
