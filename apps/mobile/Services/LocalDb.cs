using SQLite;

namespace KhalifaMobile.Services;

public sealed class LocalDb
{
    private SQLiteAsyncConnection? _db;

    public async Task<SQLiteAsyncConnection> GetConnectionAsync()
    {
        if (_db is not null) return _db;
        var path = Path.Combine(FileSystem.AppDataDirectory, "khalifa.sqlite");
        _db = new SQLiteAsyncConnection(path);
        await _db.CreateTableAsync<CachedOrder>();
        await _db.CreateTableAsync<CachedMenuItem>();
        return _db;
    }
}

public sealed class CachedOrder
{
    [PrimaryKey] public string Id { get; set; } = string.Empty;
    public long BillNo { get; set; }
    public string Channel { get; set; } = string.Empty;
    public string Status  { get; set; } = string.Empty;
    public decimal Total  { get; set; }
    public DateTime CreatedAt { get; set; }
}

public sealed class CachedMenuItem
{
    [PrimaryKey] public string Id { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string? NameUr { get; set; }
    public decimal BasePrice { get; set; }
    public bool IsAvailable { get; set; }
}
