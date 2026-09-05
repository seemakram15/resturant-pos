# Khalifa Mobile · .NET MAUI

Read-only companion app for Khalifa Foods managers.

## Requires
- .NET 8 SDK (`dotnet --version` ≥ 8.0)
- MAUI workload: `dotnet workload install maui`

## Run
```bash
cd apps/mobile
dotnet build
dotnet build -t:Run -f net8.0-android    # Android emulator
dotnet build -t:Run -f net8.0-ios        # iOS simulator (Mac only)
```

## Structure
- `App.xaml` / `App.xaml.cs` — app entry
- `MainPage.xaml` — dashboard
- `Services/SupabaseService.cs` — REST calls to Supabase
- `Services/LocalDb.cs` — SQLite cache via sqlite-net-pcl
- `Resources/Strings/AppResources.resx` — English strings
- `Resources/Strings/AppResources.ur.resx` — Urdu strings

Environment: set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `appsettings.json`
before first run.

## Scope
Read-only. Never writes to Supabase. Pulls deltas every 5 min and on foreground.
