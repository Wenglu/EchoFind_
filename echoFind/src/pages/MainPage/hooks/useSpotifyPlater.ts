import { useState, useEffect, useCallback } from "react";

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

interface Track {
  id: string;
  name: string;
  artists: string;
  album: string;
  cover: string;
  uri: string;
}

export const useSpotifyPlayer = (accessToken: string | null) => {
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    console.log("🎵 [PLAYER] Initializing...");

    const initPlayer = () => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "EchoFind Player",
        getOAuthToken: (cb: (token: string) => void) => {
          cb(accessToken);
        },
        volume: 0.5,
      });

      spotifyPlayer.addListener("ready", ({ device_id }: any) => {
        console.log("✅ [PLAYER] Ready, Device ID:", device_id);
        setDeviceId(device_id);
        setIsReady(true);
      });

      spotifyPlayer.addListener("not_ready", () => {
        console.log("❌ [PLAYER] Not ready");
        setIsReady(false);
      });

      spotifyPlayer.addListener("player_state_changed", (state: any) => {
        if (!state) return;

        setIsPlaying(!state.paused);

        if (state.track_window?.current_track) {
          const track = state.track_window.current_track;
          setCurrentTrack({
            id: track.id,
            name: track.name,
            artists: track.artists.map((a: any) => a.name).join(", "),
            album: track.album.name,
            cover: track.album.images[0]?.url || "",
            uri: track.uri,
          });
        }
      });

      spotifyPlayer.addListener("authentication_error", ({ message }: any) => {
        console.error("❌ [PLAYER] Auth error:", message);
      });

      spotifyPlayer.connect();
      setPlayer(spotifyPlayer);
    };

    if (window.Spotify) {
      initPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;

      if (
        !document.querySelector(
          'script[src="https://sdk.scdn.co/spotify-player.js"]'
        )
      ) {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      if (player) player.disconnect();
    };
  }, [accessToken]);

  const playTrack = useCallback(
    async (trackUri: string) => {
      if (!deviceId || !accessToken) {
        console.warn("⚠️ [PLAYER] Not ready");
        return false;
      }

      try {
        const response = await fetch(
          `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ uris: [trackUri] }),
          }
        );

        if (response.ok) {
          console.log("✅ [PLAYER] Playing:", trackUri);
          return true;
        } else {
          console.error("❌ [PLAYER] Play failed:", response.status);
          return false;
        }
      } catch (error) {
        console.error("❌ [PLAYER] Error:", error);
        return false;
      }
    },
    [deviceId, accessToken]
  );

  const togglePlay = useCallback(async () => {
    if (player) {
      await player.togglePlay();
    }
  }, [player]);

  return {
    isReady,
    isPlaying,
    currentTrack,
    playTrack,
    togglePlay,
  };
};
