using KhalifaMobile.Services;

namespace KhalifaMobile;

public partial class MainPage : ContentPage
{
    private readonly SupabaseService _svc;

    public MainPage()
    {
        InitializeComponent();
        _svc = new SupabaseService();
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await RefreshAsync();
    }

    private async void OnRefreshClicked(object sender, EventArgs e)
    {
        await RefreshAsync();
    }

    private async Task RefreshAsync()
    {
        try
        {
            var s = await _svc.LoadDashboardAsync();
            OrdersTodayLabel.Text = s.OrdersToday.ToString();
            RevenueLabel.Text     = $"Rs {s.Revenue:N0}";
            PendingLabel.Text     = s.Pending.ToString();
            LowStockLabel.Text    = s.LowStock.ToString();
            LastSyncLabel.Text    = $"Last synced {DateTime.Now:HH:mm}";
        }
        catch (Exception ex)
        {
            LastSyncLabel.Text = $"Sync failed — {ex.Message}";
        }
    }
}
