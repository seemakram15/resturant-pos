using Microsoft.Extensions.Logging;
using KhalifaMobile.Services;

namespace KhalifaMobile;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("Fraunces-Regular.ttf",     "FrauncesRegular");
                fonts.AddFont("IBMPlexSans-Regular.ttf",  "PlexRegular");
                fonts.AddFont("IBMPlexSans-Medium.ttf",   "PlexMedium");
                fonts.AddFont("NotoNastaliqUrdu-Regular.ttf", "Nastaliq");
            });

        builder.Services.AddSingleton<LocalDb>();
        builder.Services.AddSingleton<SupabaseService>();
        builder.Services.AddHttpClient();

#if DEBUG
        builder.Logging.AddDebug();
#endif

        return builder.Build();
    }
}
