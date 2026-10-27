// Encode a folder of PNG frames into an H.264 MP4 with AVFoundation (no ffmpeg needed).
// Usage: swiftc -O encode.swift -o encode && ./encode <framesDir> <out.mp4> [fps=30] [bitrate=16000000]
import AVFoundation
import CoreGraphics
import Foundation
import ImageIO

let args = CommandLine.arguments
guard args.count >= 3 else { print("usage: encode <framesDir> <out.mp4> [fps] [bitrate]"); exit(1) }
let dir = URL(fileURLWithPath: args[1]), out = URL(fileURLWithPath: args[2])
let fps = Int32(args.count > 3 ? Int(args[3])! : 30)
let bitrate = args.count > 4 ? Int(args[4])! : 16_000_000

let files = try FileManager.default.contentsOfDirectory(at: dir, includingPropertiesForKeys: nil)
  .filter { $0.pathExtension == "png" }
  .sorted { $0.lastPathComponent < $1.lastPathComponent }
func load(_ url: URL) -> CGImage {
  guard let src = CGImageSourceCreateWithURL(url as CFURL, nil), let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else {
    fatalError("cannot read \(url.path)")
  }
  return img
}
guard !files.isEmpty else { fatalError("no frames in \(dir.path)") }
let first = load(files[0])
let w = first.width, h = first.height

try? FileManager.default.removeItem(at: out)
let writer = try AVAssetWriter(outputURL: out, fileType: .mp4)
writer.shouldOptimizeForNetworkUse = true // index at the front, so the clip starts streaming at once
let settings: [String: Any] = [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: w,
  AVVideoHeightKey: h,
  AVVideoColorPropertiesKey: [
    AVVideoColorPrimariesKey: AVVideoColorPrimaries_ITU_R_709_2,
    AVVideoTransferFunctionKey: AVVideoTransferFunction_ITU_R_709_2,
    AVVideoYCbCrMatrixKey: AVVideoYCbCrMatrix_ITU_R_709_2,
  ],
  AVVideoCompressionPropertiesKey: [
    AVVideoAverageBitRateKey: bitrate,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel,
    AVVideoMaxKeyFrameIntervalKey: Int(fps) * 2,
    AVVideoExpectedSourceFrameRateKey: Int(fps),
  ],
]
let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
  kCVPixelBufferWidthKey as String: w,
  kCVPixelBufferHeightKey as String: h,
])
writer.add(input)
guard writer.startWriting() else { fatalError("cannot start: \(String(describing: writer.error))") }
writer.startSession(atSourceTime: .zero)
let space = CGColorSpace(name: CGColorSpace.sRGB)!

for (i, url) in files.enumerated() {
  autoreleasepool {
    let img = load(url)
    precondition(img.width == w && img.height == h, "frame \(url.lastPathComponent) is \(img.width)x\(img.height), expected \(w)x\(h)")
    while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.002) }
    var made: CVPixelBuffer?
    CVPixelBufferPoolCreatePixelBuffer(nil, adaptor.pixelBufferPool!, &made)
    let buf = made!
    CVPixelBufferLockBaseAddress(buf, [])
    let ctx = CGContext(data: CVPixelBufferGetBaseAddress(buf), width: w, height: h, bitsPerComponent: 8,
                        bytesPerRow: CVPixelBufferGetBytesPerRow(buf), space: space,
                        bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue)!
    ctx.draw(img, in: CGRect(x: 0, y: 0, width: w, height: h))
    CVPixelBufferUnlockBaseAddress(buf, [])
    if !adaptor.append(buf, withPresentationTime: CMTime(value: CMTimeValue(i), timescale: fps)) {
      fatalError("append failed at frame \(i): \(String(describing: writer.error))")
    }
  }
}
input.markAsFinished()
let finished = DispatchSemaphore(value: 0)
writer.finishWriting { finished.signal() }
finished.wait()
guard writer.status == .completed else { print("failed: \(String(describing: writer.error))"); exit(1) }
print("wrote \(out.lastPathComponent) · \(files.count) frames · \(w)x\(h) @ \(fps) fps · \(bitrate / 1_000_000) Mbps")
