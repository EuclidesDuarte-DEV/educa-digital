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
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.graphics.Insets;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.ValueCallback;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.widget.Button;

import java.util.ArrayList;

public final class MainActivity extends Activity {
    private static final String ORIGIN = "educa-digital.educamaisdigital.workers.dev";
    private static final String START = "https://" + ORIGIN + "/html/?app=1&platform=android&experience=web";
    private static final int WEB_PERMISSION_CODE = 1134;
    private static final int PHOTO_PICKER_CODE = 1135;
    private WebView webView;
    private PermissionRequest pendingWebPermission;
    private ValueCallback<Uri[]> pendingPhotoSelection;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        // Mostrar barras nativas claras em vez da antiga tela imersiva sem entrada.
        // O WebView mantém o tratamento padrão de insets e teclado do Android.
        getWindow().clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        getWindow().setStatusBarColor(Color.rgb(247, 250, 255));
        getWindow().setNavigationBarColor(Color.rgb(247, 250, 255));
        getWindow().getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR | View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            // API 35 força edge-to-edge. Reservar insets explicitamente.
            getWindow().setDecorFitsSystemWindows(false);
        }
        WebView.setWebContentsDebuggingEnabled(false);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(247, 250, 255));
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
        // Impedir que o sistema Android escureça automaticamente a Home clara da Web.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            settings.setAlgorithmicDarkeningAllowed(false);
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            settings.setForceDark(WebSettings.FORCE_DARK_OFF);
        }
        settings.setUserAgentString(settings.getUserAgentString() + " EducaNativeAndroid/1.1");
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
            // A Fototeca da Web depende de um seletor de arquivos no APK.
            // Aceitar somente imagens escolhidas explicitamente pelo participante.
            @Override public boolean onShowFileChooser(WebView view,
                    ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (pendingPhotoSelection != null) {
                    pendingPhotoSelection.onReceiveValue(null);
                    pendingPhotoSelection = null;
                }
                if (view == null || !trusted(Uri.parse(view.getUrl() == null ? "" : view.getUrl()))) {
                    callback.onReceiveValue(null);
                    return true;
                }
                try {
                    Intent picker = params.createIntent();
                    picker.setType("image/*");
                    picker.addCategory(Intent.CATEGORY_OPENABLE);
                    picker.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true);
                    pendingPhotoSelection = callback;
                    startActivityForResult(picker, PHOTO_PICKER_CODE);
                } catch (Exception error) {
                    pendingPhotoSelection = null;
                    callback.onReceiveValue(null);
                }
                return true;
            }
            @Override public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> askWebPermission(request));
            }
            @Override public void onPermissionRequestCanceled(PermissionRequest request) {
                if (request == pendingWebPermission) pendingWebPermission = null;
            }
        });

        setSafeContent(webView);
        if (state == null) webView.loadUrl(START);
        else webView.restoreState(state);
    }

    private void setSafeContent(View content) {
        if (content.getParent() instanceof ViewGroup) {
            ((ViewGroup) content.getParent()).removeView(content);
        }
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            setContentView(content);
            return;
        }
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(247, 250, 255));
        root.addView(content, new FrameLayout.LayoutParams(-1, -1));
        root.setOnApplyWindowInsetsListener((view, windowInsets) -> {
            Insets safe = windowInsets.getInsets(WindowInsets.Type.systemBars() |
                    WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
            view.setPadding(safe.left, safe.top, safe.right, safe.bottom);
            return WindowInsets.CONSUMED;
        });
        setContentView(root);
        root.requestApplyInsets();
    }

    @Override protected void onActivityResult(int code, int resultCode, Intent data) {
        if (code == PHOTO_PICKER_CODE) {
            ValueCallback<Uri[]> callback = pendingPhotoSelection;
            pendingPhotoSelection = null;
            if (callback != null) {
                callback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            }
            return;
        }
        super.onActivityResult(code, resultCode, data);
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
            retry.setOnClickListener(v -> { setSafeContent(webView); webView.loadUrl(START); });
            setSafeContent(panel);
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
        if (pendingPhotoSelection != null) { pendingPhotoSelection.onReceiveValue(null); pendingPhotoSelection = null; }
        if (pendingWebPermission != null) { pendingWebPermission.deny(); pendingWebPermission = null; }
        if (webView != null) { webView.stopLoading(); webView.destroy(); webView = null; }
        super.onDestroy();
    }
}
