/* eslint-env node, browser */
/* global CompressionStream */
import pako from 'pako'

let supportsCompressionStream = null

export async function deflate(buffer) {
  if (supportsCompressionStream === null) {
    supportsCompressionStream = testCompressionStream()
  }
  return supportsCompressionStream
    ? browserDeflate(buffer)
    : pako.deflate(buffer)
}

async function browserDeflate(buffer) {
  const cs = new CompressionStream('deflate')
  const c = new Blob([buffer]).stream().pipeThrough(cs)
  return new Uint8Array(await new Response(c).arrayBuffer())
}

function testCompressionStream() {
  try {
    const cs = new CompressionStream('deflate')
    // Test if `Blob.stream` is present. React Native does not have the `stream` method
    const stream = new Blob([]).stream()
    // Clean up so that a resource is not left dangling, causing Deno tests to fail
    stream.cancel()
    if (cs) return true
  } catch (_) {
    // no bother
  }
  return false
}
