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

public class MainActivity extends Activity {
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
        web.loadUrl("https://achintabiswas-fulia.github.io/la-bistro-billing/?app=android&v=76");
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
                byte[] bytes = textToEscPos(o);
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
                        out.flush();
                        pos += n;
                        try { Thread.sleep(8); } catch (InterruptedException ignored) {}
                    }
                }
                try { Thread.sleep(250); } catch (InterruptedException ignored) {}
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
        out.write(new byte[]{0x1D, 0x21, 0x01});
        writeAscii(out, "TOTAL: Rs " + money(o.optDouble("total", 0)) + "\\n");
        out.write(new byte[]{0x1D, 0x21, 0x00});
        out.write(new byte[]{0x1B, 0x45, 0x00});
        String customer = ascii(o.optString("customer", ""));
        if (!customer.isEmpty()) writeAscii(out, "Customer: " + customer + "\\n");
        writeAscii(out, "Payment: " + ascii(o.optString("payment", "Cash")) + "\\n");
        String msg = ascii(o.optString("message", "").trim());
        if (!msg.isEmpty()) writeAscii(out, msg + "\\n");
        out.write(new byte[]{0x1B, 0x61, 0x01});
        writeAscii(out, "Thank you\\n--------------------------------\\n\\n\\n");
        out.write(new byte[]{0x1B, 0x64, 0x03});
        return out.toByteArray();
    }

    private void writeAscii(ByteArrayOutputStream out, String s) throws Exception {
        // Some payload strings contain escaped newline sequences (\\n).
        // Convert them to real control characters before sending to ESC/POS.
        if (s == null) s = "";
        s = s.replace("\\\\n", "\n").replace("\\\\r", "\r").replace("\\\\t", "\t");
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