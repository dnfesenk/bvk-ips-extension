(function (root) {
  function read(document) {
    const bill = document.querySelector('#uplatnica');
    const definitions = {
      recipient: /^Primalac$/i,
      account: /^Račun primaoca$/i,
      amount: /^Iznos$/i,
      code: /^Šifra plaćanja$/i,
      purpose: /^Svrha uplate$/i,
      model: /^Model$/i,
      reference: /^Poziv na broj\s*\(odobrenje\)$/i
    };
    const labels = bill ? [...bill.querySelectorAll('.zaglavlje')] : [];
    const normalize = value => value.trim().replace(/\s+/g, ' ');
    function field(pattern) {
      const matches = labels.filter(label => pattern.test(normalize(label.textContent)));
      const value = matches.length === 1 ? matches[0].nextElementSibling : null;
      return value?.classList.contains('polje') ? value : null;
    }

    const result = {};
    for (const [key, pattern] of Object.entries(definitions)) {
      const value = field(pattern);
      result[key] = value ? normalize(value.textContent) : '';
      // Only the first line contains the recipient name; address and PIB follow <br>.
      if (key === 'recipient' && value) {
        let name = '';
        for (const node of value.childNodes) {
          if (node.nodeName === 'BR') break;
          name += node.textContent;
        }
        result[key] = normalize(name);
      }
    }
    const currency = field(/^Valuta$/i);
    if (!currency || normalize(currency.textContent) !== 'RSD') result.amount = '';
    return result;
  }
  root.BvkExtract = {read};
})(globalThis);
