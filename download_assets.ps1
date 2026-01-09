$assets = @(
    @{ Url = "https://ucarecdn.com/13aa3eb3-2287-4348-9366-0744fb837c44/hover_tick.mp3"; Name = "hover_tick.mp3" },
    @{ Url = "https://ucarecdn.com/74a05537-567a-4c2f-981f-47240c242045/click_snap.mp3"; Name = "click_snap.mp3" },
    @{ Url = "https://ucarecdn.com/2c7c569f-8561-4696-98df-8032771d9990/notification.mp3"; Name = "notification.mp3" },
    @{ Url = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2070&auto=format&fit=crop"; Name = "hero_bg_1.jpg" },
    @{ Url = "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=2070&auto=format&fit=crop"; Name = "hero_bg_2.jpg" },
    @{ Url = "https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1992&auto=format&fit=crop"; Name = "unboxing.jpg" }
)

$dest = "assets"
if (!(Test-Path $dest)) { New-Item -ItemType Directory -Path $dest }

foreach ($asset in $assets) {
    echo "Downloading $($asset.Name)..."
    Invoke-WebRequest -Uri $asset.Url -OutFile "$dest/$($asset.Name)"
}
