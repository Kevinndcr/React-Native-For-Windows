#pragma once
#include "pch.h"
#include <NativeModules.h>
#include <winrt/Windows.Storage.h>
#include <commdlg.h>
#include <filesystem>
#include <thread>

#pragma comment(lib, "comdlg32.lib")

namespace MiApp {

REACT_MODULE(FilePickerModule, L"FilePickerModule");
struct FilePickerModule {

    REACT_METHOD(PickAndImportDb, L"pickAndImportDb")
    void PickAndImportDb(
        winrt::Microsoft::ReactNative::ReactPromise<bool> promise) noexcept {

        // Obtener la ruta destino en el hilo principal (antes de crear el thread)
        auto roamingPath = winrt::Windows::Storage::ApplicationData::Current()
                               .RoamingFolder().Path();
        std::wstring destDir(roamingPath.c_str());

        std::thread([promise = std::move(promise),
                     destDir = std::move(destDir)]() mutable noexcept {
            CoInitializeEx(nullptr, COINIT_APARTMENTTHREADED);

            WCHAR szFile[MAX_PATH] = {};
            OPENFILENAMEW ofn = {};
            ofn.lStructSize = sizeof(ofn);
            ofn.hwndOwner   = GetForegroundWindow();
            ofn.lpstrFile   = szFile;
            ofn.nMaxFile    = MAX_PATH;
            ofn.lpstrFilter =
                L"SQLite Database\0*.db;*.sqlite;*.sqlite3\0All Files\0*.*\0";
            ofn.nFilterIndex = 1;
            ofn.Flags = OFN_PATHMUSTEXIST | OFN_FILEMUSTEXIST;

            bool result = false;
            if (GetOpenFileNameW(&ofn)) {
                try {
                    std::filesystem::copy_file(
                        std::filesystem::path(szFile),
                        std::filesystem::path(destDir + L"\\greetings.db"),
                        std::filesystem::copy_options::overwrite_existing);
                    result = true;
                } catch (...) {
                }
            }

            CoUninitialize();
            promise.Resolve(result);
        }).detach();
    }
};

} // namespace MiApp
