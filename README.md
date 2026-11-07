# BVK — IPS QR (Chrome / Chromium)

Open a `virman.r` payment slip on `vlasovi.bvk.rs` and click the extension icon. The popup displays a QR code with the caption “NBS IPS QR”. Scan it with your banking app and check the payment details before confirming payment.

## Installation and updates

1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and select the `bvk-ips-extension` folder.
3. Pin the extension using Chrome’s extensions menu to keep its icon visible.

To update, replace the files, click the extension’s reload button in `chrome://extensions`, and refresh the payment slip to remove any page content added by an older version.

## Behavior and privacy

The extension reads payment details from the page HTML only when you click its icon. It does not modify the page. The `activeTab` and `scripting` permissions provide temporary access to the active tab following your click. A URL check restricts extraction to the BVK payment slip page.

QR codes are generated locally, without network requests, analytics, or data storage. Fields are read from adjacent `.zaglavlje` and `.polje` elements inside `#uplatnica`. Extraction targets the supplied payment slip markup. Models `00` and `97` with numeric payment references are supported. Account checksums and model `97` reference checksums are validated. If processing fails, the popup displays a short error message instead of a QR code.

The interface and documentation are in English. Serbian field labels in the extractor and HTML fixture match the source payment slip and are required for extraction.

## Test data and verification

Run the payment validation and QR generation checks:

```sh
node payment.test.cjs
```

`payment.test.cjs` and `test/virman.html` use synthetic payer and recipient names, addresses, a placeholder tax identifier, amounts, accounts, and payment references. Accounts use the synthetic bank prefix `999`; account and model `97` reference checksums are mathematically valid to exercise validation. These values are test fixtures only and must not be used to make payments. They are not derived from actual customer or recipient records. Checksum validity does not establish that an account exists or is reserved for testing.

## QR format and dependencies

The paper payment code `189` is converted to its cashless counterpart `289` in the QR code’s `SF` field for mobile banking. Other payment codes are preserved.

- [NBS IPS QR format guidelines](https://ips.nbs.rs/PDF/Smernice_Generator_Validator_cirilica.pdf)
- [NBS payment recommendations](https://ips.nbs.rs/PDF/pdfPreporukeNovoLat.pdf)

Bundled library: qrcode-generator 1.4.4 by Kazuhiko Arase, licensed under MIT; see the notice in `vendor/qrcode.js`. UTF-8 support is provided by `vendor/qrcode_UTF8.js`.
