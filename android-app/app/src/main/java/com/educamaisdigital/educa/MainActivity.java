package com.educamaisdigital.educa;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.widget.Button;

import java.util.ArrayList;

public final class MainActivity extends Activity {
    private static final String ORIGIN = "educa-digital.educamaisdigital.workers.dev";
    private static final String START = "https://" + ORIGIN + "/?app=1";
    private static final int WEB_PERMISSION_CODE = 1134;
    private WebView webView;
    private PermissionRequest pendingWebPermission;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().setNavigationBarColor(Color.BLACK);
        WebView.setWebContentsDebuggingEnabled(false);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(11, 21, 37));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSupportMultipleWindows(false);
        settings.setUserAgentString(settings.getUserAgentString() + " EducaNativeAndroid/1.0");
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);

        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                if (request.isForMainFrame() && !trusted(request.getUrl())) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, request.getUrl())); } catch (Exception ignored) {}
                    return true;
                }
                return false;
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest req, WebResourceError err) {
                if (!req.isForMainFrame()) return;
                showOffline();
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> askWebPermission(request));
            }
            @Override public void onPermissionRequestCanceled(PermissionRequest request) {
                if (request == pendingWebPermission) pendingWebPermission = null;
            }
        });

        setContentView(webView);
        if (state == null) webView.loadUrl(START);
        else webView.restoreState(state);
    }

    private boolean trusted(Uri url) {
        return url != null && "https".equals(url.getScheme()) && ORIGIN.equalsIgnoreCase(url.getHost());
    }

    private void askWebPermission(PermissionRequest request) {
        if (!trusted(request.getOrigin())) { request.deny(); return; }
        ArrayList<String> needed = new ArrayList<>();
        for (String resource : request.getResources()) {
            if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource)) {
                if (!needed.contains(Manifest.permission.RECORD_AUDIO))
                    needed.add(Manifest.permission.RECORD_AUDIO);
            } else if (PermissionRequest.RESOURCE_VIDEO_CAPTURE.equals(resource)) {
                if (!needed.contains(Manifest.permission.CAMERA))
                    needed.add(Manifest.permission.CAMERA);
            } else {
                request.deny(); return; // jamais conceder recursos desconhecidos
            }
        }
        if (needed.isEmpty() || pendingWebPermission != null) { request.deny(); return; }
        ArrayList<String> missing = new ArrayList<>();
        for (String perm : needed)
            if (checkSelfPermission(perm) != PackageManager.PERMISSION_GRANTED) missing.add(perm);
        if (missing.isEmpty()) {
            request.grant(request.getResources()); // recursos já validados e restritos ao domínio oficial
        } else {
            pendingWebPermission = request;
            requestPermissions(missing.toArray(new String[0]), WEB_PERMISSION_CODE);
        }
    }

    @Override public void onRequestPermissionsResult(int code, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(code, permissions, results);
        if (code != WEB_PERMISSION_CODE || pendingWebPermission == null) return;
        PermissionRequest request = pendingWebPermission;
        pendingWebPermission = null;
        boolean granted = true;
        for (int i = 0; i < permissions.length; i++) {
            if (i >= results.length || results[i] != PackageManager.PERMISSION_GRANTED) granted = false;
        }
        if (granted && trusted(request.getOrigin())) request.grant(request.getResources());
        else request.deny();
    }

    private void showOffline() {
        if (webView == null || !START.equals(webView.getUrl())) return;
        runOnUiThread(() -> {
            FrameLayout panel = new FrameLayout(this);
            panel.setBackgroundColor(Color.rgb(235,244,252));
            TextView message = new TextView(this);
            message.setText("Sem conexão com a Cloudflare. Verifique a internet e tente novamente.");
            message.setTextColor(Color.rgb(21,53,86));
            message.setTextSize(19);
            message.setPadding(32,70,32,30);
            panel.addView(message);
            Button retry = new Button(this);
            retry.setText("Tentar novamente");
            FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(-2,-2);
            params.topMargin = 190;
            params.leftMargin = 32;
            panel.addView(retry, params);
            retry.setOnClickListener(v -> { setContentView(webView); webView.loadUrl(START); });
            setContentView(panel);
        });
    }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
    @Override protected void onSaveInstanceState(Bundle out) {
        if (webView != null) webView.saveState(out);
        super.onSaveInstanceState(out);
    }
    @Override public void onDestroy() {
        if (pendingWebPermission != null) { pendingWebPermission.deny(); pendingWebPermission = null; }
        if (webView != null) { webView.stopLoading(); webView.destroy(); webView = null; }
        super.onDestroy();
    }
}
