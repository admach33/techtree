// Check an encoded clip: duration, frame rate, size, codec, fast start, and frames decoded back out of the file.
// Usage: swift probe.swift <clip.mp4> <outPrefix> [seconds...]
import AVFoundation
import Foundation
import ImageIO
import UniformTypeIdentifiers

let args = CommandLine.arguments
let url = URL(fileURLWithPath: args[1]), prefix = args[2]
let times = args.count > 3 ? args[3...].compactMap(Double.init) : [2.5, 8.5, 14.5]
let asset = AVURLAsset(url: url)
let sem = DispatchSemaphore(value: 0)
Task {
  do {
    let duration = try await asset.load(.duration)
    guard let track = try await asset.loadTracks(withMediaType: .video).first else { print("no video track"); exit(1) }
    let (size, fps, formats) = try await track.load(.naturalSize, .nominalFrameRate, .formatDescriptions)
    let codec = formats.first.map { CMFormatDescriptionGetMediaSubType($0) }.map { String(format: "%c%c%c%c", ($0 >> 24) & 255, ($0 >> 16) & 255, ($0 >> 8) & 255, $0 & 255) } ?? "?"
    let data = try Data(contentsOf: url, options: .alwaysMapped)
    // fast start: the moov box comes before mdat
    let head = data.prefix(4096)
    let moov = head.range(of: Data("moov".utf8)) != nil
    print(String(format: "%@ · %.2f s · %.2f fps · %dx%d · %@ · %.1f MB · moov first: %@", url.lastPathComponent, duration.seconds, fps,
                 Int(size.width), Int(size.height), codec, Double(data.count) / 1_000_000, moov ? "yes" : "no"))
    let gen = AVAssetImageGenerator(asset: asset)
    gen.requestedTimeToleranceBefore = .zero
    gen.requestedTimeToleranceAfter = .zero
    for t in times {
      let (img, _) = try await gen.image(at: CMTime(seconds: t, preferredTimescale: 600))
      let out = URL(fileURLWithPath: "\(prefix)-\(t)s.png")
      let dest = CGImageDestinationCreateWithURL(out as CFURL, UTType.png.identifier as CFString, 1, nil)!
      CGImageDestinationAddImage(dest, img, nil)
      CGImageDestinationFinalize(dest)
      print("  frame at \(t) s → \(out.lastPathComponent)")
    }
  } catch { print("probe failed: \(error)"); exit(1) }
  sem.signal()
}
sem.wait()
