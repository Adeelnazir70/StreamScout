/**
 * TVMaze has show information but no video, and real episodes need a licence.
 * So every show plays one of these free, public HLS test streams instead.
 * They're commonly used for testing video players, so they're safe to use here.
 */
export interface SampleStream {
  id: string;
  title: string;
  uri: string;
}

export const SAMPLE_STREAMS: readonly SampleStream[] = [
  {
    id: 'big-buck-bunny',
    title: 'Big Buck Bunny',
    uri: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  },
  {
    id: 'tears-of-steel',
    title: 'Tears of Steel',
    uri: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8',
  },
  {
    id: 'apple-bipbop',
    title: 'Apple HLS test stream',
    uri: 'https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8',
  },
];

/** Same show always gets the same stream, so it doesn't feel random. */
export function pickSampleStream(showId: number): SampleStream {
  const index = Math.abs(Math.trunc(showId)) % SAMPLE_STREAMS.length;
  return SAMPLE_STREAMS[index];
}
