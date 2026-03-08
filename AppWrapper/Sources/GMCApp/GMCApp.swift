import SwiftUI
import WebKit

@main
struct GMCApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .windowStyle(.hiddenTitleBar)
    }
}

struct ContentView: View {
    var body: some View {
        GMCWebView()
            .edgesIgnoringSafeArea(.all)
            .frame(minWidth: 1280, minHeight: 800)
    }
}

struct GMCWebView: NSViewRepresentable {
    func makeNSView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.preferences.setValue(true, forKey: "developerExtrasEnabled")
        
        // Allow file access for local assets
        config.setValue(true, forKey: "allowUniversalAccessFromFileURLs")
        
        let webView = WKWebView(frame: .zero, configuration: config)
        
        if let bundlePath = Bundle.main.resourcePath {
            let distPath = URL(fileURLWithPath: bundlePath).appendingPathComponent("dist")
            let indexPath = distPath.appendingPathComponent("index.html")
            
            if FileManager.default.fileExists(atPath: indexPath.path) {
                webView.loadFileURL(indexPath, allowingReadAccessTo: distPath)
            } else {
                // Fallback or error handling
                let errorHtml = "<html><body><h1>Error: dist/index.html not found</h1><p>\(indexPath.path)</p></body></html>"
                webView.loadHTMLString(errorHtml, baseURL: nil)
            }
        }
        
        return webView
    }
    
    func updateNSView(_ nsView: WKWebView, context: Context) {}
}
