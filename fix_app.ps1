$path = "App.tsx"
$content = Get-Content $path
$part1 = $content[0..791]
$part2 = $content[1075..($content.Count - 1)]
$newContent = $part1 + $part2
$newContent | Set-Content $path -Encoding UTF8
