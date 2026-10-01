package com.labistro.billing;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothSocket;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.ClipData;
import android.content.pm.PackageManager;
import android.net.Uri;
import androidx.core.content.FileProvider;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.RectF;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.text.Layout;
import android.text.StaticLayout;
import android.text.TextPaint;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Set;
import java.util.UUID;

public class MainActivity extends Activity {\n    private static final String DEFAULT_QR_DATA = "data:image/png;base64,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";

    private static final int BT_REQ = 9001;
    private static final UUID SPP_UUID = UUID.fromString("00001101-0000-1000-8000-00805F9B34FB");
    private static final int PAPER_DOTS = 384;
    private WebView web;
    private SharedPreferences prefs;
    private String pendingPrint = null;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        prefs = getSharedPreferences("la_bistro_printer", MODE_PRIVATE);
        web = new WebView(this);
        web.setBackgroundColor(Color.WHITE);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(false);
        s.setAllowContentAccess(false);
        s.setSupportZoom(false);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        web.clearCache(true);
        web.addJavascriptInterface(new PrinterBridge(), "AndroidPrinter");
        web.getSettings().setJavaScriptCanOpenWindowsAutomatically(false);
        web.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return false; }
            @Override public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                view.evaluateJavascript("(function(){window.__LB_NATIVE_ANDROID=true;window.__LB_NATIVE_PRINT=function(){try{if(window.LB&&window.LB.saveSale){window.LB.saveSale(true);return 'native-print-requested'}}catch(e){}return 'native-print-failed'};window.bluetoothPrinter=function(){try{if(window.AndroidPrinter&&typeof window.AndroidPrinter.setupPrinter==='function'){window.AndroidPrinter.setupPrinter();return}}catch(e){}alert('Bluetooth printer bridge is not available. Please reopen the La Bistro APK.')}})()", null);
            }
        });
        setContentView(web);
        web.loadUrl("https://achintabiswas-fulia.github.io/la-bistro-billing/?app=android&v=79");
    }

    private boolean hasBtPermission() {
        if (Build.VERSION.SDK_INT < 31) return true;
        return checkSelfPermission(Manifest.permission.BLUETOOTH_CONNECT) == PackageManager.PERMISSION_GRANTED
                && checkSelfPermission(Manifest.permission.BLUETOOTH_SCAN) == PackageManager.PERMISSION_GRANTED;
    }

    private void requestBtPermission(String printPayload) {
        pendingPrint = printPayload;
        if (Build.VERSION.SDK_INT >= 31) {
            requestPermissions(new String[]{
                    Manifest.permission.BLUETOOTH_CONNECT,
                    Manifest.permission.BLUETOOTH_SCAN
            }, BT_REQ);
        }
    }

    @Override public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != BT_REQ) return;
        boolean ok = grantResults.length >= 2
                && grantResults[0] == PackageManager.PERMISSION_GRANTED
                && grantResults[1] == PackageManager.PERMISSION_GRANTED;
        if (ok) {
            if (pendingPrint != null) { String p = pendingPrint; pendingPrint = null; printWithSavedPrinter(p); }
            else showPrinterPicker();
        } else {
            toast("Bluetooth permission is required. Open App Settings and allow Nearby devices.");
        }
    }

    private BluetoothAdapter adapter() { return BluetoothAdapter.getDefaultAdapter(); }

    private void showPrinterPicker() {
        toast("Opening printer connection...");
        if (!hasBtPermission()) { requestBtPermission(null); return; }
        BluetoothAdapter a = adapter();
        if (a == null) { toast("This phone does not support Bluetooth."); return; }
        if (!a.isEnabled()) {
            startActivity(new Intent(Settings.ACTION_BLUETOOTH_SETTINGS));
            toast("Turn on Bluetooth, then open Printer Settings again.");
            return;
        }
        Set<BluetoothDevice> bonded = a.getBondedDevices();
        if (bonded == null || bonded.isEmpty()) {
            startActivity(new Intent(Settings.ACTION_BLUETOOTH_SETTINGS));
            toast("Pair MPT-II first, then return to La Bistro and press BLUETOOTH again.");
            return;
        }
        final ArrayList<BluetoothDevice> devices = new ArrayList<>(bonded);
        String[] names = new String[devices.size()];
        for (int i = 0; i < devices.size(); i++) {
            BluetoothDevice d = devices.get(i);
            String n = d.getName();
            names[i] = (n == null || n.trim().isEmpty() ? "Bluetooth printer" : n) + "\n" + d.getAddress();
        }
        new AlertDialog.Builder(this)
                .setTitle("Select La Bistro Printer")
                .setItems(names, (dialog, which) -> {
                    BluetoothDevice d = devices.get(which);
                    prefs.edit().putString("printer_mac", d.getAddress()).putString("printer_name", d.getName() == null ? "Bluetooth printer" : d.getName()).apply();
                    toast("Printer saved: " + (d.getName() == null ? d.getAddress() : d.getName()));
                    web.evaluateJavascript("window.onNativePrinterReady&&window.onNativePrinterReady(" + JSONObject.quote(d.getName() == null ? d.getAddress() : d.getName()) + ")", null);
                    if (pendingPrint != null) {
                        String p = pendingPrint;
                        pendingPrint = null;
                        printWithSavedPrinter(p);
                    }
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private boolean printViaFreePrintService(JSONObject o, Bitmap receipt) {
        final String pkg = "com.thermalprinternative";
        try {
            getPackageManager().getPackageInfo(pkg, 0);
        } catch (Exception e) {
            return false;
        }
        try {
            File file = new File(getCacheDir(), "la_bistro_receipt.png");
            FileOutputStream fos = new FileOutputStream(file);
            receipt.compress(Bitmap.CompressFormat.PNG, 100, fos);
            fos.close();

            Uri uri = FileProvider.getUriForFile(this, getPackageName() + ".fileprovider", file);
            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.setType("image/png");
            intent.setPackage(pkg);
            intent.putExtra(Intent.EXTRA_STREAM, uri);
            intent.putExtra(Intent.EXTRA_TEXT,
                    "LA BISTRO\nNH 12 Fulia, Nadia\nPhone: 7811838548\nBill: " +
                    o.optString("id", "") + "\nTotal: ₹" +
                    String.format(java.util.Locale.US, "%.2f", o.optDouble("total", 0)));
            intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            intent.setClipData(ClipData.newRawUri("La Bistro receipt", uri));
            startActivity(intent);
            toast("Sending bill to ESCPOS printer...");
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    private void printWithSavedPrinter(String payload) {
        if (!hasBtPermission()) { requestBtPermission(payload); return; }
        String mac = prefs.getString("printer_mac", "");
        if (mac.isEmpty()) {
            pendingPrint = payload;
            showPrinterPicker();
            return;
        }
        new Thread(() -> {
            try {
                JSONObject o = new JSONObject(payload);
                byte[] bytes = receiptToEscPos(o);
                int copies = Math.max(1, Math.min(3, o.optInt("copies", 1)));
                BluetoothAdapter a = adapter();
                BluetoothDevice d = a.getRemoteDevice(mac);
                if (a.isDiscovering()) a.cancelDiscovery();
                BluetoothSocket socket = null;
                Exception last = null;
                try {
                    socket = d.createRfcommSocketToServiceRecord(SPP_UUID);
                    socket.connect();
                } catch (Exception first) {
                    last = first;
                    try {
                        if (socket != null) socket.close();
                    } catch (Exception ignored) {}
                    try {
                        socket = d.createInsecureRfcommSocketToServiceRecord(SPP_UUID);
                        socket.connect();
                    } catch (Exception second) {
                        last = second;
                        try {
                            if (socket != null) socket.close();
                        } catch (Exception ignored) {}
                        try {
                            java.lang.reflect.Method m = d.getClass().getMethod("createRfcommSocket", int.class);
                            socket = (BluetoothSocket)m.invoke(d, 1);
                            socket.connect();
                        } catch (Exception third) {
                            last = third;
                        }
                    }
                }
                if (socket == null || !socket.isConnected()) {
                    throw new Exception("Bluetooth printer connection failed", last);
                }
                OutputStream out = socket.getOutputStream();
                for (int copy = 0; copy < copies; copy++) {
                    int pos = 0;
                    while (pos < bytes.length) {
                        int n = Math.min(4096, bytes.length - pos);
                        out.write(bytes, pos, n);
                        pos += n;
                    }
                }
                out.flush();
                out.close();
                socket.close();
                final String name = prefs.getString("printer_name", "La Bistro Printer");
                runOnUiThread(() -> toast("Printed on " + name));
            } catch (Exception e) {
                runOnUiThread(() -> toast("Printer connection failed. Check that the 58mm printer is ON and paired."));
            }
        }).start();
    }

    private Bitmap decodeData(String data) {
        try {
            if (data == null || data.isEmpty()) return null;
            int comma = data.indexOf(',');
            String b64 = comma >= 0 ? data.substring(comma + 1) : data;
            byte[] raw = android.util.Base64.decode(b64, android.util.Base64.DEFAULT);
            return BitmapFactory.decodeByteArray(raw, 0, raw.length);
        } catch (Exception e) { return null; }
    }

    private void drawText(Canvas c, String text, float[] yRef, float size, boolean bold, boolean center) {
        TextPaint p = new TextPaint(Paint.ANTI_ALIAS_FLAG);
        p.setColor(Color.BLACK);
        p.setTextSize(size);
        p.setTypeface(android.graphics.Typeface.create("sans-serif", bold ? android.graphics.Typeface.BOLD : android.graphics.Typeface.NORMAL));
        p.setTextAlign(Paint.Align.LEFT);
        int width = PAPER_DOTS - 24;
        Layout.Alignment alignment = center ? Layout.Alignment.ALIGN_CENTER : Layout.Alignment.ALIGN_NORMAL;
        StaticLayout sl = new StaticLayout(text == null ? "" : text, p, width, alignment, 1.0f, 0f, false);
        c.save();
        c.translate(12, yRef[0]);
        sl.draw(c);
        c.restore();
        yRef[0] += sl.getHeight() + 5;
    }

    private Bitmap buildReceipt(JSONObject o) throws Exception {
        Bitmap b = Bitmap.createBitmap(PAPER_DOTS, 6000, Bitmap.Config.ARGB_8888);
        Canvas c = new Canvas(b);
        c.drawColor(Color.WHITE);
        float[] y = {10};
        Bitmap logo = decodeData(o.optString("logo", ""));
        if (logo != null) {
            float maxW = 220, maxH = 160, scale = Math.min(maxW / logo.getWidth(), maxH / logo.getHeight());
            if (scale > 1) scale = 1;
            float w = logo.getWidth() * scale, h = logo.getHeight() * scale;
            c.drawBitmap(logo, null, new RectF((PAPER_DOTS-w)/2f, y[0], (PAPER_DOTS+w)/2f, y[0]+h), new Paint(Paint.ANTI_ALIAS_FLAG));
            y[0] += h + 8;
        }
        drawText(c, "LA BISTRO", y, 28, true, true);
        drawText(c, "NH 12 Fulia, Nadia\nPhone: 7811838548", y, 17, true, true);
        drawText(c, o.optString("orderType", "Dine In") + " • " + o.optString("table", "-"), y, 15, false, true);
        drawText(c, o.optString("date", "") + "\n" + o.optString("id", ""), y, 14, false, true);
        Paint line = new Paint();
        line.setColor(Color.BLACK);
        line.setStrokeWidth(2);
        c.drawLine(10, y[0], PAPER_DOTS-10, y[0], line);
        y[0] += 8;

        JSONArray items = o.optJSONArray("items");
        if (items != null) for (int i = 0; i < items.length(); i++) {
            JSONObject x = items.getJSONObject(i);
            String name = x.optString("en", "") + (x.optString("bn", "").isEmpty() ? "" : "\n" + x.optString("bn", ""));
            String row = x.optInt("qty", 0) + " x " + name + "   ₹" + String.format(java.util.Locale.US, "%.2f", x.optDouble("lineTotal", 0));
            drawText(c, row, y, 16, false, false);
            c.drawLine(10, y[0], PAPER_DOTS-10, y[0], line);
            y[0] += 4;
        }
        drawText(c, "Subtotal: ₹" + String.format(java.util.Locale.US, "%.2f", o.optDouble("subtotal", 0)), y, 16, false, false);
        drawText(c, "Discount (" + o.optDouble("discountPct", 0) + "%): -₹" + String.format(java.util.Locale.US, "%.2f", o.optDouble("discount", 0)), y, 16, false, false);
        drawText(c, "GST (" + o.optDouble("taxRate", 0) + "%): ₹" + String.format(java.util.Locale.US, "%.2f", o.optDouble("tax", 0)), y, 16, false, false);
        drawText(c, "TOTAL: ₹" + String.format(java.util.Locale.US, "%.2f", o.optDouble("total", 0)), y, 23, true, false);
        drawText(c, "Customer: " + o.optString("customer", "") + "\nPayment: " + o.optString("payment", "Cash"), y, 15, false, false);
        String msg = o.optString("message", "").trim();
        if (!msg.isEmpty()) drawText(c, msg, y, 15, false, true);
        Bitmap qr = decodeData(o.optString("qr", ""));
        if (qr != null) {
            float sz = 170, scale = Math.min(sz / qr.getWidth(), sz / qr.getHeight());
            float w = qr.getWidth() * scale, h = qr.getHeight() * scale;
            c.drawBitmap(qr, null, new RectF((PAPER_DOTS-w)/2f, y[0], (PAPER_DOTS+w)/2f, y[0]+h), new Paint(Paint.ANTI_ALIAS_FLAG));
            y[0] += h + 5;
            drawText(c, "Scan to pay / পেমেন্ট স্ক্যান করুন", y, 13, false, true);
        }
        drawText(c, "Thank you / ধন্যবাদ", y, 17, true, true);
        int h = (int)Math.min(6000, Math.max(100, y[0] + 30));
        Bitmap out = Bitmap.createBitmap(PAPER_DOTS, h, Bitmap.Config.ARGB_8888);
        new Canvas(out).drawBitmap(b, 0, 0, null);
        b.recycle();
        return out;
    }

    private byte[] receiptToEscPos(JSONObject o) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Bitmap logo = decodeData(o.optString("logo", ""));
        if (logo != null) {
            out.write(logoToEscPos(logo));
        }
        out.write(textToEscPos(o));
        return out.toByteArray();
    }

    private byte[] bitmapToEscPos(Bitmap source, int maxWidth) throws Exception {
        int srcW = source.getWidth();
        int srcH = source.getHeight();
        float scale = Math.min(1f, maxWidth / (float) srcW);
        int w = Math.max(8, Math.min(maxWidth, Math.round(srcW * scale)));
        int h = Math.max(1, Math.round(srcH * scale));
        Bitmap bmp = Bitmap.createScaledBitmap(source, w, h, true);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        out.write(new byte[]{0x1B, 0x61, 0x01});
        out.write(new byte[]{0x1B, 0x33, 24});
        for (int y0 = 0; y0 < h; y0 += 24) {
            int bandH = Math.min(24, h - y0);
            out.write(new byte[]{0x1B, 0x2A, 33, (byte)(w & 0xFF), (byte)((w >> 8) & 0xFF)});
            for (int x = 0; x < w; x++) {
                for (int plane = 0; plane < 3; plane++) {
                    int v = 0;
                    for (int bit = 0; bit < 8; bit++) {
                        int yy = y0 + plane * 8 + bit;
                        if (yy < y0 + bandH) {
                            int col = bmp.getPixel(x, yy);
                            int gray = (Color.red(col) * 299 + Color.green(col) * 587 + Color.blue(col) * 114) / 1000;
                            if (gray < 180) v |= (1 << (7 - bit));
                        }
                    }
                    out.write(v);
                }
            }
            out.write(0x0A);
        }
        out.write(new byte[]{0x1B, 0x32});
        out.write(new byte[]{0x1B, 0x61, 0x00});
        out.write(new byte[]{0x0A});
        bmp.recycle();
        return out.toByteArray();
    }

    private byte[] logoToEscPos(Bitmap source) throws Exception {
        final int maxWidth = 280;
        int srcW = source.getWidth();
        int srcH = source.getHeight();
        float scale = Math.min(1f, maxWidth / (float) srcW);
        int w = Math.max(8, Math.min(maxWidth, Math.round(srcW * scale)));
        int h = Math.max(1, Math.round(srcH * scale));

        Bitmap bmp = Bitmap.createScaledBitmap(source, w, h, true);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        // Centered 24-dot column bitmap. This is sent only for the logo;
        // the receipt body remains the proven text-only ESC/POS path.
        out.write(new byte[]{0x1B, 0x40});
        out.write(new byte[]{0x1B, 0x61, 0x01});
        out.write(new byte[]{0x1B, 0x33, 24});

        for (int y0 = 0; y0 < h; y0 += 24) {
            int bandH = Math.min(24, h - y0);
            out.write(new byte[]{
                    0x1B, 0x2A, 33,
                    (byte)(w & 0xFF), (byte)((w >> 8) & 0xFF)
            });
            for (int x = 0; x < w; x++) {
                for (int plane = 0; plane < 3; plane++) {
                    int v = 0;
                    for (int bit = 0; bit < 8; bit++) {
                        int yy = y0 + plane * 8 + bit;
                        if (yy < y0 + bandH) {
                            int col = bmp.getPixel(x, yy);
                            int gray = (Color.red(col) * 299
                                    + Color.green(col) * 587
                                    + Color.blue(col) * 114) / 1000;
                            if (gray < 180) v |= (1 << (7 - bit));
                        }
                    }
                    out.write(v);
                }
            }
            out.write(0x0A);
        }
        out.write(new byte[]{0x1B, 0x32});
        out.write(new byte[]{0x1B, 0x61, 0x00});
        out.write(new byte[]{0x0A});
        bmp.recycle();
        return out.toByteArray();
    }

    private byte[] textToEscPos(JSONObject o) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        out.write(new byte[]{0x1B, 0x40});
        out.write(new byte[]{0x1B, 0x61, 0x01});
        out.write(new byte[]{0x1B, 0x45, 0x01});
        out.write(new byte[]{0x1D, 0x21, 0x11});
        writeAscii(out, "LA BISTRO\\n");
        out.write(new byte[]{0x1D, 0x21, 0x00});
        writeAscii(out, "NH 12 Fulia, Nadia\\n");
        writeAscii(out, "Phone: 7811838548\\n");
        out.write(new byte[]{0x1B, 0x45, 0x00});
        writeAscii(out, o.optString("orderType", "Dine In") + " / Table " + o.optString("table", "-") + "\\n");
        writeAscii(out, o.optString("date", "") + "\\n");
        writeAscii(out, o.optString("id", "") + "\\n");
        writeAscii(out, "--------------------------------\\n");
        out.write(new byte[]{0x1B, 0x61, 0x00});
        JSONArray items = o.optJSONArray("items");
        if (items != null) for (int i = 0; i < items.length(); i++) {
            JSONObject x = items.getJSONObject(i);
            String name = ascii(x.optString("en", ""));
            int qty = x.optInt("qty", 0);
            double line = x.optDouble("lineTotal", 0);
            writeAscii(out, qty + " x " + name + "\\n");
            writeAscii(out, "  " + name + "    Rs " + money(line) + "\\n");
        }
        writeAscii(out, "--------------------------------\\n");
        writeAscii(out, "Subtotal       Rs " + money(o.optDouble("subtotal", 0)) + "\\n");
        writeAscii(out, "Discount (" + o.optDouble("discountPct", 0) + "%) -Rs " + money(o.optDouble("discount", 0)) + "\\n");
        writeAscii(out, "GST (" + o.optDouble("taxRate", 0) + "%)       Rs " + money(o.optDouble("tax", 0)) + "\\n");
        out.write(new byte[]{0x1B, 0x45, 0x01});
        // Double-height only so TOTAL stays on one line on 58mm paper.
        out.write(new byte[]{0x1D, 0x21, 0x10});
        writeAscii(out, "TOTAL: Rs " + money(o.optDouble("total", 0)) + "\\n");
        out.write(new byte[]{0x1D, 0x21, 0x00});
        out.write(new byte[]{0x1B, 0x45, 0x00});
        String customer = ascii(o.optString("customer", ""));
        if (!customer.isEmpty()) writeAscii(out, "Customer: " + customer + "\\n");
        writeAscii(out, "Payment: " + ascii(o.optString("payment", "Cash")) + "\\n");
        String msg = ascii(o.optString("message", "").trim());
        if (!msg.isEmpty()) writeAscii(out, msg + "\\n");
        String qrData = o.optString("qr", "");
        if (qrData.isEmpty()) qrData = DEFAULT_QR_DATA;
        Bitmap qr = decodeData(qrData);
        if (qr != null) {
            out.write(bitmapToEscPos(qr, 220));
            out.write(new byte[]{0x1B, 0x61, 0x01});
            writeAscii(out, "Scan to pay / PAYMENT SCAN\\n");
        }
        out.write(new byte[]{0x1B, 0x61, 0x01});
        writeAscii(out, "Thank you\\n");
        out.write(bengaliThankYouToEscPos());
        writeAscii(out, "--------------------------------\\n\\n\\n");
        out.write(new byte[]{0x1B, 0x64, 0x03});
        return out.toByteArray();
    }

    private byte[] bengaliThankYouToEscPos() throws Exception {
        String[] lines = new String[]{
                "লা বিস্ট্রোতে (La Bistro)-এ খাবার খাওয়ার জন্য",
                "আপনাকে ধন্যবাদ! আপনার উপস্থিতি আমাদের দিনটি",
                "বিশেষ করে তুলেছে। আশা করি আপনার খাবার ভালো",
                "লেগেছে এবং খুব শীঘ্রই আমরা আপনাকে আবার সেবা",
                "দেওয়ার সুযোগ পাবো। আপনার দিনটি সুন্দর কাটুক! ❤"
        };
        int width = 384;
        int lineHeight = 30;
        int top = 8;
        Bitmap bmp = Bitmap.createBitmap(width, top + lines.length * lineHeight + 8, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(bmp);
        canvas.drawColor(Color.WHITE);
        Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG | Paint.SUBPIXEL_TEXT_FLAG);
        paint.setColor(Color.BLACK);
        paint.setTextSize(22f);
        paint.setTextAlign(Paint.Align.CENTER);
        paint.setTypeface(Typeface.create("sans-serif", Typeface.NORMAL));
        Paint.FontMetrics fm = paint.getFontMetrics();
        float baseline = top - fm.ascent;
        for (String line : lines) {
            canvas.drawText(line, width / 2f, baseline, paint);
            baseline += lineHeight;
        }
        byte[] data = bitmapToEscPos(bmp, width);
        bmp.recycle();
        return data;
    }

    private void writeAscii(ByteArrayOutputStream out, String s) throws Exception {
        // Some payload strings contain escaped newline sequences (\\n).
        // Convert them to real control characters before sending to ESC/POS.
        if (s == null) s = "";
        s = s.replace("\\n", "\n").replace("\\r", "\r").replace("\\t", "\t");
        out.write(ascii(s).getBytes(java.nio.charset.StandardCharsets.US_ASCII));
    }

    private String ascii(String s) {
        if (s == null) return "";
        return s.replaceAll("[^\\x20-\\x7E\\n\\r\\t]", "");
    }

    private String money(double v) {
        return String.format(java.util.Locale.US, "%.2f", v);
    }

    private void toast(String s) { Toast.makeText(this, s, Toast.LENGTH_SHORT).show(); }

    public class PrinterBridge {
        @JavascriptInterface public boolean isReady() { return !prefs.getString("printer_mac", "").isEmpty(); }
        @JavascriptInterface public String printerName() { return prefs.getString("printer_name", ""); }
        @JavascriptInterface public void setupPrinter() {
            runOnUiThread(() -> { if (!hasBtPermission()) requestBtPermission(null); else showPrinterPicker(); });
        }
        @JavascriptInterface public void printReceipt(String payload) {
            runOnUiThread(() -> { if (!hasBtPermission()) { requestBtPermission(payload); return; } printWithSavedPrinter(payload); });
        }
    }

    @Override public void onBackPressed() { if (web.canGoBack()) web.goBack(); else super.onBackPressed(); }
}