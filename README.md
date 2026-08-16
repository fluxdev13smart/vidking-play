# VidKing Embed Player

Generated Code

Generated URL

Embed URL:Copy

https://www.vidking.net/embed/movie/1078605

HTML Code

<iframe src="https://www.vidking.net/embed/movie/1078605" width="100%" height="600" frameborder="0" allowfullscreen> </iframe>

API Documentation

Everything you need to integrate Vidking Player into your website

Simple Integration

Just one iframe tag - no complex setup required

Lightning Fast

Optimized for performance with HLS.js and modern streaming

Isolated Storage

Each configuration uses separate localStorage - no conflicts

Full Documentation

Complete API reference with examples and best practices

API Routes

Movies

/embed/movie/{tmdbId}

Replace {tmdbId} with the TMDB movie ID

TV Series

/embed/tv/{tmdbId}/{season}/{episode}

Specify the show ID, season number, and episode number

URL Parameters

ParameterTypeDescriptionExamplecolorstringPrimary color (hex without #)?color=ff0000autoPlaybooleanEnable auto-play feature?autoPlay=truenextEpisodebooleanShow next episode button (TV only)?nextEpisode=trueepisodeSelectorbooleanEnable episode selection menu (TV only)?episodeSelector=trueprogressnumberStart time in seconds?progress=120

Watch Progress Tracking

The player can send watch progress events to the parent window. You can save this progress to localStorage or your own backend. Here's a complete example:

Progress Tracking Script

// Add this script to your website
window.addEventListener("message", function (event) {
  // console.log("event: ", event);
  console.log("Message received from the player: ", JSON.parse(event.data)); // Message received from player
  if (typeof event.data === "string") {
    var messageArea = document.querySelector("#messageArea");
    messageArea.innerText = event.data;
  }
});

The player sends progress updates containing:

id: Content ID

type: Content type (movie/tv)

progress: Watch progress percentage

timestamp: Current playback position in seconds

duration: Total duration in seconds

season: Season number (for TV shows)

episode: Episode number (for TV shows)

Events Sent

timeupdate - Continuous progress during playback

play - When video starts

pause - When video pauses

ended - When video ends

seeked - When user seeks to different time

Event Data Structure

{
  "type": "PLAYER_EVENT",
  "data": {
    "event": "timeupdate|play|pause|ended|seeked",
    "currentTime": 120.5,
    "duration": 7200,
    "progress": 1.6,
    "id": "299534",
    "mediaType": "movie",
    "season": 1,
    "episode": 8,
    "timestamp": 1640995200000
  }
}

Code Examples

Basic Movie Player

Simple movie player without extra features

Preview

<iframe 
  src="https://www.vidking.net/embed/movie/1078605" 
  width="100%" 
  height="600" 
  frameborder="0" 
  allowfullscreen>
</iframe>

TV Series with All Features

TV player with custom color and all features enabled

Preview

<iframe 
  src="https://www.vidking.net/embed/tv/119051/1/8?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true" 
  width="100%" 
  height="600" 
  frameborder="0" 
  allowfullscreen>
</iframe>

Custom Branded Player

Player with custom brand colors and autoplay

Preview

<iframe 
  src="https://www.vidking.net/embed/movie/1078605?color=9146ff&autoPlay=true" 
  width="100%" 
  height="600" 
  frameborder="0" 
  allowfullscreen>
</iframe>

Player with Start Time

Start video at 2 minutes (120 seconds) with custom color

Preview

<iframe 
  src="https://www.vidking.net/embed/movie/1078605?color=e50914&progress=120&autoPlay=true" 
  width="100%" 
  height="600" 
  frameborder="0" 
  allowfullscreen>
</iframe>


(using this skill) make a tv apple, with all animations and etc.

make a player, make it tv browser friendly, give user link to go to tmdb, get the id

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://vidking-play.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/056ad211-70a0-41c2-85a1-92d1058dc81c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
