using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace KhalifaMobile.Services;

public sealed class DashboardStats
{
    public int OrdersToday { get; set; }
    public decimal Revenue { get; set; }
    public int Pending    { get; set; }
    public int LowStock   { get; set; }
}

public sealed class SupabaseService
{
    private static readonly HttpClient _http = new();
    private static readonly string _url = Environment.GetEnvironmentVariable("SUPABASE_URL") ?? "";
    private static readonly string _key = Environment.GetEnvironmentVariable("SUPABASE_ANON_KEY") ?? "";
    private const string TenantId = "00000000-0000-0000-0000-000000000001";

    public async Task<DashboardStats> LoadDashboardAsync()
    {
        if (string.IsNullOrEmpty(_url) || string.IsNullOrEmpty(_key))
        {
            return new DashboardStats { OrdersToday = 0, Revenue = 0, Pending = 0, LowStock = 0 };
        }

        var today = DateTime.UtcNow.Date.ToString("yyyy-MM-dd");
        var req = new HttpRequestMessage(HttpMethod.Get,
            $"{_url}/rest/v1/orders?tenant_id=eq.{TenantId}&created_at=gte.{today}&select=total,status");
        req.Headers.Add("apikey", _key);
        req.Headers.Add("Authorization", $"Bearer {_key}");

        var resp = await _http.SendAsync(req);
        resp.EnsureSuccessStatusCode();

        var rows = await resp.Content.ReadFromJsonAsync<List<OrderRow>>() ?? new();

        return new DashboardStats
        {
            OrdersToday = rows.Count,
            Revenue     = rows.Sum(r => r.Total ?? 0m),
            Pending     = rows.Count(r => r.Status == "received" || r.Status == "preparing"),
            LowStock    = 0,
        };
    }

    private sealed class OrderRow
    {
        [JsonPropertyName("total")]  public decimal? Total  { get; set; }
        [JsonPropertyName("status")] public string?  Status { get; set; }
    }
}
