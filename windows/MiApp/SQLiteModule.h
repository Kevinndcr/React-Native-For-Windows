#pragma once
#include "pch.h"
#include <NativeModules.h>
#include <winrt/Windows.Storage.h>
#include <filesystem>
#include "sqlite3.h"

namespace MiApp {

using namespace winrt::Microsoft::ReactNative;

REACT_MODULE(SQLiteModule, L"SQLiteModule");
struct SQLiteModule {

    REACT_SYNC_METHOD(GetAll, L"getAll")
    JSValue GetAll() noexcept {
        auto results = JSValueArray{};

        auto roamingPath = winrt::Windows::Storage::ApplicationData::Current()
                               .RoamingFolder().Path();
        std::wstring dbPathW = std::wstring(roamingPath.c_str()) + L"\\greetings.db";

        sqlite3* db = nullptr;
        if (sqlite3_open16(dbPathW.c_str(), &db) != SQLITE_OK) {
            if (db) sqlite3_close(db);
            return JSValue(std::move(results));
        }

        sqlite3_stmt* stmt = nullptr;
        const char* sql = "SELECT * FROM greetings ORDER BY id ASC";
        if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
            while (sqlite3_step(stmt) == SQLITE_ROW) {
                auto row = JSValueObject{};
                int cols = sqlite3_column_count(stmt);
                for (int i = 0; i < cols; i++) {
                    const char* colName = sqlite3_column_name(stmt, i);
                    const unsigned char* colVal = sqlite3_column_text(stmt, i);
                    row[colName] = colVal
                        ? std::string(reinterpret_cast<const char*>(colVal))
                        : "";
                }
                results.push_back(JSValue(std::move(row)));
            }
            sqlite3_finalize(stmt);
        }
        sqlite3_close(db);
        return JSValue(std::move(results));
    }

    REACT_SYNC_METHOD(DbExists, L"dbExists")
    bool DbExists() noexcept {
        auto roamingPath = winrt::Windows::Storage::ApplicationData::Current()
                               .RoamingFolder().Path();
        std::wstring dbPathW = std::wstring(roamingPath.c_str()) + L"\\greetings.db";
        return std::filesystem::exists(dbPathW);
    }

    REACT_SYNC_METHOD(Insert, L"insert")
    bool Insert(std::string name, std::string message, std::string fecha) noexcept {
        auto roamingPath = winrt::Windows::Storage::ApplicationData::Current()
                               .RoamingFolder().Path();
        std::wstring dbPathW = std::wstring(roamingPath.c_str()) + L"\\greetings.db";
        sqlite3* db = nullptr;
        if (sqlite3_open16(dbPathW.c_str(), &db) != SQLITE_OK) {
            if (db) sqlite3_close(db);
            return false;
        }
        sqlite3_stmt* stmt = nullptr;
        const char* sql = "INSERT INTO greetings (name, message, fecha) VALUES (?, ?, ?)";
        bool result = false;
        if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
            sqlite3_bind_text(stmt, 1, name.c_str(),    -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 2, message.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 3, fecha.c_str(),   -1, SQLITE_TRANSIENT);
            result = sqlite3_step(stmt) == SQLITE_DONE;
            sqlite3_finalize(stmt);
        }
        sqlite3_close(db);
        return result;
    }

    REACT_SYNC_METHOD(Update, L"update")
    bool Update(int id, std::string name, std::string message, std::string fecha) noexcept {
        auto roamingPath = winrt::Windows::Storage::ApplicationData::Current()
                               .RoamingFolder().Path();
        std::wstring dbPathW = std::wstring(roamingPath.c_str()) + L"\\greetings.db";
        sqlite3* db = nullptr;
        if (sqlite3_open16(dbPathW.c_str(), &db) != SQLITE_OK) {
            if (db) sqlite3_close(db);
            return false;
        }
        sqlite3_stmt* stmt = nullptr;
        const char* sql = "UPDATE greetings SET name=?, message=?, fecha=? WHERE id=?";
        bool result = false;
        if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
            sqlite3_bind_text(stmt, 1, name.c_str(),    -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 2, message.c_str(), -1, SQLITE_TRANSIENT);
            sqlite3_bind_text(stmt, 3, fecha.c_str(),   -1, SQLITE_TRANSIENT);
            sqlite3_bind_int(stmt,  4, id);
            result = sqlite3_step(stmt) == SQLITE_DONE;
            sqlite3_finalize(stmt);
        }
        sqlite3_close(db);
        return result;
    }

    REACT_SYNC_METHOD(DeleteRow, L"deleteRow")
    bool DeleteRow(int id) noexcept {
        auto roamingPath = winrt::Windows::Storage::ApplicationData::Current()
                               .RoamingFolder().Path();
        std::wstring dbPathW = std::wstring(roamingPath.c_str()) + L"\\greetings.db";
        sqlite3* db = nullptr;
        if (sqlite3_open16(dbPathW.c_str(), &db) != SQLITE_OK) {
            if (db) sqlite3_close(db);
            return false;
        }
        sqlite3_stmt* stmt = nullptr;
        const char* sql = "DELETE FROM greetings WHERE id=?";
        bool result = false;
        if (sqlite3_prepare_v2(db, sql, -1, &stmt, nullptr) == SQLITE_OK) {
            sqlite3_bind_int(stmt, 1, id);
            result = sqlite3_step(stmt) == SQLITE_DONE;
            sqlite3_finalize(stmt);
        }
        sqlite3_close(db);
        return result;
    }
};

} // namespace MiApp
