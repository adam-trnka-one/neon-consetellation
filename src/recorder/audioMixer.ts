/**
 * Mixes any number of input streams (microphone, system audio) into a single
 * audio track suitable for the recorder. Sources are keyed so they can be
 * swapped or removed independently as the user toggles inputs.
 */
export class AudioMixer {
  private ctx: AudioContext
  private dest: MediaStreamAudioDestinationNode
  private sources = new Map<string, MediaStreamAudioSourceNode>()

  constructor() {
    this.ctx = new AudioContext()
    this.dest = this.ctx.createMediaStreamDestination()
  }

  setSource(key: string, stream: MediaStream | null) {
    const existing = this.sources.get(key)
    if (existing) {
      existing.disconnect()
      this.sources.delete(key)
    }
    if (stream && stream.getAudioTracks().length > 0) {
      const node = this.ctx.createMediaStreamSource(stream)
      node.connect(this.dest)
      this.sources.set(key, node)
    }
  }

  hasAudio(): boolean {
    return this.sources.size > 0
  }

  get stream(): MediaStream {
    return this.dest.stream
  }

  async resume() {
    if (this.ctx.state === 'suspended') await this.ctx.resume()
  }

  close() {
    this.sources.forEach((s) => s.disconnect())
    this.sources.clear()
    void this.ctx.close()
  }
}
