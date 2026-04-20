import Cocoa
import WebKit

class AppDelegate: NSObject, NSApplicationDelegate, WKUIDelegate {
    var window: NSWindow!
    var webView: WKWebView!

    func applicationDidFinishLaunching(_ aNotification: Notification) {
        // 1. Create the Window
        let screenRect = NSScreen.main?.frame ?? NSRect(x: 0, y: 0, width: 1280, height: 800)
        let windowRect = NSRect(x: 0, y: 0, width: 1024, height: 768)
        
        window = NSWindow(
            contentRect: windowRect,
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered, defer: false)
        
        window.center()
        window.title = "Chronograph Attendance System"
        window.makeKeyAndOrderFront(nil)

        // 2. Configure WebKit to allow camera access
        let config = WKWebViewConfiguration()
        config.preferences.setValue(true, forKey: "developerExtrasEnabled")
        
        // Allow camera/microphone access
        if #available(macOS 12.0, *) {
            config.preferences.setValue(true, forKey: "mediaCaptureRequiresGetUserMediaId")
        }

        webView = WKWebView(frame: .zero, configuration: config)
        webView.uiDelegate = self
        window.contentView = webView
        
        // 3. Load the bundled index.html
        if let resourceURL = Bundle.main.resourceURL {
            let url = resourceURL.appendingPathComponent("index.html")
            webView.loadFileURL(url, allowingReadAccessTo: resourceURL)
        } else {
            print("Could not find resources bundle")
        }
    }

    // Explicitly grant permission for camera/microphone access
    @available(macOS 12.0, *)
    func webView(_ webView: WKWebView, requestMediaCapturePermissionFor origin: WKSecurityOrigin, initiatedByFrame frame: WKFrameInfo, type: WKMediaCaptureType, decisionHandler: @escaping (WKPermissionDecision) -> Void) {
        decisionHandler(.grant)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.run()
