import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  HWEvent,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useTVEventHandler,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Video, {
  OnLoadData,
  OnProgressData,
  OnVideoErrorData,
  VideoRef,
} from 'react-native-video';
import { pickSampleStream } from '../api/streams';
import { FocusButton } from '../components/FocusButton';
import { ErrorView } from '../components/StateViews';
import { useAutoHideControls } from '../hooks/useAutoHideControls';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { colors, fontSize, isTV, spacing } from '../theme';
import { clampTime, formatTime, toProgress } from '../utils/time';

type Props = NativeStackScreenProps<RootStackParamList, 'Player'>;

const SEEK_STEP = 10;

export function PlayerScreen({ route, navigation }: Props) {
  const { showId, showName } = route.params;
  const stream = pickSampleStream(showId);
  const insets = useSafeAreaInsets();
  const videoRef = useRef<VideoRef>(null);

  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isBuffering, setIsBuffering] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Changing the key remounts <Video>, which is the cleanest way to retry.
  const [attempt, setAttempt] = useState(0);

  const {
    visible: controlsVisible,
    show: showControls,
    hide: hideControls,
  } = useAutoHideControls(!paused && !error);

  // While seeking with the remote we show only the progress bar, not the
  // buttons. If the buttons appeared, the next left/right press would move
  // focus between them instead of seeking again.
  const [remoteSeeking, setRemoteSeeking] = useState(false);
  const remoteSeekTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The remote handler reads these, so keep them in refs to avoid
  // re-subscribing to remote events on every progress update.
  const timeRef = useRef(0);
  const controlsVisibleRef = useRef(true);
  timeRef.current = currentTime;
  controlsVisibleRef.current = controlsVisible;

  const seekTo = useCallback(
    (delta: number) => {
      const target = clampTime(timeRef.current + delta, duration);
      // Update the ref straight away so fast repeated presses add up,
      // instead of all starting from the same stale time.
      timeRef.current = target;
      videoRef.current?.seek(target);
      setCurrentTime(target);
      setEnded(false);
    },
    [duration],
  );

  // On-screen buttons: seek and keep the controls awake.
  const seekBy = useCallback(
    (delta: number) => {
      seekTo(delta);
      showControls();
    },
    [seekTo, showControls],
  );

  // Remote arrows and media keys: seek and show just the progress bar.
  const remoteSeekBy = useCallback(
    (delta: number) => {
      seekTo(delta);
      setRemoteSeeking(true);
      if (remoteSeekTimer.current) {
        clearTimeout(remoteSeekTimer.current);
      }
      remoteSeekTimer.current = setTimeout(() => setRemoteSeeking(false), 1500);
    },
    [seekTo],
  );

  useEffect(
    () => () => {
      if (remoteSeekTimer.current) {
        clearTimeout(remoteSeekTimer.current);
      }
    },
    [],
  );

  const togglePlay = useCallback(() => {
    if (ended) {
      videoRef.current?.seek(0);
      setEnded(false);
      setPaused(false);
    } else {
      setPaused(p => !p);
    }
    showControls();
  }, [ended, showControls]);

  const retry = () => {
    setError(null);
    setIsBuffering(true);
    setAttempt(a => a + 1);
  };

  // Pause when the app goes to the background (home button, phone call...).
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') {
        setPaused(true);
      }
    });
    return () => sub.remove();
  }, []);

  // TV remote. Android sends each key twice (down and up), so we only act on
  // key up. When the controls are hidden, left/right seek straight away,
  // like on Netflix or YouTube. When they're showing, left/right move focus
  // between the buttons instead, so we only keep the controls awake.
  const onRemoteEvent = useCallback(
    (event: HWEvent) => {
      if (event.eventKeyAction === 0) {
        return;
      }
      switch (event.eventType) {
        case 'playPause':
          togglePlay();
          break;
        case 'fastForward':
          remoteSeekBy(SEEK_STEP);
          break;
        case 'rewind':
          remoteSeekBy(-SEEK_STEP);
          break;
        case 'left':
        case 'right':
          if (controlsVisibleRef.current) {
            showControls();
          } else {
            remoteSeekBy(event.eventType === 'right' ? SEEK_STEP : -SEEK_STEP);
          }
          break;
        case 'up':
        case 'down':
        case 'select':
          showControls();
          break;
      }
    },
    [togglePlay, remoteSeekBy, showControls],
  );
  useTVEventHandler(onRemoteEvent);

  const onLoad = (data: OnLoadData) => {
    setDuration(data.duration);
    setIsBuffering(false);
  };

  const onProgress = (data: OnProgressData) => {
    setCurrentTime(data.currentTime);
    setBuffered(data.playableDuration);
  };

  const onError = (data: OnVideoErrorData) => {
    setError(
      data.error.errorString ??
        data.error.localizedDescription ??
        'The stream could not be played.',
    );
    setIsBuffering(false);
  };

  const onEnd = () => {
    setEnded(true);
    setPaused(true);
  };

  const playLabel = ended ? '↺  Replay' : paused ? '▶  Play' : '❚❚  Pause';

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Video
        key={attempt}
        ref={videoRef}
        source={{ uri: stream.uri, type: 'm3u8' }}
        style={StyleSheet.absoluteFill}
        resizeMode="contain"
        paused={paused}
        progressUpdateInterval={500}
        ignoreSilentSwitch="ignore"
        onLoad={onLoad}
        onProgress={onProgress}
        onBuffer={({ isBuffering: buffering }) => setIsBuffering(buffering)}
        onError={onError}
        onEnd={onEnd}
      />

      {/* Phones: tap anywhere to show or hide the controls. On TV this
          would be an extra focus stop, so it's left out. */}
      {!isTV ? (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={controlsVisible ? hideControls : showControls}
          accessibilityLabel={
            controlsVisible ? 'Hide controls' : 'Show controls'
          }
        />
      ) : null}

      {isBuffering && !error ? (
        <View style={styles.center} pointerEvents="none">
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : null}

      {error ? (
        <View style={[StyleSheet.absoluteFill, styles.errorLayer]}>
          <ErrorView message={error} onRetry={retry} />
        </View>
      ) : null}

      {controlsVisible && !error ? (
        <View style={[styles.topBar, { paddingTop: insets.top + spacing.md }]}>
          {!isTV ? (
            <FocusButton label="‹  Back" onPress={navigation.goBack} />
          ) : null}
          <View style={styles.titleBlock}>
            <Text style={styles.title} numberOfLines={1}>
              {showName}
            </Text>
            <Text style={styles.subtitle} numberOfLines={1}>
              Sample stream · {stream.title}
            </Text>
          </View>
        </View>
      ) : null}

      {(controlsVisible || remoteSeeking) && !error ? (
        <View
          style={[
            styles.bottomBar,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
        >
          <View style={styles.progressRow}>
            <Text style={styles.time}>{formatTime(currentTime)}</Text>
            <View style={styles.track}>
              <View
                style={[
                  styles.buffered,
                  { width: `${toProgress(buffered, duration) * 100}%` },
                ]}
              />
              <View
                style={[
                  styles.played,
                  { width: `${toProgress(currentTime, duration) * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.time}>{formatTime(duration)}</Text>
          </View>

          {controlsVisible ? (
            <View style={styles.buttons}>
              <FocusButton label="« 10s" onPress={() => seekBy(-SEEK_STEP)} />
              <FocusButton
                label={playLabel}
                variant="primary"
                onPress={togglePlay}
                hasTVPreferredFocus={isTV}
              />
              <FocusButton label="10s »" onPress={() => seekBy(SEEK_STEP)} />
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const OVERLAY = 'rgba(0, 0, 0, 0.6)';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorLayer: { backgroundColor: colors.background },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: OVERLAY,
  },
  titleBlock: { flex: 1 },
  title: { color: colors.text, fontSize: fontSize.lg, fontWeight: '700' },
  subtitle: { color: colors.textMuted, fontSize: fontSize.sm, marginTop: 2 },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: OVERLAY,
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  time: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontVariant: ['tabular-nums'],
    minWidth: 44,
    textAlign: 'center',
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  buffered: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  played: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.accent,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
