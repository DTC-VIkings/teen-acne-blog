# Daily Rebuild Automation

## What this does

Triggers a daily Vercel rebuild of teenacnesolutions.com so that
blog posts with future dates in their frontmatter go live automatically
on their publish date.

## How it works

1. `daily-rebuild.sh` runs every day at 9:13 AM (Cyprus local time)
2. It bumps `LAST_REBUILD.txt` with today's date
3. Commits and pushes to GitHub
4. Vercel's GitHub integration detects the push and auto-deploys
5. The new build includes all posts with `date <= today`

Why a real commit instead of just hitting the Vercel deploy hook?
The deploy hook reuses the same git SHA, so Vercel's CDN doesn't
invalidate the homepage cache. A real commit forces proper
invalidation.

## Managing the schedule

### Check if the job is loaded
```
launchctl list | grep teenacne
```

### View logs
```
tail -f /Users/tobiasnervik/Claude/teen-acne-blog/scripts/daily-rebuild.log
```

### Manually trigger a rebuild
```
/Users/tobiasnervik/Claude/teen-acne-blog/scripts/daily-rebuild.sh
```

### Change the schedule
Edit `~/Library/LaunchAgents/com.dtcvikings.teenacne-rebuild.plist`,
then reload:
```
launchctl unload ~/Library/LaunchAgents/com.dtcvikings.teenacne-rebuild.plist
launchctl load ~/Library/LaunchAgents/com.dtcvikings.teenacne-rebuild.plist
```

### Disable
```
launchctl unload ~/Library/LaunchAgents/com.dtcvikings.teenacne-rebuild.plist
```

## Requirements

- Mac must be powered on at 9:13 AM (launchd will run it when the
  Mac next wakes up if asleep at that time)
- Git credentials must be configured (they are — you can push
  normally)
- The repo must be at `/Users/tobiasnervik/Claude/teen-acne-blog/`
