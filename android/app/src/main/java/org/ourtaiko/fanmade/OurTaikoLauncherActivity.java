package org.ourtaiko.fanmade;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.res.AssetManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.Settings;
import android.util.Log;
import android.view.Gravity;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

/** Permissions and file preparation complete before SDL starts its native thread. */
public class OurTaikoLauncherActivity extends Activity {
    private static final int STORAGE_REQUEST = 1;
    // Serialize setup across Activity recreation; cancel the old work on destroy.
    private static final ExecutorService WORKER = Executors.newSingleThreadExecutor();
    private Future<?> preparation;
    private boolean waitingForPermission;
    private boolean ready;
    private boolean resumed;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setGravity(Gravity.CENTER);
        layout.setPadding(32, 32, 32, 32);
        layout.addView(new ProgressBar(this));
        TextView message = new TextView(this);
        message.setText(R.string.preparing_game_data);
        message.setGravity(Gravity.CENTER);
        message.setPadding(0, 24, 0, 0);
        layout.addView(message);
        setContentView(layout);
        waitingForPermission = state != null && state.getBoolean("waitingForPermission");
        if (hasStoragePermission()) prepare();
        else if (!waitingForPermission) requestStoragePermission();
    }

    private boolean hasStoragePermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            return Environment.isExternalStorageManager();
        }
        return checkSelfPermission(Manifest.permission.WRITE_EXTERNAL_STORAGE)
                == PackageManager.PERMISSION_GRANTED
                && checkSelfPermission(Manifest.permission.READ_EXTERNAL_STORAGE)
                == PackageManager.PERMISSION_GRANTED;
    }

    private void requestStoragePermission() {
        waitingForPermission = true;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            try {
                startActivityForResult(new Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION,
                        Uri.parse("package:" + getPackageName())), STORAGE_REQUEST);
            } catch (ActivityNotFoundException missingAppPage) {
                try {
                    startActivityForResult(new Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION), STORAGE_REQUEST);
                } catch (ActivityNotFoundException missingSettings) {
                    waitingForPermission = false;
                    showFailure(getString(R.string.storage_permission_required), this::requestStoragePermission);
                }
            }
        } else {
            requestPermissions(new String[]{Manifest.permission.READ_EXTERNAL_STORAGE,
                    Manifest.permission.WRITE_EXTERNAL_STORAGE}, STORAGE_REQUEST);
        }
    }

    @Override
    protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == STORAGE_REQUEST) permissionReturned();
    }

    @Override
    public void onRequestPermissionsResult(int request, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(request, permissions, results);
        if (request == STORAGE_REQUEST) permissionReturned();
    }

    private void permissionReturned() {
        waitingForPermission = false;
        if (hasStoragePermission()) prepare();
        else showFailure(getString(R.string.storage_permission_required), this::requestStoragePermission);
    }

    private void prepare() {
        if (preparation != null && !preparation.isDone()) return;
        AssetManager assets = getApplicationContext().getAssets();
        preparation = WORKER.submit(() -> {
            try {
                GameDataInstaller.install(new GameDataInstaller.Assets() {
                    public InputStream open(String path) throws IOException {
                        return assets.open(path, AssetManager.ACCESS_STREAMING);
                    }
                }, Paths.get(Environment.getExternalStorageDirectory().getAbsolutePath(), "OurTaiko"));
                runOnUiThread(() -> { ready = true; launchIfReady(); });
            } catch (IOException | RuntimeException error) {
                Log.e("OurTaiko", "Cannot prepare game data", error);
                runOnUiThread(() -> showFailure(getString(R.string.game_data_failed), this::prepare));
            }
        });
    }

    private void launchIfReady() {
        if (!ready || !resumed || isFinishing() || isDestroyed()) return;
        ready = false;
        startActivity(new Intent(this, OurTaikoActivity.class));
        finish();
    }

    private void showFailure(String message, Runnable retry) {
        if (isFinishing() || isDestroyed()) return;
        new AlertDialog.Builder(this).setTitle(R.string.app_name).setMessage(message)
                .setPositiveButton(R.string.retry, (dialog, which) -> retry.run())
                .setNegativeButton(R.string.close_app, (dialog, which) -> finish())
                .setCancelable(false).show();
    }

    @Override protected void onResume() {
        super.onResume();
        resumed = true;
        launchIfReady();
    }

    @Override protected void onPause() {
        resumed = false;
        super.onPause();
    }

    @Override protected void onSaveInstanceState(Bundle state) {
        state.putBoolean("waitingForPermission", waitingForPermission);
        super.onSaveInstanceState(state);
    }

    @Override protected void onDestroy() {
        if (preparation != null) preparation.cancel(true);
        super.onDestroy();
    }
}
