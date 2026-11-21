import AVFoundation
let src = URL(fileURLWithPath: CommandLine.arguments[1]), dst = URL(fileURLWithPath: CommandLine.arguments[2])
try? FileManager.default.removeItem(at: dst)
let ex = AVAssetExportSession(asset: AVURLAsset(url: src), presetName: AVAssetExportPresetPassthrough)!
ex.outputURL = dst; ex.outputFileType = .mp4; ex.shouldOptimizeForNetworkUse = true
let sem = DispatchSemaphore(value: 0); ex.exportAsynchronously { sem.signal() }; sem.wait()
print(ex.status == .completed ? "ok" : "failed \(String(describing: ex.error))")
